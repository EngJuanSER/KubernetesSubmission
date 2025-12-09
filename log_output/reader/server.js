const http = require('http');
const fs = require('fs');

const PORT = 3000;
const filePath = '/usr/src/app/files/log.txt';

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Log file not found yet. Writer may not have written anything.');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Reader server listening on port ${PORT}`);
});
