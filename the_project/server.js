const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const IMAGE_PATH = '/usr/src/app/files/image.jpg';

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Todo App</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>Todo App</h1>
          <img src="/image" alt="Random daily image">
          <p>Welcome to the todo application!</p>
        </body>
      </html>
    `;
    res.end(html);
  } else if (req.url === '/image' && req.method === 'GET') {
    if (fs.existsSync(IMAGE_PATH)) {
      const stat = fs.statSync(IMAGE_PATH);
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size
      });
      const readStream = fs.createReadStream(IMAGE_PATH);
      readStream.pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image not found yet');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
