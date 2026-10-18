# Infrastructure

This directory contains the infrastructure-as-code and configuration-management components used to deploy the Smart Campus application.

## Architecture

- **Terraform** provisions the Azure infrastructure.
- **Ansible** configures the Linux VM over SSH.
- **k3s** provides a lightweight Kubernetes cluster.
- Existing Kubernetes manifests define the application workloads.

## Directory Structure

```text
infra/
├── terraform/       # Azure infrastructure definitions
└── ansible/
    ├── ansible.cfg
    ├── inventory/
    │   ├── hosts.ini
    │   └── hosts.example.ini
    └── playbooks/
        └── bootstrap.yml
```

The real inventory file is excluded from Git. Use `hosts.example.ini` as the template.

## Terraform

Terraform manages the Azure resource group, virtual network, subnet, network security group, public IP, network interface, and Linux VM.

From `infra/terraform/`:

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
```

Review the plan before applying any changes.

```bash
terraform apply
```

After provisioning, retrieve the VM's public IP:

```bash
terraform output -raw vm_public_ip
```

Use that address in the local Ansible inventory.

## Ansible

Ansible connects to the VM over SSH using the configured administrative user and private key.

From `infra/ansible/`:

```bash
ansible-inventory --graph
ansible-playbook --syntax-check playbooks/bootstrap.yml
```

After the VM is provisioned, its inventory is configured, and SSH access is verified:

```bash
ansible smart_campus_app_vm -m ping
ansible-playbook playbooks/bootstrap.yml
```

The bootstrap playbook prepares the VM with basic utilities. Further configuration and Kubernetes deployment tasks will be documented as they are implemented and tested.

## Security

- Never commit private SSH keys, credentials, or local inventory files.
- Restrict SSH access to the administrator's public IP.
- Keep secrets out of Terraform outputs and version control.
- Review inbound firewall rules before exposing application services.

## Cost and Cleanup

Azure resources can incur charges while running, and some attached resources may continue to incur charges after a VM is stopped.

After completing the demo and collecting the required evidence, review the Terraform plan and destroy the temporary demo infrastructure:

```bash
terraform plan -destroy
terraform destroy
```

Verify the resources have been removed in the Azure portal. Preserve the separately managed Terraform remote-state storage; do not delete it as part of routine demo cleanup.

The Azure deployment is a temporary demonstration environment, not a permanently hosted service.
