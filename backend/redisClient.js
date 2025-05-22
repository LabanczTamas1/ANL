const redis = require('redis');

// Create a Redis client instance
const redisClient = redis.createClient({
  url: "redis://localhost:6380",
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Handle Redis error events
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Handle Redis client end events (when the client disconnects)
redisClient.on('end', () => {
  console.log('Redis client has ended.');
});

// Ensure that Redis client is connected before using it
redisClient.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
});

module.exports = redisClient;
