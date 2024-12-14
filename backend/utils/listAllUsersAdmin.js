const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient({
  url: 'redis://localhost:6380',
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().then(() => console.log('Redis connected in listAllUsers.js'));

const listAllUsers = async () => {
  try {
    // Get all user IDs from Redis
    const userIds = await redisClient.sMembers('users');
    const users = [];

    for (const userId of userIds) {
      const userKey = `user:${userId}`;
      const userData = await redisClient.hGetAll(userKey);

      if (userData && Object.keys(userData).length > 0) {
        users.push(userData); // Push the user data to the array
      }
    }

    console.log('Successfully listed all users:', users);
    return users; // Return the list of users
  } catch (error) {
    console.error('Error listing all users:', error);
    return []; // Return an empty array in case of error
  }
};

// Correct export: export listAllUsers, not listAllUsersAdmin
module.exports = listAllUsers;
