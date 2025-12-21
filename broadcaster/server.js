const { connect, StringCodec } = require('nats');
const fetch = require('node-fetch');

const NATS_URL = process.env.NATS_URL || 'nats://my-nats.project.svc.cluster.local:4222';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_TYPE = process.env.WEBHOOK_TYPE || 'discord';

const sc = StringCodec();

const log = (level, message, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...metadata
  };
  console.log(JSON.stringify(logEntry));
};

const sendToDiscord = async (message) => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Todo Bot',
        content: message,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }
    
    log('info', 'Message sent to Discord', { message });
  } catch (err) {
    log('error', 'Failed to send message to Discord', { error: err.message });
    throw err;
  }
};

const sendToSlack = async (message) => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }
    
    log('info', 'Message sent to Slack', { message });
  } catch (err) {
    log('error', 'Failed to send message to Slack', { error: err.message });
    throw err;
  }
};

const sendToTelegram = async (message) => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }
    
    log('info', 'Message sent to Telegram', { message });
  } catch (err) {
    log('error', 'Failed to send message to Telegram', { error: err.message });
    throw err;
  }
};

const sendToGeneric = async (message) => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: 'bot',
        message: message,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Generic webhook error: ${response.status}`);
    }
    
    log('info', 'Message sent to generic webhook', { message });
  } catch (err) {
    log('error', 'Failed to send message to generic webhook', { error: err.message });
    throw err;
  }
};

const sendMessage = async (message) => {
  if (!WEBHOOK_URL) {
    log('warn', 'WEBHOOK_URL not configured, skipping message', { message });
    return;
  }
  
  switch (WEBHOOK_TYPE) {
    case 'discord':
      return sendToDiscord(message);
    case 'slack':
      return sendToSlack(message);
    case 'telegram':
      return sendToTelegram(message);
    case 'generic':
      return sendToGeneric(message);
    default:
      log('error', 'Unknown WEBHOOK_TYPE', { type: WEBHOOK_TYPE });
      throw new Error(`Unknown WEBHOOK_TYPE: ${WEBHOOK_TYPE}`);
  }
};

const startBroadcaster = async () => {
  try {
    log('info', 'Connecting to NATS', { url: NATS_URL });
    
    const nc = await connect({
      servers: NATS_URL,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
    });
    
    log('info', 'Connected to NATS successfully');
    
    // Subscribe to todo events with queue group
    // Queue group ensures only ONE broadcaster processes each message
    const sub = nc.subscribe('todo.events', { queue: 'broadcasters' });
    
    log('info', 'Subscribed to todo.events with queue group "broadcasters"');
    
    (async () => {
      for await (const msg of sub) {
        try {
          const data = sc.decode(msg.data);
          const event = JSON.parse(data);
          
          log('info', 'Received event from NATS', { event });
          
          let message = '';
          switch (event.action) {
            case 'created':
              message = `📝 New todo created: "${event.todo.text}"`;
              break;
            case 'updated':
              const status = event.todo.completed ? 'completed ✅' : 'reopened 🔄';
              message = `🔔 Todo ${status}: "${event.todo.text}"`;
              break;
            case 'deleted':
              message = `🗑️ Todo deleted: "${event.todo.text}"`;
              break;
            default:
              message = `ℹ️ Todo ${event.action}: "${event.todo.text}"`;
          }
          
          await sendMessage(message);
          
        } catch (err) {
          log('error', 'Error processing message', { error: err.message });
        }
      }
    })();
    
    log('info', 'Broadcaster started successfully');
    
  } catch (err) {
    log('error', 'Failed to start broadcaster', { error: err.message });
    process.exit(1);
  }
};

startBroadcaster();
