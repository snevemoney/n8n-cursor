# Monitoring & Alerting Guide

## Overview

This guide covers monitoring, alerting, and observability for the n8n-cursor project.

## Health Endpoint

### Implementation

Add a health endpoint to your n8n application:

```javascript
// Add to your n8n setup or custom server
app.get('/healthz', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'ok',  // Check DB connection
      n8n: 'ok',       // Check n8n status
      workflows: 'ok'  // Check workflow health
    },
    version: process.env.npm_package_version || 'unknown'
  };
  
  // TODO: Add actual health checks
  res.json(health);
});
```

### Health Check Command

Use the built-in health check:

```bash
make health
```

This checks:
- Docker containers (n8n, PostgreSQL)
- Network connectivity (port 5678)
- Health endpoint response
- Disk space usage
- Memory usage

## External Monitoring

### UptimeRobot Setup

1. **Sign up** at [UptimeRobot](https://uptimerobot.com)

2. **Create HTTP Monitor**:
   - **URL**: `https://your-domain.com/healthz`
   - **Type**: HTTP(s)
   - **Monitoring Interval**: 1 minute
   - **Expected Status Code**: 200

3. **Configure Alerts**:
   - Email notifications
   - Slack/Discord webhooks
   - SMS (premium)

### Alternative Monitoring Services

- **Pingdom**: Professional monitoring with detailed reports
- **StatusCake**: Free tier available
- **Uptime Kuma**: Self-hosted option

## Application Monitoring

### Error Tracking with Sentry

1. **Add Sentry DSN** to environment:
   ```bash
   export SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
   ```

2. **Configure in application**:
   ```javascript
   const Sentry = require('@sentry/node');
   
   if (process.env.SENTRY_DSN) {
     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       environment: process.env.NODE_ENV || 'production'
     });
   }
   ```

3. **Error reporting**:
   ```javascript
   try {
     // Your code
   } catch (error) {
     Sentry.captureException(error);
     throw error;
   }
   ```

## Log Management

### Centralized Logging

1. **Docker logs** (basic):
   ```bash
   # View logs
   make logs
   
   # Follow logs
   docker logs -f n8n
   ```

2. **Log rotation** (production):
   ```bash
   # Configure Docker daemon
   sudo tee /etc/docker/daemon.json << EOF
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }
   EOF
   
   sudo systemctl restart docker
   ```

3. **External log aggregation**:
   - **ELK Stack** (Elasticsearch, Logstash, Kibana)
   - **Grafana Loki** (lightweight alternative)
   - **Cloud services** (AWS CloudWatch, Google Cloud Logging)

## System Metrics

### Basic System Monitoring

Create system monitoring script:

```bash
#!/bin/bash
# /usr/local/bin/system-metrics.sh

# CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')

# Memory usage
MEMORY_USAGE=$(free | awk 'FNR==2{printf "%.2f", $3/($3+$4)*100}')

# Disk usage
DISK_USAGE=$(df / | awk 'NR==2{print $5}' | sed 's/%//')

# Load average
LOAD_AVERAGE=$(uptime | awk -F'load average:' '{print $2}')

echo "CPU: ${CPU_USAGE}%"
echo "Memory: ${MEMORY_USAGE}%"
echo "Disk: ${DISK_USAGE}%"
echo "Load: ${LOAD_AVERAGE}"

# Alert if metrics exceed thresholds
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
  echo "ALERT: High CPU usage: ${CPU_USAGE}%"
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
  echo "ALERT: High memory usage: ${MEMORY_USAGE}%"
fi

if [[ $DISK_USAGE -gt 80 ]]; then
  echo "ALERT: High disk usage: ${DISK_USAGE}%"
fi
```

### Prometheus & Grafana (Advanced)

For advanced metrics collection:

1. **Docker Compose addition**:
   ```yaml
   services:
     prometheus:
       image: prom/prometheus:latest
       ports:
         - "9090:9090"
       volumes:
         - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
     
     grafana:
       image: grafana/grafana:latest
       ports:
         - "3000:3000"
       environment:
         - GF_SECURITY_ADMIN_PASSWORD=admin
   ```

2. **Node Exporter** for system metrics:
   ```yaml
   node-exporter:
     image: prom/node-exporter:latest
     ports:
       - "9100:9100"
   ```

## Alert Configurations

### Slack Notifications

1. **Create Slack Webhook**:
   - Go to Slack → Apps → Incoming Webhooks
   - Create webhook for your channel
   - Copy webhook URL

2. **Alert script**:
   ```bash
   #!/bin/bash
   # /usr/local/bin/slack-alert.sh
   
   WEBHOOK_URL="your-slack-webhook-url"
   MESSAGE="$1"
   
   curl -X POST -H 'Content-type: application/json' \
     --data "{\"text\":\"🚨 n8n-cursor Alert: $MESSAGE\"}" \
     "$WEBHOOK_URL"
   ```

3. **Integration with health checks**:
   ```bash
   # Add to health check script
   if ! make health; then
     /usr/local/bin/slack-alert.sh "Health check failed on $(hostname)"
   fi
   ```

### Email Alerts

1. **Configure postfix** (simple):
   ```bash
   sudo apt install postfix mailutils
   # Configure as "Internet Site" during setup
   ```

2. **Send alerts**:
   ```bash
   echo "Service down on $(hostname)" | mail -s "n8n Alert" admin@yourdomain.com
   ```

## Monitoring Automation

### Cron Jobs for Monitoring

```bash
# /etc/cron.d/n8n-monitoring

# Health check every 5 minutes
*/5 * * * * n8n-user cd /path/to/n8n-cursor && make health || /usr/local/bin/alert.sh "Health check failed"

# System metrics every 15 minutes
*/15 * * * * root /usr/local/bin/system-metrics.sh > /var/log/n8n-metrics.log

# Daily backup verification
0 9 * * * n8n-user /usr/local/bin/verify-backups.sh

# Weekly disk cleanup
0 2 * * 0 root /usr/local/bin/cleanup-logs.sh
```

### GitHub Actions Monitoring

Monitor deployments and CI/CD:

```yaml
# .github/workflows/monitoring.yml
name: Health Check
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Production Health
        run: |
          if ! curl -f -s https://your-domain.com/healthz; then
            echo "Health check failed"
            exit 1
          fi
```

## Metrics Dashboard

### Key Metrics to Track

1. **Application Metrics**:
   - Response time
   - Error rate
   - Active workflows
   - n8n executions per hour

2. **System Metrics**:
   - CPU usage
   - Memory usage
   - Disk usage
   - Network I/O

3. **Business Metrics**:
   - Active users
   - Workflow success rate
   - API calls per minute

### Simple Dashboard

Create a simple status page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>n8n-cursor Status</title>
    <meta http-equiv="refresh" content="30">
</head>
<body>
    <h1>n8n-cursor System Status</h1>
    <div id="status">
        <!-- Auto-populated via JavaScript -->
    </div>
    
    <script>
        fetch('/healthz')
            .then(response => response.json())
            .then(data => {
                document.getElementById('status').innerHTML = 
                    `<p>Status: ${data.status}</p>
                     <p>Last Updated: ${data.timestamp}</p>`;
            })
            .catch(() => {
                document.getElementById('status').innerHTML = 
                    '<p style="color: red;">Service Unavailable</p>';
            });
    </script>
</body>
</html>
```

## Troubleshooting Monitoring

### Common Issues

1. **Health endpoint returns 404**:
   - Ensure health endpoint is implemented
   - Check nginx configuration

2. **Monitoring alerts not working**:
   - Verify webhook URLs
   - Check firewall settings
   - Test alert scripts manually

3. **High false positive rate**:
   - Adjust monitoring intervals
   - Add retry logic to checks
   - Fine-tune alert thresholds

### Debug Commands

```bash
# Test health endpoint
curl -v https://your-domain.com/healthz

# Check system resources
make health

# View recent logs
docker logs --tail 50 n8n

# Check disk space
df -h

# Monitor real-time resource usage
htop
```

## Monitoring Checklist

### Setup
- [ ] Health endpoint implemented
- [ ] External monitoring configured (UptimeRobot/Pingdom)
- [ ] Alert notifications setup (email/Slack)
- [ ] Log rotation configured
- [ ] System metrics collection enabled

### Daily
- [ ] Check monitoring dashboard
- [ ] Review alert logs
- [ ] Verify backup completion

### Weekly
- [ ] Review performance trends
- [ ] Update alert thresholds if needed
- [ ] Test alert mechanisms

### Monthly
- [ ] Review monitoring coverage
- [ ] Update monitoring documentation
- [ ] Capacity planning review

---

**Last Updated**: $(date)  
**Document Owner**: DevOps Team
