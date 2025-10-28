const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 20000,
    reconnectStrategy: (retries) => {
      console.log(`🔄 Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 3000);
    }
  }
});

// EVENTS
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis is ready to use');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('end', () => {
  console.log('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// CONNECT
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

module.exports = redisClient;
