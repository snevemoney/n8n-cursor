#!/usr/bin/env bash
# SSH Hardening Script - Print commands only, don't execute
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/lib.sh"

log_info "SSH Hardening Guide"
log_info "=================="

log_info "Current SSH configuration:"
if [[ -f /etc/ssh/sshd_config ]]; then
  log_info "Key authentication: $(grep -E '^PubkeyAuthentication' /etc/ssh/sshd_config || echo 'Not explicitly set')"
  log_info "Password authentication: $(grep -E '^PasswordAuthentication' /etc/ssh/sshd_config || echo 'Not explicitly set')"
  log_info "Root login: $(grep -E '^PermitRootLogin' /etc/ssh/sshd_config || echo 'Not explicitly set')"
else
  log_warn "SSH config not found at /etc/ssh/sshd_config"
fi

log_info ""
log_info "Recommended SSH hardening commands:"
log_info "1. Backup current config:"
echo "sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)"

log_info ""
log_info "2. Apply secure settings:"
cat << 'EOF'
sudo tee -a /etc/ssh/sshd_config.secure << 'SSHEOF'
# Security hardening
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ChallengeResponseAuthentication no
UsePAM no
X11Forwarding no
PrintMotd no
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxSessions 10
Protocol 2
SSHEOF

sudo mv /etc/ssh/sshd_config.secure /etc/ssh/sshd_config
EOF

log_info ""
log_info "3. Test SSH config:"
echo "sudo sshd -t"

log_info ""
log_info "4. Restart SSH service:"
echo "sudo systemctl restart sshd"

log_info ""
log_info "5. Install fail2ban:"
cat << 'EOF'
sudo apt update
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
EOF

log_info ""
log_info "6. Configure fail2ban for SSH:"
cat << 'EOF'
sudo tee /etc/fail2ban/jail.local << 'F2BEOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
F2BEOF

sudo systemctl restart fail2ban
EOF

log_info ""
log_info "7. Check fail2ban status:"
echo "sudo fail2ban-client status"
echo "sudo fail2ban-client status sshd"

log_info ""
log_warn "IMPORTANT: Test SSH access in a separate terminal before closing this session!"
log_warn "Make sure you can still connect with your SSH key after applying changes."

log_info ""
log_info "SSH hardening guide complete. Review commands above before executing."