const http = require('http');
const fs = require('fs');

const PORT = 3000;
const dir = '/usr/src/app/data';
const counterFile = dir + '/counter.txt';

// Crear directorio si no existe
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Leer contador al inicio (persiste entre reinicios del pod)
let counter = 0;
if (fs.existsSync(counterFile)) {
  const content = fs.readFileSync(counterFile, 'utf-8').trim();
  counter = parseInt(content) || 0;
  console.log(`Counter loaded from file: ${counter}`);
} else {
  console.log('No counter file found, starting from 0');
}

const server = http.createServer((req, res) => {
  if (req.url === '/pingpong' && req.method === 'GET') {
    counter++;
    fs.writeFileSync(counterFile, counter.toString());
    console.log(`Pong ${counter}`);
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
