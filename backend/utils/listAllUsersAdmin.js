const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient({
  url: 'redis://localhost:6380',
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().then(() => console.log('Redis connected in listAllUsers.js'));

const listAllUsers = async () => {
  try {
    // Get all keys matching the pattern 'user:*' but not 'user:email:*'
    const userKeys = await redisClient.keys('user:*');
    
    // Filter out email reference keys
    const actualUserKeys = userKeys.filter(key => !key.startsWith('user:email:'));
    
    const users = [];

    for (const userKey of actualUserKeys) {
      const userData = await redisClient.hGetAll(userKey);

      if (userData && Object.keys(userData).length > 0) {
        // Don't include the password in the returned data for security
        const { password, ...safeUserData } = userData;
        users.push(safeUserData);
      }
    }

    console.log(`Successfully listed all users: ${users.length} found`);
    return users;
  } catch (error) {
    console.error('Error listing all users:', error);
    return []; // Return an empty array in case of error
  }
};

module.exports = listAllUsers;