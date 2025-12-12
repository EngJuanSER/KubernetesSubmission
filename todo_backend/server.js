const http = require('http');
const url = require('url');

const PORT = 3000;

// Almacenamiento en memoria
let todos = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (pathname === '/todos' && req.method === 'GET') {
    // GET /todos - Devolver lista de todos
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(todos));
    
  } else if (pathname === '/todos' && req.method === 'POST') {
    // POST /todos - Crear nuevo todo
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newTodo = {
          id: Date.now(),
          text: data.text || data.content,
          completed: false
        };
        todos.push(newTodo);
        console.log(`New todo created: ${newTodo.text}`);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTodo));
      } catch (err) {
        console.error('Error parsing POST data:', err);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    });
    
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Todo-backend listening on port ${PORT}`);
  console.log('Endpoints: GET /todos, POST /todos');
});
