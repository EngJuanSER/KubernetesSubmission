# Log Output Application

Application that demonstrates shared volumes and data persistence in Kubernetes.

## Current State (Exercise 1.11)

- **Writer container**: Generates random UUID at startup, appends timestamp every 5 seconds to shared log file
- **Reader container**: HTTP server that reads the log file and displays ping-pong counter from PersistentVolume
- Uses **emptyDir** volume to share logs between writer and reader
- Uses **PersistentVolumeClaim** to read counter from ping-pong app

## How to Access

The application is accessible through the shared Ingress:

```bash
# Main endpoint (shows latest log line and ping-pong counter)
curl http://localhost:8081/
```

## Architecture

```
Pod: log-output
├── Writer Container (engjuanser/log-output-writer:1.10)
│   └── Writes to: /usr/src/app/files/log.txt (emptyDir)
│
└── Reader Container (engjuanser/log-output-reader:1.11)
    ├── Reads from: /usr/src/app/files/log.txt (emptyDir)
    ├── Reads from: /usr/src/app/data/counter.txt (PVC)
    └── Serves: HTTP on port 3000
```

## Evolution

- **1.1**: Basic imperative deployment
- **1.3**: Declarative deployment
- **1.7**: Added Ingress
- **1.10**: Split into writer/reader with emptyDir volume
- **1.11**: Added PVC to read ping-pong counter

## See Also

Refer to the [main README](../README.md) for complete exercise history and links to each version.
kubectl logs -f <pod-name>
```

## Cleanup

```bash
kubectl delete deployment log-output
```
