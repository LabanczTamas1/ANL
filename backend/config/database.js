const redis = require("redis");

let redisClient = null;

async function initializeRedisClient() {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis successfully");
  });

  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully.");
  } catch (err) {
    console.error("Error during Redis initialization:", err);
    throw err;
  }

  return redisClient;
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call initializeRedisClient first.");
  }
  return redisClient;
}

module.exports = {
  initializeRedisClient,
  getRedisClient,
};
