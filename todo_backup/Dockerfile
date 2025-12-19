FROM google/cloud-sdk:alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql15-client

WORKDIR /backup

COPY backup.sh .
RUN chmod +x backup.sh

CMD ["./backup.sh"]
