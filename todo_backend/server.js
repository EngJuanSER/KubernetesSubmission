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

console.log(`=================================`);
console.log(`Starting todo-backend on port ${PORT}`);
console.log(`=================================`);
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
    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('✗ Error initializing database:', err);
    process.exit(1);
  }
};

initDB();

// Función helper para logging de requests
const logRequest = (method, path, statusCode, message = '') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} - Status: ${statusCode}${message ? ' - ' + message : ''}`);
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    logRequest(method, pathname, 200, 'CORS preflight');
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (pathname === '/todos' && method === 'GET') {
    try {
      // GET /todos - Devolver lista de todos
      const result = await pool.query(
        'SELECT * FROM todos ORDER BY created_at DESC'
      );
      
      logRequest(method, pathname, 200, `Returned ${result.rows.length} todos`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error('✗ Database error on GET /todos:', err);
      logRequest(method, pathname, 500, 'Database error');
      
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database error');
    }
    
  } else if (pathname === '/todos' && method === 'POST') {
    // POST /todos - Crear nuevo todo
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const todoText = data.text || data.content;
        
        // Validación: texto requerido
        if (!todoText || todoText.length === 0) {
          console.warn('⚠ Blocked todo creation: Empty text');
          logRequest(method, pathname, 400, 'Empty todo text');
          
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Todo text is required' }));
          return;
        }
        
        // Validación: máximo 140 caracteres
        if (todoText.length > 140) {
          console.warn(`⚠ Blocked todo creation: Text too long (${todoText.length} chars)`);
          console.warn(`⚠ Rejected text: "${todoText.substring(0, 50)}..."`);
          logRequest(method, pathname, 400, `Text too long: ${todoText.length} chars`);
          
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Todo text must be 140 characters or less',
            length: todoText.length,
            maxLength: 140
          }));
          return;
        }
        
        // Crear todo
        const result = await pool.query(
          'INSERT INTO todos (text) VALUES ($1) RETURNING *',
          [todoText]
        );
        
        const newTodo = result.rows[0];
        console.log(`✓ New todo created (ID: ${newTodo.id}): "${newTodo.text.substring(0, 50)}${newTodo.text.length > 50 ? '...' : ''}"`);
        logRequest(method, pathname, 201, `Created todo ID: ${newTodo.id}`);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTodo));
      } catch (err) {
        console.error('✗ Error creating todo:', err);
        logRequest(method, pathname, 400, 'Bad Request');
        
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Request' }));
      }
    });
    
  } else {
    logRequest(method, pathname, 404, 'Not Found');
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`✓ Todo-backend listening on port ${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  - GET  /todos`);
  console.log(`  - POST /todos`);
  console.log(`=================================`);
});

