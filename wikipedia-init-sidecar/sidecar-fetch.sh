#!/bin/bash

# Array de páginas de Wikipedia para rotar
PAGES=(
  "Docker_(software)"
  "Microservices"
  "DevOps"
  "Continuous_integration"
  "Container_(virtualization)"
  "Orchestration_(computing)"
  "Cloud_computing"
  "Service_mesh"
)

echo "Sidecar: Starting periodic Wikipedia fetcher..."

while true; do
  # Esperar entre 5 y 15 minutos (300-900 segundos)
  SLEEP_TIME=$((300 + RANDOM % 600))
  echo "Sidecar: Sleeping for $SLEEP_TIME seconds..."
  sleep $SLEEP_TIME
  
  # Seleccionar página aleatoria
  RANDOM_INDEX=$((RANDOM % ${#PAGES[@]}))
  PAGE=${PAGES[$RANDOM_INDEX]}
  
  echo "Sidecar: Fetching https://en.wikipedia.org/wiki/$PAGE"
  curl -s "https://en.wikipedia.org/wiki/$PAGE" > /usr/share/nginx/html/index.html
  echo "Sidecar: Updated content with $PAGE"
done
