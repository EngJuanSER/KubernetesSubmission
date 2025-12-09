const crypto = require('crypto');

// Generate a random string at startup
const randomString = crypto.randomUUID();

console.log(`Application started. Random string: ${randomString}`);

// Print timestamp and random string every 5 seconds
setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
}, 5000);
