const http = require('http');
const fs = require('fs');

const PORT = 3000;
const logFile = '/usr/src/app/files/log.txt';
const counterFile = '/usr/src/app/data/counter.txt';

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    let output = '';
    
    // Leer última línea del log
    if (fs.existsSync(logFile)) {
      const lines = fs.readFileSync(logFile, 'utf-8').trim().split('\n');
      output = lines[lines.length - 1];
    } else {
      output = 'Log file not found yet';
    }
    
    // Leer contador desde el volumen persistente
    let counter = 0;
    if (fs.existsSync(counterFile)) {
      const content = fs.readFileSync(counterFile, 'utf-8').trim();
      counter = parseInt(content) || 0;
    }
    
    const response = `${output}\nPing / Pongs: ${counter}\n`;
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(response);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Reader server listening on port ${PORT}`);
});
