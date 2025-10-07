require('dotenv').config();
const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient({
   url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().then(() => console.log('Redis connected in listAllUsers.js'));

const listAllUsers = async () => {
  try {
    console.log('Listing all users from Redis...');
    
    // Get all keys matching the pattern 'user:*'
    const userKeys = await redisClient.keys('user:*');

    // Filter out email and username reference keys
    const actualUserKeys = userKeys.filter(
      key => !key.startsWith('user:email:') && !key.startsWith('user:username:')
    );

    console.log(`Found user keys: ${actualUserKeys}`);

    const users = [];

    for (const userKey of actualUserKeys) {
      const type = await redisClient.type(userKey);

      // Only process hash keys
      if (type === 'hash') {
        const userData = await redisClient.hGetAll(userKey);

        if (userData && Object.keys(userData).length > 0) {
          // Exclude password for security
          const { password, ...safeUserData } = userData;
          users.push(safeUserData);
        }
      } else {
        console.log(`Skipping ${userKey} (type=${type})`);
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
