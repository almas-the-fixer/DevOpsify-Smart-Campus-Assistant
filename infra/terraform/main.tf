terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "smartcampusscstate"
    container_name       = "tfstate"
    key                  = "smart-campus.terraform.tfstate"
    use_azuread_auth     = true
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=5.0.0"
    }
  }
}

# Configure the Microsoft Azure Provider with v5.0 required overrides
provider "azurerm" {
  features {
    # 1. Force Terraform to catch bad locations/SKUs at plan time, not apply time
    enhanced_validation {
      locations          = true
      resource_providers = true
    }
  }
}

# Create a resource group
resource "azurerm_resource_group" "smart_campus_rg" {
  name     = "smart-campus-resource-group"
  location = "indiasouthcentral"
}

# Public IP
resource "azurerm_public_ip" "sc_public_ip" {
  name                = "acceptanceTestPublicIp1"
  resource_group_name = azurerm_resource_group.smart_campus_rg.name
  location            = azurerm_resource_group.smart_campus_rg.location
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = {
    environment = "Demo"
  }
}

# Network Interface Securrity Group Association
resource "azurerm_network_interface_security_group_association" "sc_net_sec_grp_association" {
  network_interface_id      = azurerm_network_interface.sc_nic.id
  network_security_group_id = azurerm_network_security_group.smart_campus_network_security_group.id
}

# Security Group
resource "azurerm_network_security_group" "smart_campus_network_security_group" {
  name                = "smart-campus-network-security-group"
  location            = azurerm_resource_group.smart_campus_rg.location
  resource_group_name = azurerm_resource_group.smart_campus_rg.name

  security_rule {
    name                       = "allow-ssh-from-my-ip"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "103.240.169.208/32" # Get Your Public IP and Put it Here so that ONLY YOU can SSH into the VM created but Beware it changes frequently in prod we use VPN or a Bastion Host... But Overkill for this project...
    destination_address_prefix = "*"
  } 

  security_rule {
    name                       = "allow-http-traffic" # To Check if the App is Reachable from the internet!
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "0.0.0.0/0" # Access from anywhere
    destination_address_prefix = "*"
  }

  tags = {
    environment = "Demo"
  }
}

# Virtual Network aka Azure Equivalent of AWS VPC
resource "azurerm_virtual_network" "main" {
  name                = "smart-campus-virtual-network"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.smart_campus_rg.location
  resource_group_name = azurerm_resource_group.smart_campus_rg.name
}

# Subnet for Network Interface
resource "azurerm_subnet" "sc_subnet" {
  name                 = "sc-subnet"
  resource_group_name  = azurerm_resource_group.smart_campus_rg.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Network Interface
resource "azurerm_network_interface" "sc_nic" {
  name                = "smart-campus-nic"
  location            = azurerm_resource_group.smart_campus_rg.location
  resource_group_name = azurerm_resource_group.smart_campus_rg.name

  ip_configuration {
    name                          = "testconfiguration1"
    public_ip_address_id          = azurerm_public_ip.sc_public_ip.id
    subnet_id                     = azurerm_subnet.sc_subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

# Linux Virtual Machine
resource "azurerm_linux_virtual_machine" "smart_campus_vm" {
  name                = "sc-linux-machine"
  resource_group_name = azurerm_resource_group.smart_campus_rg.name
  location            = azurerm_resource_group.smart_campus_rg.location
  size                = "Standard_B2as_v2"
  admin_username      = "scadmin"
  network_interface_ids = [
    azurerm_network_interface.sc_nic.id,
  ]

  admin_ssh_key {
    username   = "scadmin"
    public_key = file(pathexpand("~/.ssh/id_rsa.pub"))
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}
