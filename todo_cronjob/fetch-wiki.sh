#!/bin/sh
set -e

echo "Fetching random Wikipedia article..."

# Obtener la URL de redirección de Wikipedia Special:Random
WIKI_URL=$(curl -sI https://en.wikipedia.org/wiki/Special:Random | grep -i "^location:" | awk '{print $2}' | tr -d '\r')

if [ -z "$WIKI_URL" ]; then
    echo "Error: Could not fetch Wikipedia URL"
    exit 1
fi

echo "Found Wikipedia article: $WIKI_URL"

# Crear el TODO con la URL de Wikipedia
TODO_TEXT="Read: $WIKI_URL"

echo "Creating todo: $TODO_TEXT"

# Enviar el TODO al backend
RESPONSE=$(curl -s -X POST http://todo-backend-svc.project:3000/todos \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$TODO_TEXT\"}")

echo "Todo created successfully: $RESPONSE"
