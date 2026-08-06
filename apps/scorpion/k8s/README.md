# Kubernetes Deployment for Scorpion

Complete Kubernetes manifests for deploying Scorpion in a production environment.

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Docker registry access (for pushing images)
- Ingress controller (nginx recommended)
- cert-manager (for TLS certificates)

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Create Secrets

Create a secret with your environment variables:

```bash
kubectl create secret generic scorpion-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@postgres:5432/scorpion" \
  --from-literal=N8N_API_URL="https://evenslouis.ca/n8n/api/v1" \
  --from-literal=N8N_API_KEY="your-key" \
  --from-literal=OPENAI_API_KEY="your-key" \
  --from-literal=ANTHROPIC_API_KEY="your-key" \
  --namespace=scorpion
```

### 3. Create ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml
```

### 4. Deploy PostgreSQL

```bash
kubectl apply -f k8s/postgres.yaml
```

### 5. Build and Push Docker Image

```bash
# Build image
docker build -t your-registry/scorpion:latest -f apps/scorpion/Dockerfile ../..

# Push to registry
docker push your-registry/scorpion:latest
```

### 6. Update Deployment Image

Edit `k8s/deployment.yaml` and update the image name:

```yaml
image: your-registry/scorpion:latest
```

### 7. Deploy Scorpion

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 8. Deploy Ingress (Optional)

Update `k8s/ingress.yaml` with your domain, then:

```bash
kubectl apply -f k8s/ingress.yaml
```

### 9. Deploy HPA (Optional)

```bash
kubectl apply -f k8s/hpa.yaml
```

## Verify Deployment

```bash
# Check pods
kubectl get pods -n scorpion

# Check services
kubectl get svc -n scorpion

# Check ingress
kubectl get ingress -n scorpion

# View logs
kubectl logs -f deployment/scorpion -n scorpion

# Check HPA
kubectl get hpa -n scorpion
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment scorpion --replicas=5 -n scorpion
```

### Automatic Scaling (HPA)

The HPA will automatically scale based on CPU and memory usage:
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

## Health Checks

The deployment includes:
- **Liveness Probe**: Restarts container if unhealthy
- **Readiness Probe**: Removes from service if not ready
- **Startup Probe**: Allows time for initial startup

## Resource Limits

Default resource requests/limits:
- **Requests**: 512Mi memory, 250m CPU
- **Limits**: 2Gi memory, 1000m CPU

Adjust in `deployment.yaml` based on your needs.

## Database Migration

After deploying, run migrations:

```bash
kubectl exec -it deployment/scorpion -n scorpion -- \
  tsx apps/scorpion/scripts/migrate-cost-tracking.ts
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n scorpion

# Check logs
kubectl logs <pod-name> -n scorpion
```

### Database Connection Issues

```bash
# Check postgres pod
kubectl get pods -n scorpion | grep postgres

# Check postgres logs
kubectl logs deployment/postgres -n scorpion
```

### Image Pull Errors

Ensure:
1. Image is pushed to registry
2. Kubernetes has access to registry
3. Image name in deployment matches registry

## Production Considerations

1. **Use managed database**: Consider using managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. **External secrets**: Use external-secrets operator for secret management
3. **Monitoring**: Add Prometheus/Grafana for monitoring
4. **Backup**: Set up regular database backups
5. **Network policies**: Add network policies for security
6. **Pod disruption budgets**: Add PDB for high availability

