#!/bin/bash
echo "Updating n8n to latest version..."
echo "xuzGeb-xucpyz-kufpu3" | sudo -S systemctl stop n8n
echo "xuzGeb-xucpyz-kufpu3" | sudo -S npm update -g n8n
echo "xuzGeb-xucpyz-kufpu3" | sudo -S systemctl start n8n
echo "n8n updated and restarted!"
echo "xuzGeb-xucpyz-kufpu3" | sudo -S systemctl status n8n --no-pager
