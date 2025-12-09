const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const IMAGE_PATH = '/usr/src/app/files/image.jpg';

// Hardcoded todos for exercise 1.13
const todos = [
  'TODO 1',
  'TODO 2'
];

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const todoList = todos.map(todo => `<li>${todo}</li>`).join('');
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
              background-color: #f5f5f5;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
              color: #333;
              margin-top: 0;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 20px 0;
            }
            form {
              margin: 20px 0;
              display: flex;
              gap: 10px;
            }
            input[type="text"] {
              flex: 1;
              padding: 10px;
              border: 2px solid #ddd;
              border-radius: 5px;
              font-size: 16px;
            }
            button {
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              cursor: pointer;
            }
            button:hover {
              background-color: #45a049;
            }
            ul {
              list-style-type: none;
              padding: 0;
            }
            li {
              background-color: #f9f9f9;
              margin: 10px 0;
              padding: 15px;
              border-left: 4px solid #4CAF50;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Todo App</h1>
            <img src="/image" alt="Random daily image">
            
            <form action="/" method="POST">
              <input type="text" name="todo" maxlength="140" placeholder="Enter a new todo (max 140 characters)" required>
              <button type="submit">Create TODO</button>
            </form>
            
            <h2>My TODOs:</h2>
            <ul>
              ${todoList}
            </ul>
          </div>
        </body>
      </html>
    `;
    res.end(html);
  } else if (req.url === '/' && req.method === 'POST') {
    // For now, just redirect back to GET
    // We'll handle form submission properly in a later exercise
    res.writeHead(303, { 'Location': '/' });
    res.end();
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
