const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://todo-backend-svc:3000';

console.log(`Starting todo-frontend on port ${PORT}`);
console.log(`Backend URL: ${BACKEND_URL}`);

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  if (pathname === '/' || pathname === '/index.html') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (pathname === '/api/backend-url') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ backendUrl: BACKEND_URL }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Frontend server listening on port ${PORT}`);
});
