#!/bin/sh
echo "Init container: Fetching initial Wikipedia page..."
curl -s https://en.wikipedia.org/wiki/Kubernetes > /usr/share/nginx/html/index.html
echo "Init container: Wikipedia page downloaded successfully"
