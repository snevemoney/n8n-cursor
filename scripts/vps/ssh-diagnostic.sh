#!/bin/bash
# SSH Diagnostic and Fix Script
# Run this on your VPS to fix SSH connection issues

echo "🔍 SSH Diagnostic and Fix Script"
echo "================================="

# Check if we're on the right VPS
echo "📍 Checking VPS identity..."
PUBLIC_IP=$(curl -s ifconfig.me)
echo "Public IP: $PUBLIC_IP"

if [[ "$PUBLIC_IP" != "69.62.66.78" ]]; then
    echo "⚠️  Warning: This doesn't appear to be the expected VPS IP"
fi

# Check SSH service status
echo ""
echo "🔧 Checking SSH service..."
if systemctl is-active --quiet ssh; then
    echo "✅ SSH service is running"
else
    echo "❌ SSH service is not running"
    echo "Starting SSH service..."
    systemctl start ssh
    systemctl enable ssh
fi

# Check SSH port
echo ""
echo "🔌 Checking SSH port..."
if netstat -tlnp | grep -q ":22 "; then
    echo "✅ SSH is listening on port 22"
    netstat -tlnp | grep ":22 "
else
    echo "❌ SSH is not listening on port 22"
fi

# Check firewall
echo ""
echo "🔥 Checking firewall..."
if command -v ufw >/dev/null 2>&1; then
    echo "UFW status:"
    ufw status
    echo ""
    echo "Allowing SSH through firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
else
    echo "UFW not found, checking iptables..."
    if iptables -L | grep -q "22"; then
        echo "✅ Port 22 found in iptables rules"
    else
        echo "❌ Port 22 not found in iptables rules"
    fi
fi

# Check SSH configuration
echo ""
echo "⚙️  Checking SSH configuration..."
if [[ -f /etc/ssh/sshd_config ]]; then
    echo "SSH config file exists"
    if grep -q "Port 22" /etc/ssh/sshd_config; then
        echo "✅ SSH configured for port 22"
    else
        echo "⚠️  SSH port configuration:"
        grep "Port" /etc/ssh/sshd_config || echo "Using default port 22"
    fi
    
    if grep -q "PasswordAuthentication yes" /etc/ssh/sshd_config; then
        echo "✅ Password authentication enabled"
    else
        echo "⚠️  Password authentication status:"
        grep "PasswordAuthentication" /etc/ssh/sshd_config || echo "Using default (enabled)"
    fi
else
    echo "❌ SSH config file not found"
fi

# Restart SSH service
echo ""
echo "🔄 Restarting SSH service..."
systemctl restart ssh
sleep 2

# Final status check
echo ""
echo "🔍 Final SSH status check..."
if systemctl is-active --quiet ssh; then
    echo "✅ SSH service is now running"
else
    echo "❌ SSH service failed to start"
    systemctl status ssh
fi

if netstat -tlnp | grep -q ":22 "; then
    echo "✅ SSH is now listening on port 22"
    echo ""
    echo "🎉 SSH should now be accessible!"
    echo "Try connecting from Cursor again:"
    echo "  ssh root@69.62.66.78"
    echo "  or"
    echo "  ssh root@srv765579.hstgr.cloud"
else
    echo "❌ SSH still not listening on port 22"
    echo "Manual intervention may be required"
fi

echo ""
echo "📋 SSH connection test commands:"
echo "  From your local machine:"
echo "    ssh -v root@69.62.66.78"
echo "    ssh -v root@srv765579.hstgr.cloud"
echo ""
echo "  From another server:"
echo "    telnet 69.62.66.78 22"
