const http = require('http');
const PORT = 3000;

let counter = 0;

const server = http.createServer((req, res) => {
  if (req.url === '/pingpong' && req.method === 'GET') {
    counter++;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`pong ${counter}\n`);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => {
  console.log(`Ping-pong server listening on port ${PORT}`);
});
