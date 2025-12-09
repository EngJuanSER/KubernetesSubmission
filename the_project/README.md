# The Project - Todo App

A simple web server that will be developed throughout the course to become a full todo application.

## Features

- Simple HTTP server
- Configurable port via `PORT` environment variable (defaults to 3000)
- Prints startup message with the port number

## Building the Docker image

```bash
docker build -t <your-dockerhub-username>/todo-app:1.02 .
docker push <your-dockerhub-username>/todo-app:1.02
```

## Running locally with Docker

```bash
docker run -p 3000:3000 <your-dockerhub-username>/todo-app:1.02
```

Then visit `http://localhost:3000` in your browser.

## Deploying to Kubernetes (Exercise 1.02 - Imperative approach)

```bash
kubectl create deployment todo-app --image=<your-dockerhub-username>/todo-app:1.02
kubectl get pods
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
