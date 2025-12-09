# Cluster-Wide Resources

Kubernetes resources that are shared across multiple applications.

## Current Resources (Exercise 1.11)

### PersistentVolume: local-pv
- **Capacity**: 1Gi
- **Access Mode**: ReadWriteOnce
- **Storage Class**: manual
- **Type**: Local storage
- **Path**: `/tmp/kube` on node `k3d-k3s-default-agent-0`

### PersistentVolumeClaim: shared-pvc
- **Requests**: 1Gi storage
- **Access Mode**: ReadWriteOnce
- **Storage Class**: manual
- **Status**: Bound to local-pv

## Usage

This PVC is mounted by:
- **ping-pong**: Writes counter to `/usr/src/app/data/counter.txt`
- **log-output (reader)**: Reads counter from `/usr/src/app/data/counter.txt`

## Applying Resources

```bash
kubectl apply -f cluster-resources/
```

## Verification

```bash
# Check PV status
kubectl get pv

# Check PVC status
kubectl get pvc

# Check which pods are using the PVC
kubectl get pods -o json | jq '.items[] | select(.spec.volumes[]?.persistentVolumeClaim.claimName=="shared-pvc") | .metadata.name'
```

## See Also

Refer to the [main README](../README.md) for complete exercise history.
