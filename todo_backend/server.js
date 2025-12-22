const http = require('http');
const url = require('url');
const { Pool } = require('pg');
const { connect, StringCodec } = require('nats');

// Exercise 4.10: Using separate repositories for code and config
const PORT = process.env.PORT || 3000;
const NATS_URL = process.env.NATS_URL || 'nats://my-nats.project.svc.cluster.local:4222';

// Función para logs estructurados en formato JSON
const log = (level, message, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    severity: level.toUpperCase(),
    message,
    ...metadata
  };
  console.log(JSON.stringify(logEntry));
};

// Configuración de Postgres
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres-svc.project',
  port: 5432,
  database: process.env.POSTGRES_DB || 'tododb',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

let dbConnected = false;
let natsConnected = false;
let nc = null;
const sc = StringCodec();

log('info', 'Starting todo-backend', { port: PORT });
log('info', 'Connecting to Postgres', { host: process.env.POSTGRES_HOST });

// Conectar a NATS
const connectNATS = async () => {
  try {
    nc = await connect({
      servers: NATS_URL,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
    });
    natsConnected = true;
    log('info', 'Connected to NATS successfully', { url: NATS_URL });
  } catch (err) {
    natsConnected = false;
    log('error', 'Failed to connect to NATS', { error: err.message });
  }
};

// Publicar evento a NATS
const publishEvent = async (action, todo) => {
  if (!natsConnected || !nc) {
    log('warn', 'NATS not connected, skipping event publish', { action, todoId: todo.id });
    return;
  }
  
  try {
    const event = {
      action,
      todo: {
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        created_at: todo.created_at
      },
      timestamp: new Date().toISOString()
    };
    
    nc.publish('todo.events', sc.encode(JSON.stringify(event)));
    log('info', 'Published event to NATS', { action, todoId: todo.id });
  } catch (err) {
    log('error', 'Failed to publish event to NATS', { error: err.message });
  }
};

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
    dbConnected = true;
    log('info', 'Database initialized successfully');
  } catch (err) {
    dbConnected = false;
    log('error', 'Error initializing database', { error: err.message, stack: err.stack });
  }
};

initDB();
connectNATS();

// Retry connection every 5 seconds if not connected
setInterval(() => {
  if (!dbConnected) {
    log('info', 'Attempting to reconnect to database');
    initDB();
  }
  if (!natsConnected) {
    log('info', 'Attempting to reconnect to NATS');
    connectNATS();
  }
}, 5000);

// Función helper para logging de requests
const logRequest = (method, path, statusCode, message = '', metadata = {}) => {
  log('info', 'HTTP Request', {
    method,
    path,
    statusCode,
    message,
    ...metadata
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    logRequest(method, pathname, 200, 'CORS preflight');
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (pathname === '/healthz' && method === 'GET') {
    if (dbConnected) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database not connected');
    }
    return;
  }
  
  // Health check endpoint for Ingress
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Todo backend is healthy\n');
    return;
  }
  
  if (pathname === '/todos' && method === 'GET') {
    if (!dbConnected) {
      logRequest(method, pathname, 500, 'Database not available');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database not available' }));
      return;
    }
    
    try {
      // GET /todos - Devolver lista de todos
      const result = await pool.query(
        'SELECT * FROM todos ORDER BY created_at DESC'
      );
      
      logRequest(method, pathname, 200, `Returned ${result.rows.length} todos`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      dbConnected = false;
      console.error('✗ Database error on GET /todos:', err);
      logRequest(method, pathname, 500, 'Database error');
      
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database error');
    }
    
  } else if (pathname === '/todos' && method === 'POST') {
    if (!dbConnected) {
      logRequest(method, pathname, 500, 'Database not available');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database not available' }));
      return;
    }
    
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
        
        // Publicar evento a NATS
        await publishEvent('created', newTodo);
        
        log('info', 'Todo created', { 
          todoId: newTodo.id, 
          text: newTodo.text.substring(0, 50) + (newTodo.text.length > 50 ? '...' : '')
        });
        logRequest(method, pathname, 201, `Created todo ID: ${newTodo.id}`, { todoId: newTodo.id });
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTodo));
      } catch (err) {
        dbConnected = false;
        log('error', 'Error creating todo', { error: err.message, stack: err.stack });
        logRequest(method, pathname, 400, 'Bad Request');
        
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Request' }));
      }
    });
    
  } else if (pathname.match(/^\/todos\/\d+$/) && method === 'PUT') {
    // PUT /todos/:id - Marcar todo como completado/incompleto
    const todoId = pathname.split('/')[2];
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      if (!dbConnected) {
        logRequest(method, pathname, 500, 'Database not available');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
      }
      
      try {
        const data = JSON.parse(body);
        const completed = data.completed !== undefined ? data.completed : true;
        
        const result = await pool.query(
          'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
          [completed, todoId]
        );
        
        if (result.rows.length === 0) {
          log('warn', 'PUT /todos/:id - Todo not found', { todoId, statusCode: 404 });
          logRequest(method, pathname, 404, `Todo not found: ${todoId}`);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Todo not found' }));
          return;
        }
        
        const updatedTodo = result.rows[0];
        
        // Publicar evento a NATS
        await publishEvent('updated', updatedTodo);
        
        log('info', 'PUT /todos/:id - Todo updated', { 
          todoId: updatedTodo.id,
          completed: updatedTodo.completed,
          statusCode: 200 
        });
        logRequest(method, pathname, 200, `Updated todo ID: ${todoId}`, { todoId, completed });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updatedTodo));
      } catch (err) {
        dbConnected = false;
        log('error', 'Error updating todo', { error: err.message, stack: err.stack, statusCode: 400 });
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
  log('info', 'Todo-backend server started', {
    port: PORT,
    endpoints: [
      { method: 'GET', path: '/todos' },
      { method: 'POST', path: '/todos' }
    ]
  });
});

