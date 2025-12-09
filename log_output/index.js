const http = require('http');
const crypto = require('crypto');

// Generate a random string at startup
const randomString = crypto.randomUUID();
const PORT = 3000;

console.log(`Application started. Random string: ${randomString}`);

// Print timestamp and random string every 5 seconds
setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
}, 5000);

// HTTP Server
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`${timestamp}: ${randomString}\n`);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
