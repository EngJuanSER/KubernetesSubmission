FROM alpine:3.19

# Instalar curl para hacer peticiones HTTP
RUN apk add --no-cache curl

# Copiar el script
COPY fetch-wiki.sh /usr/local/bin/fetch-wiki.sh

# Hacer el script ejecutable
RUN chmod +x /usr/local/bin/fetch-wiki.sh

# Ejecutar el script
CMD ["/usr/local/bin/fetch-wiki.sh"]
