# Kubernetes Deployment for Scorpion

Optional Kubernetes deployment for production environments with GPU support.

## Prerequisites

- Kubernetes cluster (1.24+)
- NVIDIA GPU operator installed (for VLLM)
- kubectl configured
- Persistent storage provisioner

## Quick Start

### 1. Deploy VLLM (Optional - requires GPU)

```bash
# Only if you have GPU nodes
kubectl apply -f vllm-deployment.yaml
```

### 2. Deploy Scorpion

```bash
kubectl apply -f scorpion-deployment.yaml
```

### 3. Check Status

```bash
kubectl get pods -l app=scorpion
kubectl get pods -l app=vllm
```

## Configuration

### Update VLLM Model

Edit `vllm-deployment.yaml` ConfigMap:

```yaml
data:
  model: "your-model-name"
```

Then apply:

```bash
kubectl apply -f vllm-deployment.yaml
kubectl rollout restart deployment/vllm
```

### Update Scorpion Image

Edit `scorpion-deployment.yaml`:

```yaml
image: ghcr.io/yourorg/scorpion:prod
```

## GPU Node Setup

If deploying VLLM, ensure your cluster has GPU nodes:

```bash
# Label GPU nodes
kubectl label nodes <node-name> accelerator=nvidia-tesla-t4

# Verify GPU availability
kubectl get nodes -l accelerator=nvidia-tesla-t4
```

## Access

### Port Forward (Development)

```bash
kubectl port-forward service/scorpion-service 3003:3003
```

### Ingress (Production)

Create an Ingress resource pointing to `scorpion-service:3003`

## Monitoring

```bash
# Check logs
kubectl logs -f deployment/scorpion
kubectl logs -f deployment/vllm

# Check resource usage
kubectl top pods -l app=scorpion
kubectl top pods -l app=vllm
```

## Troubleshooting

### VLLM Not Starting

1. Check GPU availability:
   ```bash
   kubectl describe node <gpu-node>
   ```

2. Check VLLM logs:
   ```bash
   kubectl logs deployment/vllm
   ```

3. Verify NVIDIA device plugin:
   ```bash
   kubectl get daemonset -n kube-system | grep nvidia
   ```

### Scorpion Can't Connect to VLLM

1. Verify service exists:
   ```bash
   kubectl get service vllm-service
   ```

2. Test from Scorpion pod:
   ```bash
   kubectl exec -it deployment/scorpion -- curl http://vllm-service:8000/health
   ```

## Scaling

### Scale Scorpion

```bash
kubectl scale deployment scorpion --replicas=3
```

### Scale VLLM (Multi-GPU)

Edit `vllm-deployment.yaml`:

```yaml
spec:
  replicas: 2  # One per GPU
```

And update tensor parallel size in ConfigMap if using model parallelism.

