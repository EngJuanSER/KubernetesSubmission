# Log Output Application

A simple application that generates a random UUID string at startup and prints it with a timestamp every 5 seconds.

## Building the Docker image

```bash
docker build -t <your-dockerhub-username>/log-output:1.01 .
docker push <your-dockerhub-username>/log-output:1.01
```

## Running locally with Docker

```bash
docker run <your-dockerhub-username>/log-output:1.01
```

## Deploying to Kubernetes (Exercise 1.01 - Imperative approach)

```bash
kubectl create deployment log-output --image=<your-dockerhub-username>/log-output:1.01
kubectl get pods
kubectl logs -f <pod-name>
```

## Deploying to Kubernetes (Exercise 1.03 - Declarative approach)

```bash
kubectl apply -f manifests/deployment.yaml
kubectl get pods
kubectl logs -f <pod-name>
```

## Cleanup

```bash
kubectl delete deployment log-output
```
