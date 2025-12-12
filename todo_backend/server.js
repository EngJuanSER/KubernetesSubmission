const http = require('http');
const url = require('url');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

// Configuración de Postgres
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres-svc.project',
  port: 5432,
  database: process.env.POSTGRES_DB || 'tododb',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

console.log(`Starting todo-backend on port ${PORT}`);
console.log('Connecting to Postgres...');

// Inicializar la base de datos
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text VARCHAR(140) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDB();

const server = http.createServer(async (req, res) => {
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
    try {
      // GET /todos - Devolver lista de todos
      const result = await pool.query(
        'SELECT * FROM todos ORDER BY created_at DESC'
      );
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error('Database error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database error');
    }
    
  } else if (pathname === '/todos' && req.method === 'POST') {
    // POST /todos - Crear nuevo todo
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const todoText = data.text || data.content;
        
        if (!todoText || todoText.length === 0) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Todo text is required');
          return;
        }
        
        if (todoText.length > 140) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Todo text must be 140 characters or less');
          return;
        }
        
        const result = await pool.query(
          'INSERT INTO todos (text) VALUES ($1) RETURNING *',
          [todoText]
        );
        
        const newTodo = result.rows[0];
        console.log(`New todo created: ${newTodo.text}`);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTodo));
      } catch (err) {
        console.error('Error creating todo:', err);
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

