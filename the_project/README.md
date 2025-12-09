# The Project - Todo App

A todo application with image caching and persistent data, developed progressively throughout the course.

## Current State (Exercise 1.13)

- Displays random image cached hourly by sidecar container
- Todo form with input field (max 140 characters)
- Create TODO button
- Hardcoded list of todos (TODO 1, TODO 2)
- Styled UI with responsive design

## How to Access

The application is accessible through the shared Ingress:

```bash
# Main todo app interface
http://localhost:8081/

# Direct image access
http://localhost:8081/image
```

Or open in browser: [http://localhost:8081/](http://localhost:8081/)

## Architecture

```
Pod: todo-app
├── Main Container (engjuanser/todo-app:1.13)
│   ├── Reads from: /usr/src/app/files/image.jpg (emptyDir)
│   └── Serves: HTTP on port 3000
│
└── Image-Fetcher Container (engjuanser/image-fetcher:1.12)
    ├── Downloads: Random image from picsum.photos
    ├── Writes to: /usr/src/app/files/image.jpg (emptyDir)
    └── Refresh: Every 60 minutes
```

## Features

- Random daily image (cached hourly)  
- Todo input form with validation  
- Create TODO button  
- Display hardcoded todos  
- Responsive UI design  
- Persistent todo storage (coming soon)  

## Evolution

- **1.2**: Basic HTTP server
- **1.4**: Declarative deployment
- **1.5**: HTTP endpoint
- **1.6**: NodePort service
- **1.8**: Ingress configuration
- **1.12**: Image caching with sidecar container
- **1.13**: Todo form UI with hardcoded list

## See Also

Refer to the [main README](../README.md) for complete exercise history and links to each version.
kubectl logs <pod-name>
```

## Deploying to Kubernetes (Exercise 1.04 - Declarative approach)

```bash
kubectl apply -f manifests/deployment.yaml
kubectl get pods
kubectl logs <pod-name>
```

## Cleanup

```bash
kubectl delete deployment todo-app
```
