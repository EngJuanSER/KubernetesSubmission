const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const IMAGE_PATH = '/usr/src/app/files/image.jpg';
const BACKEND_URL = process.env.BACKEND_URL || 'http://todo-backend-svc:3000';

console.log(`Starting todo-app on port ${PORT}`);
console.log(`Backend URL: ${BACKEND_URL}`);

// Función para hacer GET request al backend
const getTodos = () => {
  return new Promise((resolve, reject) => {
    http.get(`${BACKEND_URL}/todos`, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error('Error fetching todos:', err);
      resolve([]);
    });
  });
};

// Función para hacer POST request al backend
const createTodo = (todoText) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ text: todoText });
    
    const options = {
      hostname: 'todo-backend-svc',
      port: 3000,
      path: '/todos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      console.error('Error creating todo:', err);
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  if (pathname === '/' && req.method === 'GET') {
    // Obtener todos del backend
    const todos = await getTodos();
    
    let html = `
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
          img { 
            max-width: 100%; 
            height: auto; 
            margin-bottom: 20px; 
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #333; 
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
          }
          h2 { 
            color: #555; 
            margin-top: 30px;
          }
          input { 
            width: 300px; 
            padding: 10px; 
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          button { 
            padding: 10px 20px; 
            margin-left: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          button:hover {
            background-color: #0056b3;
          }
          ul { 
            list-style-type: none; 
            padding: 0; 
          }
          li { 
            padding: 12px; 
            border-bottom: 1px solid #ddd;
            background-color: white;
            margin-bottom: 5px;
            border-radius: 4px;
          }
          .form-container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .todos-container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <h1>Todo App</h1>
    `;
    
    // Mostrar imagen si existe
    if (fs.existsSync(IMAGE_PATH)) {
      html += '<img src="/image" alt="Random image from Lorem Picsum">';
    }
    
    html += `
        <div class="form-container">
          <h2>Add Todo</h2>
          <form action="/" method="post">
            <input 
              type="text" 
              name="content" 
              maxlength="140" 
              placeholder="Enter todo (max 140 chars)" 
              required
            />
            <button type="submit">Create Todo</button>
          </form>
        </div>
        
        <div class="todos-container">
          <h2>Todos</h2>
          <ul>
    `;
    
    // Renderizar todos del backend
    if (todos.length === 0) {
      html += '<li>No todos yet. Create one above!</li>';
    } else {
      todos.forEach(todo => {
        html += `<li>${todo.text}</li>`;
      });
    }
    
    html += `
          </ul>
        </div>
      </body>
      </html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    
  } else if (pathname === '/' && req.method === 'POST') {
    // Manejar formulario POST
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      // Parsear form data (application/x-www-form-urlencoded)
      const params = new URLSearchParams(body);
      const todoText = params.get('content');
      
      if (todoText) {
        await createTodo(todoText);
      }
      
      // Redirect back to home
      res.writeHead(302, { 'Location': '/' });
      res.end();
    });
    
  } else if (pathname === '/image' && req.method === 'GET') {
    if (fs.existsSync(IMAGE_PATH)) {
      const img = fs.readFileSync(IMAGE_PATH);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(img);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image not found');
    }
    
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
