const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
require('./passport');
//const redisClient = require('./redisClient');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());


const allowedOrigins = ['http://localhost:5173', 'http://192.168.0.134:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
console.log("server.js-----------------");
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

// Middleware to handle sessions
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

const redisClient = redis.createClient({
    url: 'redis://localhost:6380'
});

// Redis Client event listeners
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis successfully');
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

// Google authentication route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/profile')
);

// Profile route (protected)
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`
    <h1>Welcome, ${req.user.displayName}</h1>
    <pre>${JSON.stringify(req.user, null, 2)}</pre>
  `);
});

// Home route
app.get('/', (req, res) => {
  res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a><br><a href="/auth/facebook">Login with Facebook</a>');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


    

app.post('/register', async (req, res) => {
    const { firstName, lastName, email, username, password, confirmPassword } = req.body;

    // Step 1: Log the incoming request body
    console.log('Received registration request:', req.body);

    // Validate request fields
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        // Step 2: Check if the username already exists in Redis
        console.log(`Checking if username "${username}" exists in Redis...`);
        const existingUser = await redisClient.hGetAll(`username:${username}`);
        console.log('Existing user:', existingUser);

        if (existingUser && Object.keys(existingUser).length > 0) {
            return res.status(400).json({ error: `Username "${username}" already exists` });
        }

        // Step 3: Generate a unique ID for the user
        const userId = uuidv4();
        console.log('Generated unique user ID:', userId);

        // Step 4: Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed:', hashedPassword);

        // Step 5: Save the user in Redis
        const userKey = `user:${userId}`;
        await redisClient.sAdd('users', `${userId}`);

        const usernameKey = `username:${username}`;
        const emailKey = `email:${email}`;


   

        await redisClient.hSet(
            `${userKey}`,
            'firstName', firstName,
          );
          await redisClient.hSet(
            `${userKey}`,
            'lastName', lastName,
          );
          
          await redisClient.hSet(
            `${userKey}`,
            'email', email,
          );
          await redisClient.hSet(
            `${userKey}`,
            'username', username,
          );
          await redisClient.hSet(
            `${userKey}`,
            'hashedPassword', hashedPassword
          );
        
        console.log('User saved to Redis successfully');
        
        
        // Save the username-to-ID mapping for quick lookups
        console.log(`Saving username mapping to Redis under key "${usernameKey}"...`);
        await redisClient.set(usernameKey, userId);
        await redisClient.set(emailKey, userId);

        // Step 6: Retrieve and log the saved user from Redis
        const savedUser = await redisClient.hGetAll(userKey);
        console.log('Retrieved saved user from Redis:', savedUser);

        // Step 7: Send success response with saved user data
        res.status(201).json({ message: 'User registered successfully', user: savedUser });

    } catch (error) {
        // General error handling
        console.error('Error saving or retrieving user from Redis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;

    // Log the incoming request for debugging
    console.log('Received login request:', req.body);

    // Check if both identifier and password are provided
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    try {
      let user = null;

      // Check if the identifier is an email or username
      if (identifier.includes('@')) {
        // Identifier is likely an email, fetch user by email
        console.log(`Fetching user by email: ${identifier}`);
        const userId = await redisClient.get(`email:${identifier}`);
        if (userId) {
          user = await redisClient.hGetAll(`user:${userId}`);
        }
      } else {
        // Identifier is a username, fetch user by username
        console.log(`Fetching user by username: ${identifier}`);
        const userId = await redisClient.get(`username:${identifier}`);
        if (userId) {
          user = await redisClient.hGetAll(`user:${userId}`);
        }
      }

      // If no user found, return an error
      if (!user || Object.keys(user).length === 0) {
        return res.status(401).json({ error: 'Invalid identifier or password' });
      }

      console.log('User found:', user);

      // Validate the password with bcrypt
      const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Invalid identifier or password' });
      }

      // Generate JWT
      const token = jwt.sign(
        { username: user.username, email: user.email },
        'yourSecretKey', // Replace with an environment variable for secret key
        { expiresIn: '1h' }
      );

      // Respond with the user data and token
      res.json({
        message: 'Login successful',
        token,
        user: { username: user.username, email: user.email }
      });

    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

  

  const authenticateJWT = (req, res, next) => {
    // Retrieve the JWT from the authorization header
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
  
    // Verify the JWT using the secret key
    jwt.verify(token, 'yourSecretKey', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = user; // Attach the user info to the request object
      next();
    });
  };
  
  // Protect the profile route with JWT authentication
  app.get('/profile', authenticateJWT, (req, res) => {
    res.send(`Welcome ${req.user.username}!`);
  });
  
  
  

// Get user by username
app.get('/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await redisClient.hGetAll(`user:${username}`);
    if (!user || Object.keys(user).length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
