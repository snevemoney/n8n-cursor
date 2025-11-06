# 🚀 Simple n8n - Your Way In (Remembers Everything)

## 🎯 **One Command to Get Everything Working**

```bash
./enter-n8n.sh
```

That's it! This script remembers everything and gets you into n8n instantly.

## 🔧 **Quick Commands**

| Command | What It Does |
|---------|--------------|
| `./enter-n8n.sh` | **MAIN ENTRY** - Gets you into n8n (remembers everything) |
| `./start-n8n.sh` | Start n8n manually |
| `./stop-n8n.sh` | Stop n8n safely |
| `./status-n8n.sh` | Check if n8n is running |
| `./safe-cleanup.sh` | Safe cleanup (never deletes important data) |

## 🛡️ **Safety Features (Safe Mode)**

- ✅ **Database is PROTECTED** - Never deleted
- ✅ **Workflows are SAFE** - All 21MB of data protected
- ✅ **Credentials are SECURE** - All your settings preserved
- ✅ **Auto-restart 24/7** - Runs continuously
- ✅ **Data Guardian Active** - Prevents accidental deletion

## 🌐 **Access Your n8n**

- **Web Interface**: https://n8ncloud.tech
- **Local Access**: http://localhost:5678
- **Login**: Use your existing credentials

## 🚀 **24/7 Auto-Start Setup**

To enable 24/7 operation:

```bash
./setup-24-7.sh
```

This will:
- Start n8n automatically on boot
- Restart automatically if it crashes
- Run continuously with maximum safety

## 📁 **What's Protected (Never Deleted)**

- `/home/n8n/.n8n/` - Your main database and workflows
- `/home/evens/n8n-cursor/` - Your project files
- All n8n configurations and credentials
- All workflow data and settings

## 💡 **How It Works**

1. **Native Installation**: Uses your existing `/usr/bin/n8n` (not Docker)
2. **Proper Permissions**: Runs as `n8n` user with full database access
3. **Systemd Service**: Managed by systemd for reliability
4. **Auto-Restart**: Automatically recovers from any issues
5. **Data Protection**: Multiple layers prevent data loss

## 🎉 **You're All Set!**

Your n8n remembers everything:
- ✅ All your workflows
- ✅ All your credentials  
- ✅ All your settings
- ✅ All your data

Just run `./enter-n8n.sh` and you're in!
