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
        ├── bootstrap.yml
        └── install_k3s.yml
```

The real `hosts.ini` inventory is excluded from Git. Use `hosts.example.ini` as the template.

## Deployment Flow

```text
Terraform
   ↓
Azure VM
   ↓
SSH host-key acceptance
   ↓
Ansible inventory
   ↓
Ansible connectivity test
   ↓
VM bootstrap
   ↓
k3s installation
   ↓
Kubernetes application deployment
```

---

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

Keep this address available for the Ansible inventory.

---

## Connect to the VM

The VM is provisioned with the `scadmin` user and the SSH public key configured in Terraform.

The first time a newly created VM/IP is accessed, establish SSH host-key trust manually:

```bash
ssh -i ~/.ssh/id_rsa scadmin@YOUR_VM_PUBLIC_IP
```

Accept the host-key prompt, then exit:

```bash
exit
```

This adds the VM to the local SSH `known_hosts` file.

Because the demo VM may be destroyed and recreated with a different public IP, this step may be required again for a new VM.

---

## Ansible Inventory

From `infra/ansible/`, create:

```text
inventory/hosts.ini
```

Use `inventory/hosts.example.ini` as the template:

```ini
[smart_campus_app_vm]
smart-campus-vm ansible_host=YOUR_VM_PUBLIC_IP
```

Replace `YOUR_VM_PUBLIC_IP` with the address returned by Terraform.

Verify the inventory:

```bash
ansible-inventory --graph
```

The real `hosts.ini` is ignored by Git because it contains environment-specific information.

---

## Ansible

Ansible connects to the VM over SSH using the configured administrative user and private key.

Test connectivity:

```bash
ansible smart_campus_app_vm -m ping
```

A successful result should contain:

```text
"ping": "pong"
```

Verify the managed node's Python installation if needed:

```bash
ansible smart_campus_app_vm -m command -a "python3 --version"
```

### Bootstrap

Check the playbook:

```bash
ansible-playbook --syntax-check playbooks/bootstrap.yml
```

Run it:

```bash
ansible-playbook playbooks/bootstrap.yml
```

The bootstrap playbook refreshes the APT package cache and installs basic utilities such as `curl` and `git`.

### Install k3s

Once the VM has been bootstrapped:

```bash
ansible-playbook --syntax-check playbooks/install_k3s.yml
ansible-playbook playbooks/install_k3s.yml
```

The k3s playbook:

1. Refreshes the APT package cache.
2. Stops and disables UFW for the single-node demo.
3. Installs k3s using the official installer.
4. Ensures the k3s service is enabled and running.
5. Configures kubeconfig access for `scadmin`.
6. Verifies that `kubectl` is available.
7. Verifies that the k3s cluster is operational.

The final cluster check should show the VM's k3s node in `Ready` state.

---

## Troubleshooting

### Ansible cannot connect to the VM

First verify that SSH works manually:

```bash
ssh -i ~/.ssh/id_rsa scadmin@YOUR_VM_PUBLIC_IP
```

If manual SSH fails, troubleshoot SSH/network access before troubleshooting Ansible.

If SSH works but Ansible does not, verify the inventory:

```bash
ansible-inventory --graph
```

Then test:

```bash
ansible smart_campus_app_vm -m ping
```

---

### `Host key verification failed`

For a newly created VM, connect to it manually once:

```bash
ssh -i ~/.ssh/id_rsa scadmin@YOUR_VM_PUBLIC_IP
```

Accept the host key and exit.

If the IP was previously used by a different VM and the host key changed, remove the old entry:

```bash
ssh-keygen -R YOUR_VM_PUBLIC_IP
```

Then connect again and accept the new host key.

---

### `ssh_askpass` / host-key errors

If Ansible reports an error similar to:

```text
ssh_askpass: exec(.../ssh-askpass): No such file or directory
Host key verification failed.
```

Manually SSH into the VM first and accept its host key:

```bash
ssh -i ~/.ssh/id_rsa scadmin@YOUR_VM_PUBLIC_IP
```

Then retry the Ansible ping.

---

### Ansible reports a locale encoding error

If Ansible reports that the locale encoding is not UTF-8, check:

```bash
locale
locale -a
```

A UTF-8 locale such as `en_US.UTF-8` should be available.

For the current development environment, ensure the shell environment uses UTF-8:

```bash
echo $LANG
echo $LC_ALL
```

Avoid setting `LC_ALL` to a non-UTF-8 locale.

---

### Ansible reports an inventory parsing error

Verify the inventory graph:

```bash
ansible-inventory --graph
```

Check that `inventory/hosts.ini` follows the expected structure:

```ini
[smart_campus_app_vm]
smart-campus-vm ansible_host=YOUR_VM_PUBLIC_IP
```

Also make sure the command is being run from `infra/ansible/`, where `ansible.cfg` points to the correct inventory.

---

### Ansible warns about the Python interpreter

A warning such as:

```text
discovered_interpreter_python: /usr/bin/python3.10
```

is informational. It indicates which Python interpreter Ansible discovered on the managed VM.

Verify it with:

```bash
ansible smart_campus_app_vm -m command -a "python3 --version"
```

---

### k3s installation appears stuck

Check the k3s service on the VM:

```bash
sudo systemctl status k3s
```

Check recent logs:

```bash
sudo journalctl -u k3s --no-pager -n 100
```

Then verify the cluster directly:

```bash
kubectl get nodes
```

---

## Security

- Never commit private SSH keys, credentials, or local inventory files.
- Restrict SSH access to the administrator's public IP.
- Keep secrets out of Terraform outputs and version control.
- Do not expose the Kubernetes API publicly unless required.
- Review inbound firewall rules before exposing application services.
- UFW is disabled by the k3s provisioning playbook for this single-node demonstration environment; the Azure NSG remains the external network filtering layer.

---

## Cost and Cleanup

Azure resources can incur charges while running, and some attached resources may continue to incur charges after a VM is stopped.

After completing the demo and collecting the required evidence, review the destroy plan:

```bash
cd infra/terraform
terraform plan -destroy
```

Then destroy the temporary demo infrastructure:

```bash
terraform destroy
```

Verify that the temporary resources have been removed in the Azure portal.

**Preserve the separately managed Terraform remote-state storage.** Do not delete it as part of routine demo cleanup.

The Azure deployment is a temporary demonstration environment, not a permanently hosted service.