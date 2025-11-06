#!/usr/bin/env bash
set -euo pipefail

echo "=== CRYPTO-MINING SECURITY HARDENING ==="
echo "This script implements comprehensive protection against crypto-mining malware"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root for security reasons"
   exit 1
fi

echo "[1] SSH Hardening"
echo "Disabling password authentication and root login..."
sudo sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload ssh
echo "SSH hardened ✓"

echo "[2] UFW Firewall Setup"
echo "Configuring UFW with secure defaults..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw --force enable
echo "UFW configured ✓"

echo "[3] Blocking Common Mining Ports at Host Level"
echo "Blocking outbound connections to common mining ports..."
sudo ufw deny out 3333/tcp
sudo ufw deny out 4444/tcp
sudo ufw deny out 5555/tcp
sudo ufw deny out 7777/tcp
sudo ufw deny out 8080/tcp  # Common mining pool port
sudo ufw deny out 9999/tcp  # Common mining pool port
sudo ufw reload
echo "Mining ports blocked at host level ✓"

echo "[4] Docker-level Egress Policy"
echo "Setting up iptables rules to block mining ports from containers..."
sudo iptables -I DOCKER-USER -p tcp --dport 3333 -j REJECT
sudo iptables -I DOCKER-USER -p tcp --dport 4444 -j REJECT
sudo iptables -I DOCKER-USER -p tcp --dport 5555 -j REJECT
sudo iptables -I DOCKER-USER -p tcp --dport 7777 -j REJECT
sudo iptables -I DOCKER-USER -p tcp --dport 8080 -j REJECT
sudo iptables -I DOCKER-USER -p tcp --dport 9999 -j REJECT

# Save iptables rules
if command -v netfilter-persistent >/dev/null 2>&1; then
    sudo netfilter-persistent save
elif [ -d /etc/iptables ]; then
    sudo sh -c 'iptables-save > /etc/iptables/rules.v4'
else
    echo "Warning: Could not save iptables rules persistently"
fi
echo "Docker egress policy configured ✓"

echo "[5] DNS Sinkhole (Quad9)"
echo "Configuring DNS to block known malware domains..."
echo -e "nameserver 9.9.9.9\nnameserver 149.112.112.112" | sudo tee /etc/resolv.conf >/dev/null
echo "DNS sinkhole configured ✓"

echo "[6] Installing Security Packages"
echo "Installing fail2ban, auditd, and unattended-upgrades..."
sudo apt update && sudo apt install -y fail2ban auditd unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
echo "Security packages installed ✓"

echo "[7] Fail2ban Configuration"
echo "Configuring fail2ban for SSH protection..."
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
echo "Fail2ban configured ✓"

echo "[8] Auditd Configuration"
echo "Setting up auditd to monitor suspicious activities..."
sudo tee /etc/audit/rules.d/crypto-mining.rules > /dev/null <<EOF
# Monitor execution from temp directories
-w /tmp -p x -k crypto_mining
-w /var/tmp -p x -k crypto_mining
-w /dev/shm -p x -k crypto_mining

# Monitor cron changes
-w /etc/crontab -p wa -k cron_changes
-w /etc/cron.d -p wa -k cron_changes
-w /var/spool/cron -p wa -k cron_changes

# Monitor systemd service changes
-w /etc/systemd/system -p wa -k systemd_changes
-w /lib/systemd/system -p wa -k systemd_changes
EOF

sudo systemctl enable auditd
sudo systemctl restart auditd
echo "Auditd configured ✓"

echo "[9] Setting up CPU monitoring cron job"
echo "Adding CPU spike detection..."
(crontab -l 2>/dev/null; echo '*/5 * * * * mpstat 1 1 | awk "NR==4{if($12<70) print strftime(),\"High CPU: \",100-$12\"%\"}" >> ~/cpu_watch.log') | crontab -
echo "CPU monitoring configured ✓"

echo ""
echo "=== SECURITY HARDENING COMPLETE ==="
echo ""
echo "Next steps:"
echo "1. Run: bash scripts/malware_scan.sh (to check current state)"
echo "2. Monitor ~/cpu_watch.log for CPU spikes"
echo "3. Check fail2ban status: sudo fail2ban-client status"
echo "4. Review audit logs: sudo ausearch -k crypto_mining"
echo ""
echo "Your system is now hardened against crypto-mining malware!"
