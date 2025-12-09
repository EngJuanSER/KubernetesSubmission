const fs = require('fs');
const crypto = require('crypto');

// Generar UUID al inicio (persiste durante la vida del contenedor)
const randomString = crypto.randomUUID();
const filePath = '/usr/src/app/files/log.txt';

console.log(`Writer started with UUID: ${randomString}`);

// Escribir cada 5 segundos
setInterval(() => {
  const timestamp = new Date().toISOString();
  const line = `${timestamp}: ${randomString}\n`;
  
  // Append al archivo
  fs.appendFileSync(filePath, line);
  console.log(`Written: ${line.trim()}`);
}, 5000);

console.log('Writer running, writing every 5 seconds...');
