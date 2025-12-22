const http = require('http');

const PORT = process.env.PORT || 3000;
const VERSION = 'v2';

const server = http.createServer((req, res) => {
  if (req.url === '/greet' && req.method === 'GET') {
    const greeting = `¡Hola desde greeter ${VERSION}!`;
    console.log(`[${VERSION}] Served: ${greeting}`);
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(greeting);
  } else if (req.url === '/healthz' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Greeter ${VERSION} listening on port ${PORT}`);
});
