const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

// Configuración de Postgres
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres-svc.exercises',
  port: 5432,
  database: process.env.POSTGRES_DB || 'pingpongdb',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

console.log('Connecting to Postgres...');

// Inicializar la base de datos
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pongs (
        id SERIAL PRIMARY KEY,
        count INTEGER NOT NULL
      )
    `);
    
    const result = await pool.query('SELECT COUNT(*) FROM pongs');
    if (result.rows[0].count === '0') {
      await pool.query('INSERT INTO pongs (count) VALUES (0)');
      console.log('Database initialized with counter at 0');
    } else {
      const counterResult = await pool.query('SELECT count FROM pongs WHERE id = 1');
      console.log(`Database already initialized. Current counter: ${counterResult.rows[0].count}`);
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDB();

const server = http.createServer(async (req, res) => {
  if (req.url === '/pingpong' && req.method === 'GET') {
    try {
      // Incrementar contador
      await pool.query('UPDATE pongs SET count = count + 1 WHERE id = 1');
      
      // Obtener valor actual
      const result = await pool.query('SELECT count FROM pongs WHERE id = 1');
      const counter = result.rows[0].count;
      
      console.log(`Pong ${counter}`);
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`pong ${counter}\n`);
    } catch (err) {
      console.error('Database error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database error');
    }
    
  } else if (req.url === '/pings' && req.method === 'GET') {
    try {
      // Endpoint para que otros pods obtengan el contador
      const result = await pool.query('SELECT count FROM pongs WHERE id = 1');
      const counter = result.rows[0].count;
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(counter.toString());
    } catch (err) {
      console.error('Database error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('0');
    }
    
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => {
  console.log(`Ping-pong server listening on port ${PORT}`);
  console.log('Endpoints: /pingpong, /pings');
});
