# Ping-Pong Application

A simple application that counts requests and responds with "pong N" at the `/pingpong` endpoint.

## Building the Docker image

```bash
docker build -t engjuanser/ping-pong:1.9 .
docker push engjuanser/ping-pong:1.9
```

## Deploying to Kubernetes

```bash
kubectl apply -f manifests/deployment.yaml
kubectl apply -f manifests/service.yaml
```

## Usage

Access via the shared Ingress at `http://localhost:8081/pingpong`
