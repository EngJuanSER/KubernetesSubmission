const http = require('http');
const fs = require('fs');

const PORT = 3000;
const logFile = '/usr/src/app/files/log.txt';
const configFile = '/usr/src/app/config/information.txt';
const PING_PONG_URL = 'http://ping-pong-svc.exercises:3000/pings';
const MESSAGE = process.env.MESSAGE || 'no message';

// Función para hacer GET request interno
const getPingCount = () => {
  return new Promise((resolve, reject) => {
    http.get(PING_PONG_URL, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data.trim());
      });
    }).on('error', (err) => {
      console.error('Error fetching ping count:', err);
      reject(err);
    });
  });
};

const server = http.createServer(async (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    let output = '';
    
    // Leer contenido del archivo de configuración
    let fileContent = 'file not found';
    if (fs.existsSync(configFile)) {
      fileContent = fs.readFileSync(configFile, 'utf-8').trim();
    }
    
    // Leer última línea del log
    if (fs.existsSync(logFile)) {
      const lines = fs.readFileSync(logFile, 'utf-8').trim().split('\n');
      output = lines[lines.length - 1];
    } else {
      output = 'Log file not found yet';
    }
    
    // Obtener contador via HTTP
    let counter = 0;
    try {
      counter = await getPingCount();
    } catch (err) {
      console.error('Failed to get ping count');
    }
    
    const response = `file content: ${fileContent}\nenv variable: MESSAGE=${MESSAGE}\n${output}\nPing / Pongs: ${counter}`;
    
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
