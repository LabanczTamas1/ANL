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

(async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis successfully.');

    // Ensure an admin account exists
    await ensureAdminAccount();
  } catch (err) {
    console.error('Error during server initialization:', err);
  }
})();


// Google authentication route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('http://localhost:5173/progress')
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
          await redisClient.hSet(
            `${userKey}`,
            'role', `user`
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

// Ensure Admin Account Exists
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

app.post("/api/save-email", authenticateJWT, async (req, res) => {
  const { subject, recipient, body , name} = req.body;

  
  // Validate the incoming data
  if (!subject || !recipient || !body) {
    return res.status(400).json({ error: "All fields (subject, recipient, body) are required" });
  }

  try {
    // Debug input values
    console.log("Incoming Data:", { subject, recipient, body , name});

    // Serialize body and recipient if needed
    const recipientString = typeof recipient === "string" ? recipient : JSON.stringify(recipient);
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);

    // Verify the JWT token to get the user info
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming 'Bearer <token>'
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'yourSecretKey'); // Replace with your secret key
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userName = `username:${name}`;
    console.log("------------", userName);
    const userId = await redisClient.get(userName);

    console.log("Here is the id:", userId);


    const userData = await redisClient.hGetAll(`user:${userId}`);
    console.log("User Data: ", userData);

    const fromEmail = userData.email;

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing in the token" });
    }

    const mailId = uuidv4();
    const emailDetails = `MailDetails:${mailId}`;

    
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    // Save email data in Redis as a hash
    await redisClient.hSet(emailDetails, {
      fromId: userId,  // Store userId as 'from'
      fromName: name,
      fromEmail: fromEmail,
      subject: subject,
      recipient: recipientString,  // Use the serialized string here
      body: bodyString,
      timeSended: timestamp             // Use the serialized string here
    });


    const inboxRankingName = `inbox:${userId}`;
    await redisClient.zAdd(inboxRankingName, {
      score: timestamp,
      value: mailId
    });

    const sentMailRankingName = `SentMail:${userId}`;
    await redisClient.zAdd(sentMailRankingName, {
      score: timestamp,
      value: mailId
    });

    // Fetch and log stored data for debugging
    const storedData = await redisClient.hGetAll(emailDetails); // Corrected emailDetails variable name
    console.log("Stored Data in Redis:", storedData);

    // Set a TTL (optional): e.g., expire the email data after 30 days
    await redisClient.expire(emailDetails, 30 * 24 * 60 * 60); // 30 days in seconds

    res.status(200).json({ message: "Email saved successfully", id: mailId }); // Use mailId here
  } catch (error) {
    console.error("Error saving email:", error);
    res.status(500).json({ error: "Failed to save email" });
  }
});

app.get("/inbox/:username", async (req, res) => {
  const { username } = req.params;
  console.log("Your username: ", username);
  const userNameCreated = `username:${username}`;

  try {
    const userId = await redisClient.get(userNameCreated);
    console.log("User ID:", userId);

    const mails = await redisClient.zRange(`inbox:${userId}`, 0, -1);
    console.log("Your mails:", mails);

    // Fetch details for each mail ID
    const mailDetails = await Promise.all(
      mails.map((mailId) => redisClient.hGetAll(`MailDetails:${mailId}`))
    );

    console.log("Mail details:", mailDetails);
    res.json(mailDetails); // Return the mail details
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/sentmails/:username", async (req, res) => {
  const { username } = req.params;
  console.log("Your username: ", username);
  const userNameCreated = `username:${username}`;

  try {
    const userId = await redisClient.get(userNameCreated);
    console.log("User ID:", userId);

    const mails = await redisClient.zRange(`SentMail:${userId}`, 0, 1);
    console.log("Your mails:", mails);

    // Fetch details for each mail ID
    const mailDetails = await Promise.all(
      mails.map((mailId) => redisClient.hGetAll(`MailDetails:${mailId}`))
    );

    console.log("Mail details:", mailDetails);
    res.json(mailDetails); // Return the mail details
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Kanban//

app.post("/api/columns", authenticateJWT, async (req, res) => {
  const { priority, columnName, cardNumbers } = req.body;


  try {
    // Get user information from the JWT token
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'yourSecretKey'); // Replace with your secret key
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const columnId = `${uuidv4()}`;

    await redisClient.zAdd(`KanbanTable`, { score: priority, value: columnId });

    await redisClient.hSet(`Boards:${columnId}`, {
      ColumnName: columnName,
      CardNumber: cardNumbers
    });

    // Respond with the new columnId
    console.log(req.body);
    res.json({ columnId, columnName, priority, cardNumbers });
  } catch (error) {
    console.error("Error saving column:", error);
    res.status(500).json({ error: "Failed to save column" });
  }
});

app.get('/api/columns', authenticateJWT, async (req, res) => {
  try {
    const columnIds = await redisClient.zRange('KanbanTable', 0, -1); // Fetch all column IDs

    const columnDetails = await Promise.all(
      columnIds.map(async (columnId) => {
        const columnData = await redisClient.hGetAll(`Boards:${columnId}`);
        return {
          id: columnId,
          name: columnData.ColumnName, // Assuming `ColumnName` is the name of the column
          cardNumber: parseInt(columnData.CardNumber, 10), // Parse the cardNumber correctly
        };
      })
    );

    res.json({ columns: columnDetails }); // Send columns to frontend

  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});


app.put("/api/columns/priority", authenticateJWT, async (req, res) => {
  const columns = req.body.columns;

  if (!Array.isArray(columns) || columns.length === 0) {
    return res.status(400).json({ error: "Invalid request: columns array is required" });
  }

  try {
    // Process each column update and update priority in the sorted set
    const updatePromises = columns.map((column) => {
      const { columnId, priority } = column;
      if (!columnId || priority === undefined) {
        throw new Error("Invalid column data: columnId and priority are required");
      }
      return redisClient.zAdd("KanbanTable", { score: priority, value: columnId });
    });

    await Promise.all(updatePromises);
    res.status(200).json({ success: true, message: "Priorities updated successfully" });
  } catch (error) {
    console.error("Error updating column priority:", error);
    res.status(500).json({ error: "Failed to update priority" });
  }
});


app.delete("/api/columns/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    // Remove the column from the sorted set
    await redisClient.zRem("KanbanTable", id);

    // Remove the column details
    await redisClient.del(`Boards:${id}`);

    res.status(200).json({ success: true, message: "Column deleted successfully" });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Failed to delete column" });
  }
});



app.post("/api/cards", authenticateJWT, async (req, res) => {
  const {
    name,
    isCommented,
    columnId,
    contactName,
    businessName,
    firstContact,
    phoneNumber,
    email,
    website,
    instagram,
    facebook
  } = req.body;

  console.log("Received data:", req.body);
  console.log(name);

  if (!name || !columnId) {
    return res.status(400).json({ error: "Card name and column ID are required" });
  }

  try {
    // Get user information from the JWT token
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'yourSecretKey'); // Replace with your secret key
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.userId; // Assuming the token includes `userId`
    const cardId = `${uuidv4()}`;
    const timestamp = Date.now();

    console.log(timestamp);
    const BoardKey = `SortedCards:${columnId}`;

    // Correct usage of zAdd
    await redisClient.zAdd(BoardKey, [{ score: timestamp, value: cardId }]);

    console.log(BoardKey);

    console.log(typeof timestamp); // Should output "number"
    console.log(typeof cardId); // Should output "string"
    console.log(isCommented.toString());
    // Save card in Redis
    await redisClient.hSet(`CardDetails:${cardId}`, {
      ColumnId: columnId,
      ContactName: contactName,
      BusinessName: businessName,
      DateOfAdded: timestamp,
      FirstContact: firstContact,
      PhoneNumber: phoneNumber,
      Email: email,
      Website: website,
      Instagram: instagram,
      Facebook: facebook,
      IsCommented: String(isCommented)
    });

    console.log(redisClient.hGetAll(`CardDetails:${cardId}`));

    res.status(200).json({ message: "Card saved successfully", cardId });
  } catch (error) {
    console.error("Error saving card:", error);
    res.status(500).json({ error: "Failed to save card" });
  }
});



app.put("/api/cardsnot/:cardId", authenticateJWT, async (req, res) => {
  const { cardId } = req.params;
  const { columnId } = req.body;

  console.log("CardId:", cardId);
  console.log("ColumnId:", columnId);

  if (!columnId) {
    return res.status(400).json({ error: "Column ID is required" });
  }

  try {
    // Get user information from the JWT token
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'yourSecretKey'); // Replace with your secret key
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.userId; // Assuming the token includes `userId`
    const timestamp = Date.now();

    const BoardKey = `SortedCards:${columnId}`;

    // First, remove the card from the old column (if it exists)
    const currentColumnId = await redisClient.hGet(`CardDetails:${cardId}`, 'ColumnId');
    if (currentColumnId) {
      const oldBoardKey = `SortedCards:${currentColumnId}`;
      // Remove card from old column's sorted set
      await redisClient.zRem(oldBoardKey, cardId);
    }

    // Now, update the column for this card in Redis
    await redisClient.hSet(`CardDetails:${cardId}`, 'ColumnId', columnId);

    // Add the card to the new column's sorted set
    await redisClient.zAdd(BoardKey, [{ score: timestamp, value: cardId }]);

    res.status(200).json({ message: "Card updated successfully" });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

app.delete("/api/cards/:cardId", authenticateJWT, async (req, res) => {
  const { cardId } = req.params;
  const { columnId } = req.body;

  console.log("CardId deleting:", cardId);
  console.log("ColumnId deleting:", columnId);

  // Validate columnId presence
  if (!columnId) {
    return res.status(400).json({ error: "Column ID is required" });
  }

  try {
    // Get and verify JWT token
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKey'); // Use env variable for JWT secret

    // Define Redis keys
    const cardDetailsKey = `CardDetails:${cardId}`;
    const boardKey = `SortedCards:${columnId}`;

    console.log(cardDetailsKey, boardKey);

    // Check if card exists in Redis
    const cardExists = await redisClient.exists(cardDetailsKey);
    if (!cardExists) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Remove the card from the sorted set of the current column
    await redisClient.zRem(boardKey, cardId); // Correctly removing the card from the Redis sorted set

    // Optionally, remove the card details if required (if you're storing the card in Redis as well)
    await redisClient.del(cardDetailsKey); // Deletes the card details

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error.message || error);
    res.status(500).json({ error: "An error occurred while deleting the card" });
  }
});




//Todo
app.post("/api/cards/comments", authenticateJWT, async (req, res) => {
  const { userName, body } = req.body;

  const commentId = `${uuidv4()}`;
  const timestamp = Date.now();

  await redisClient.hSet(`Comments:${cardId}`, {
    CommentId: commentId,
    UserName: userName,
    DateAdded: timestamp,
    Body: body
  });

});

app.get('/api/cards/:columnId', authenticateJWT, async (req, res) => {
  const {columnId} = req.params;
  try {

    const cardIds = await redisClient.zRange(`SortedCards:${columnId}`, 0, -1);

    const cardDetails = await Promise.all(
      cardIds.map(async (cardId) => { // Make the callback async
        const cardD = await redisClient.hGetAll(`CardDetails:${cardId}`);
        //console.log(`Details for ${cardId}:`, cardD); // Log each card's details
        return cardD; // Return the result for use in Promise.all
      })
    );


    res.json({ cardDetails,cardIds });
   
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
    
});


app.put("/api/cards/priority", authenticateJWT, async (req, res) => {
  console.log("Received data for priority update:", req.body);
  const { sourceColumnId, destinationColumnId, cardId, newIndex } = req.body;

  // Validate the request body
  if (!sourceColumnId || !destinationColumnId || !cardId || newIndex === undefined) {
    console.error("Invalid request body:", { sourceColumnId, destinationColumnId, cardId, newIndex });
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    // Extract and verify the JWT token
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "yourSecretKey"); // Replace with your secret key
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.userId; // Extract `userId` from the token

    const sourceBoardKey = `SortedCards:${sourceColumnId}`;
    const destinationBoardKey = `SortedCards:${destinationColumnId}`;

    // Step 1: Remove the card from the source column if necessary
    if (sourceColumnId !== destinationColumnId) {
      const removed = await redisClient.zRem(sourceBoardKey, cardId);
      if (removed === 0) {
        console.warn(`Card ${cardId} not found in column ${sourceColumnId}`);
      } else {
        console.log(`Removed card ${cardId} from column ${sourceColumnId}`);
      }
    }

    // Step 2: Add the card to the destination column with the new priority
    await redisClient.zAdd(destinationBoardKey, [{ score: newIndex, value: cardId }]);
    console.log(`Added card ${cardId} to column ${destinationColumnId} with priority ${newIndex}`);

    // Step 3: Reorder cards within the destination column
    const destinationCards = await redisClient.zRangeWithScores(destinationBoardKey, 0, -1);

    // Remove the moved card and insert it at the new index
    const reorderedCards = destinationCards.filter((card) => card.value !== cardId);
    reorderedCards.splice(newIndex, 0, { score: newIndex, value: cardId });

    // Adjust the scores for all cards to maintain the order
    for (let i = 0; i < reorderedCards.length; i++) {
      reorderedCards[i].score = i; // Reassign scores sequentially
    }

    // Step 4: Clear the sorted set in the destination column
    await redisClient.zRemRangeByRank(destinationBoardKey, 0, -1); // Clear all cards

    // Step 5: Re-add the reordered cards back to Redis with updated scores
    for (const card of reorderedCards) {
      await redisClient.zAdd(destinationBoardKey, [{ score: card.score, value: card.value }]);
    }

    console.log(`Successfully reordered cards in column ${destinationColumnId}`);

    // Step 6: Update the card details in Redis
    const timestamp = Date.now();
    await redisClient.hSet(`CardDetails:${cardId}`, {
      ColumnId: destinationColumnId, // Update column ID
      DateOfAdded: timestamp, // Optionally update timestamp
    });

    console.log(`Updated card ${cardId}: moved to column ${destinationColumnId}`);
    res.status(200).json({ message: "Card priority updated successfully" });
  } catch (error) {
    console.error("Error updating card priority:", error);
    res.status(500).json({ error: "Failed to update card priority" });
  }
});





  
  