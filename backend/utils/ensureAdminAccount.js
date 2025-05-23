const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient({
  url: 'redis://default:jzA40kSsOunBOxoox33qCrXv6d4vkUp9@redis-12518.c293.eu-central-1-1.ec2.redns.redis-cloud.com:12518',
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().then(() => console.log('Redis connected in ensureAdminAccount.js'));

const ensureAdminAccount = async () => {
  try {
    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';

    // Check if an admin account exists
    const adminId = await redisClient.get(`username:${adminUsername}`);
    if (adminId) {
      console.log('Admin account already exists in the database.');
      return;
    }

    // Create a new admin account if it doesn't exist
    const adminIdGenerated = uuidv4();
    const adminPassword = 'Admin123!'; // You can make this configurable
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminKey = `user:${adminIdGenerated}`;
    await redisClient.sAdd('users', `${adminIdGenerated}`);

    await redisClient.hSet(adminKey, {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      username: adminUsername,
      hashedPassword: hashedPassword,
      role: 'admin',
    });

    await redisClient.set(`username:${adminUsername}`, adminIdGenerated);
    await redisClient.set(`email:${adminEmail}`, adminIdGenerated);

    console.log('Admin account created successfully:', {
      username: adminUsername,
      password: adminPassword,
    });
  } catch (error) {
    console.error('Error ensuring admin account exists:', error);
  }
};

module.exports = ensureAdminAccount;
