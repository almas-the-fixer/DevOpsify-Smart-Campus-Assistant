# To Get the Public IP of VM we're gonna create to add it to ansible hosts..
output "vm_public_ip" {
  description = "Public IP address of the Smart Campus VM"
  value       = azurerm_public_ip.sc_public_ip.ip_address
}