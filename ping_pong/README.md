# Ping-Pong Application

A counter service that increments and persists its state using PersistentVolumes.

## Current State (Exercise 1.11)

- HTTP server that responds with "pong N" where N is an incrementing counter
- Counter persists to disk using **PersistentVolumeClaim**
- Counter survives pod restarts and is shared with log-output app

## How to Access

The application is accessible through the shared Ingress:

```bash
# Increment counter and see response
curl http://localhost:8081/pingpong
# Output: pong N
```

## Architecture

```
Pod: ping-pong
└── Container (engjuanser/ping-pong:1.11)
    ├── Persists to: /usr/src/app/data/counter.txt (PVC)
    └── Serves: HTTP on port 3000
    
PersistentVolume: local-pv (1Gi)
└── Mounted on: k3d-k3s-default-agent-0:/tmp/kube
```

## Evolution

- **1.9**: Basic counter service with Ingress
- **1.11**: Added PersistentVolume for data persistence

## See Also

Refer to the [main README](../README.md) for complete exercise history and links to each version.
