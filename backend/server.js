const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcrypt");
const redis = require("redis");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ensureAdminAccount = require("./utils/ensureAdminAccount");
const listAllUsersAdmin = require("./utils/listAllUsersAdmin");
const { handleContactSubmission } = require("./utils/mail_utils/contact");
require("dotenv").config();
require("./passport");
const nodemailer = require("nodemailer");
//const redisClient = require('./redisClient');
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.134:5173",
  "http://192.168.0.156:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Block other origins
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies to be sent across domains
};

app.use(cors(corsOptions));
console.log("server.js-----------------");
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

// Middleware to handle sessions
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Request Headers:", req.headers);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

const redisClient = redis.createClient({
  url: "redis://localhost:6380",
});

// Redis Client event listeners
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully");
});

(async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log("Connected to Redis successfully.");
  } catch (err) {
    console.error("Error during server initialization:", err);
  }
})();

ensureAdminAccount();
app.post("/api/contact", handleContactSubmission);

// Google authentication route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("http://localhost:5173/progress")
);

// Profile route (protected)
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.send(`
    <h1>Welcome, ${req.user.displayName}</h1>
    <pre>${JSON.stringify(req.user, null, 2)}</pre>
  `);
});

// Home route
app.get("/", (req, res) => {
  res.send(
    '<h1>Home</h1><a href="/auth/google">Login with Google</a><br><a href="/auth/facebook">Login with Facebook</a>'
  );
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/register", async (req, res) => {
  const { firstName, lastName, email, username, password, confirmPassword } =
    req.body;

  // Step 1: Log the incoming request body
  console.log("Received registration request:", req.body);

  // Validate request fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !username ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Step 2: Check if the username already exists in Redis
    console.log(`Checking if username "${username}" exists in Redis...`);
    const existingUser = await redisClient.hGetAll(`username:${username}`);
    console.log("Existing user:", existingUser);

    if (existingUser && Object.keys(existingUser).length > 0) {
      return res
        .status(400)
        .json({ error: `Username "${username}" already exists` });
    }

    // Step 3: Generate a unique ID for the user
    const userId = uuidv4();
    console.log("Generated unique user ID:", userId);

    // Step 4: Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed:", hashedPassword);

    // Step 5: Save the user in Redis
    const userKey = `user:${userId}`;
    await redisClient.sAdd("users", `${userId}`);

    const usernameKey = `username:${username}`;
    const emailKey = `email:${email}`;

    await redisClient.hSet(`${userKey}`, "firstName", firstName);
    await redisClient.hSet(`${userKey}`, "lastName", lastName);

    await redisClient.hSet(`${userKey}`, "email", email);
    await redisClient.hSet(`${userKey}`, "username", username);
    await redisClient.hSet(`${userKey}`, "hashedPassword", hashedPassword);
    await redisClient.hSet(`${userKey}`, "role", `user`);
    await redisClient.hSet(`${userKey}`, "progress", 0);

    console.log("User saved to Redis successfully");

    // Save the username-to-ID mapping for quick lookups
    console.log(
      `Saving username mapping to Redis under key "${usernameKey}"...`
    );
    await redisClient.set(usernameKey, userId);
    await redisClient.set(emailKey, userId);

    // Step 6: Retrieve and log the saved user from Redis
    const savedUser = await redisClient.hGetAll(userKey);
    console.log("Retrieved saved user from Redis:", savedUser);

    // Step 7: Send success response with saved user data
    res
      .status(201)
      .json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    // General error handling
    console.error("Error saving or retrieving user from Redis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  // Log the incoming request for debugging
  console.log("Received login request:", req.body);

  // Check if both identifier and password are provided
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: "Email/Username and password are required" });
  }

  try {
    let user = null;
    let userId = null; // Initialize userId variable

    // Check if the identifier is an email or username
    if (identifier.includes("@")) {
      // Identifier is likely an email, fetch user by email
      console.log(`Fetching user by email: ${identifier}`);
      userId = await redisClient.get(`email:${identifier}`);
      if (userId) {
        user = await redisClient.hGetAll(`user:${userId}`);
      }
    } else {
      // Identifier is a username, fetch user by username
      console.log(`Fetching user by username: ${identifier}`);
      userId = await redisClient.get(`username:${identifier}`);
      if (userId) {
        user = await redisClient.hGetAll(`user:${userId}`);
      }
    }

    // If no user found, return an error
    if (!user || Object.keys(user).length === 0) {
      return res.status(401).json({ error: "Invalid identifier or password" });
    }

    console.log("User found:", user);

    // Validate the password with bcrypt
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid identifier or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { username: user.username, email: user.email },
      "yourSecretKey", // Replace with an environment variable for secret key
      { expiresIn: "1h" }
    );

    // Respond with the user data and token
    res.json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        email: user.email,
        userId: userId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const authenticateJWT = (req, res, next) => {
  // Retrieve the JWT from the authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // Verify the JWT using the secret key
  jwt.verify(token, "yourSecretKey", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user; // Attach the user info to the request object
    next();
  });
};

// Protect the profile route with JWT authentication
app.get("/profile", authenticateJWT, (req, res) => {
  res.send(`Welcome ${req.user.username}!`);
});

app.get("/listAllUsersAdmin", authenticateJWT, async (req, res) => {
  try {
    // Fetch all users
    const users = await listAllUsersAdmin();

    // Return the list of users as JSON
    res.status(200).json(users);
  } catch (error) {
    console.error("Error listing all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Assuming listAllUsersAdmin function is modified to return data directly as discussed earlier

app.patch("/updateUserRole/:userId", async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body; // New role to set (admin, user, owner)

  // Step 1: Log the incoming request
  console.log(
    `Received role change request for user ID: ${userId}, New role: ${role}`
  );

  const userIdReal = await redisClient.get(`username:${userId}`);
  console.log("anything--------", userIdReal);

  // Validate the role input
  if (!["admin", "user", "owner"].includes(role)) {
    return res
      .status(400)
      .json({ error: "Invalid role. Allowed roles are: admin, user, owner" });
  }

  try {
    // Step 2: Check if the user exists in Redis
    const userKey = `user:${userIdReal}`;
    const userData = await redisClient.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 3: Update the role in Redis
    await redisClient.hSet(userKey, "role", role);
    console.log(`User role updated to ${role} for user ID: ${userIdReal}`);

    // Step 4: Send success response
    res
      .status(200)
      .json({ message: `User role updated successfully to ${role}` });
  } catch (error) {
    // General error handling
    console.error("Error changing user role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by username
app.get("/user/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await redisClient.hGetAll(`user:${username}`);
    if (!user || Object.keys(user).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", user);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/save-email", authenticateJWT, async (req, res) => {
  const { subject, recipient, body, name } = req.body;

  // Validate the incoming data
  if (!subject || !recipient || !body) {
    return res
      .status(400)
      .json({ error: "All fields (subject, recipient, body) are required" });
  }

  try {
    // Debug input values
    console.log("Incoming Data:", { subject, recipient, body, name });

    // Serialize body and recipient if needed
    const recipientString =
      typeof recipient === "string" ? recipient : JSON.stringify(recipient);
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);

    // Verify the JWT token to get the user info
    const token = req.headers["authorization"]?.split(" ")[1]; // Assuming 'Bearer <token>'
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "yourSecretKey"); // Replace with your secret key
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
      fromId: userId, // Store userId as 'from'
      fromName: name,
      fromEmail: fromEmail,
      subject: subject,
      recipient: recipientString, // Use the serialized string here
      body: bodyString,
      timeSended: timestamp, // Use the serialized string here
    });

    const inboxRankingName = `inbox:${userId}`;
    await redisClient.zAdd(inboxRankingName, {
      score: timestamp,
      value: mailId,
    });

    const sentMailRankingName = `SentMail:${userId}`;
    await redisClient.zAdd(sentMailRankingName, {
      score: timestamp,
      value: mailId,
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
    res.status(500).json({ error: "Internal server error" });
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
    res.status(500).json({ error: "Internal server error" });
  }
});

//Kanban//

app.post("/api/columns", authenticateJWT, async (req, res) => {
  const { priority, tagColor, columnName, cardNumbers } = req.body;

  try {
    // Get user information from the JWT token
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

    const columnId = `${uuidv4()}`;

    await redisClient.zAdd(`KanbanTable`, { score: priority, value: columnId });

    await redisClient.hSet(`Boards:${columnId}`, {
      ColumnName: columnName,
      tagColor: tagColor,
      CardNumber: cardNumbers,
    });

    // Respond with the new columnId
    console.log(req.body);
    res.json({ columnId, tagColor, columnName, priority, cardNumbers });
  } catch (error) {
    console.error("Error saving column:", error);
    res.status(500).json({ error: "Failed to save column" });
  }
});

app.get("/api/columns", authenticateJWT, async (req, res) => {
  try {
    const columnIds = await redisClient.zRange("KanbanTable", 0, -1); // Fetch all column IDs

    const columnDetails = await Promise.all(
      columnIds.map(async (columnId) => {
        const columnData = await redisClient.hGetAll(`Boards:${columnId}`);
        return {
          id: columnId,
          name: columnData.ColumnName, // Assuming `ColumnName` is the name of the column
          tagColor: columnData.tagColor,
          cardNumber: parseInt(columnData.CardNumber, 10), // Parse the cardNumber correctly
        };
      })
    );

    res.json({ columns: columnDetails }); // Send columns to frontend
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ error: "Failed to fetch columns" });
  }
});

app.put("/api/columns/priority", authenticateJWT, async (req, res) => {
  const columns = req.body.columns;

  if (!Array.isArray(columns) || columns.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid request: columns array is required" });
  }

  try {
    // Process each column update and update priority in the sorted set
    const updatePromises = columns.map((column) => {
      const { columnId, priority } = column;
      if (!columnId || priority === undefined) {
        throw new Error(
          "Invalid column data: columnId and priority are required"
        );
      }
      return redisClient.zAdd("KanbanTable", {
        score: priority,
        value: columnId,
      });
    });

    await Promise.all(updatePromises);
    res
      .status(200)
      .json({ success: true, message: "Priorities updated successfully" });
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

    res
      .status(200)
      .json({ success: true, message: "Column deleted successfully" });
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
    facebook,
  } = req.body;

  console.log("Received data:", req.body);
  console.log(name);

  if (!name || !columnId) {
    return res
      .status(400)
      .json({ error: "Card name and column ID are required" });
  }

  try {
    // Get user information from the JWT token
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

    const userId = decoded.userId; // Assuming the token includes `userId`
    const cardId = `${uuidv4()}`;
    const timestamp = Date.now();

    console.log(timestamp);
    const BoardKey = `SortedCards:${columnId}`;

    // Correct usage of zAdd
    await redisClient.zAdd(BoardKey, [{ score: timestamp, value: cardId }]);

    //update the cardNumber
    const columnData = await redisClient.hGetAll(`Boards:${columnId}`);
    await redisClient.hSet(`Boards:${columnId}`, {
      CardNumber: parseInt(columnData.CardNumber, 10) + 1,
    });
    console.log(parseInt(columnData.CardNumber, 10));

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
      IsCommented: String(isCommented),
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

    const userId = decoded.userId; // Assuming the token includes `userId`
    const timestamp = Date.now();

    const BoardKey = `SortedCards:${columnId}`;

    // First, remove the card from the old column (if it exists)
    const currentColumnId = await redisClient.hGet(
      `CardDetails:${cardId}`,
      "ColumnId"
    );
    if (currentColumnId) {
      const oldBoardKey = `SortedCards:${currentColumnId}`;
      // Remove card from old column's sorted set
      await redisClient.zRem(oldBoardKey, cardId);
    }

    // Now, update the column for this card in Redis
    await redisClient.hSet(`CardDetails:${cardId}`, "ColumnId", columnId);

    // Add the card to the new column's sorted set
    await redisClient.zAdd(BoardKey, [{ score: timestamp, value: cardId }]);

    res.status(200).json({ message: "Card updated successfully" });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

app.put("/api/cards/:cardId", authenticateJWT, async (req, res) => {
  const { name, updatedValue } = req.body;
  const { cardId } = req.params;

  console.log(name, updatedValue);

  if (!name || !updatedValue) {
    return res
      .status(400)
      .json({ error: "Input field id and value are missing$" });
  }

  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "yourSecretKey");
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.userId;
    const timestamp = Date.now();

    await redisClient.hSet(`CardDetails:${cardId}`, name, updatedValue);

    res.status(200).json({ message: "Update was successfull", cardId });
  } catch (error) {
    console.error("Error saving card:", error);
    res.status(500).json({ error: "Failed to save card" });
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
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "yourSecretKey"
    ); // Use env variable for JWT secret

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

    const columnDataDestination = await redisClient.hGetAll(
      `Boards:${columnId}`
    );
    await redisClient.hSet(`Boards:${columnId}`, {
      CardNumber: parseInt(columnDataDestination.CardNumber, 10) - 1,
    });

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error.message || error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the card" });
  }
});

//Kanban cards comments
app.post("/api/cards/comments/:cardId", authenticateJWT, async (req, res) => {
  const { userName, body } = req.body;
  const { cardId } = req.params;
  console.log(userName, body, cardId);

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const commentId = `${uuidv4()}`;
  const timestamp = Date.now();

  await redisClient.hSet(`Comments:${commentId}`, {
    CommentId: commentId,
    UserName: userName,
    DateAdded: timestamp,
    Body: body,
  });

  await redisClient.hSet(`CardDetails:${cardId}`, {
    IsCommented: `true`,
  });

  const CardComments = `CardComments:${cardId}`;
  await redisClient.sAdd(CardComments, `${commentId}`);

  res.status(200).json({ message: "Comment saved succesfully" });
});

app.get("/api/cards/comments/:cardId", authenticateJWT, async (req, res) => {
  const { cardId } = req.params;

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const isCommented = await redisClient.hGet(
    `CardDetails:${cardId}`,
    `IsCommented`
  );

  console.log(isCommented);

  if (isCommented) {
    const CardComments = `CardComments:${cardId}`;
    commentIds = await redisClient.sMembers(CardComments);
    console.log(commentIds);

    const CommentsDetails = await Promise.all(
      commentIds.map(async (Id) => {
        const columnData = await redisClient.hGetAll(`Comments:${Id}`);
        return columnData;
      })
    );

    res.status(200).json({ CommentsDetails });
  } else {
    res.status(200).json({ message: "No comment found." });
  }
});

app.put("/api/cards/comments/:commentId", authenticateJWT, async (req, res) => {
  const { body } = req.body;
  const { commentId } = req.params;
  console.log(commentId, body);

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Check if the comment exists
  const commentKey = `Comments:${commentId}`;
  const commentExists = await redisClient.exists(commentKey);
  if (!commentExists) {
    return res.status(404).json({ error: "Comment not found" });
  }

  // Update the comment body and timestamp
  const timestamp = Date.now();
  await redisClient.hSet(commentKey, {
    Body: body,
    DateUpdated: timestamp,
  });

  res.status(200).json({ message: "Comment updated successfully" });
});

app.delete(
  "/api/cards/comments/:commentId",
  authenticateJWT,
  async (req, res) => {
    const { commentId } = req.params;

    // Retrieve the comment details to find the associated card
    const commentData = await redisClient.hGetAll(`Comments:${commentId}`);

    if (!commentData || Object.keys(commentData).length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const { UserName, Body } = commentData;

    // Find the card associated with this comment
    const cardKeys = await redisClient.keys("CardComments:*");
    let associatedCardId = null;

    for (const cardKey of cardKeys) {
      const isMember = await redisClient.sIsMember(cardKey, commentId);
      if (isMember) {
        associatedCardId = cardKey.split(":")[1]; // Extract cardId
        break;
      }
    }

    if (!associatedCardId) {
      return res
        .status(404)
        .json({ error: "Associated card not found for the comment" });
    }

    // Delete the comment from the Comments hash
    await redisClient.del(`Comments:${commentId}`);

    // Remove the comment from the CardComments set
    await redisClient.sRem(`CardComments:${associatedCardId}`, commentId);

    // Check if the card has any remaining comments
    const remainingComments = await redisClient.sCard(
      `CardComments:${associatedCardId}`
    );
    if (remainingComments === 0) {
      // Update the card to reflect that it no longer has comments
      await redisClient.hSet(`CardDetails:${associatedCardId}`, {
        IsCommented: `false`,
      });
    }

    res.status(200).json({
      message: "Comment deleted successfully",
      deletedComment: {
        commentId,
        userName: UserName,
        body: Body,
      },
    });
  }
);

app.get("/api/cards/:columnId", authenticateJWT, async (req, res) => {
  const { columnId } = req.params;
  try {
    const cardIds = await redisClient.zRange(`SortedCards:${columnId}`, 0, -1);

    const cardDetails = await Promise.all(
      cardIds.map(async (cardId) => {
        // Make the callback async
        const cardD = await redisClient.hGetAll(`CardDetails:${cardId}`);
        //console.log(`Details for ${cardId}:`, cardD); // Log each card's details
        return cardD; // Return the result for use in Promise.all
      })
    );

    //console.log("Cardssssssssssssssssssssssssssssss",cardDetails);

    res.json({ cardDetails, cardIds });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

app.put("/api/cards/change/priority", authenticateJWT, async (req, res) => {
  console.log("Debugginggggggggggggggggggggg");
  //console.log("Received data for priority update:", req.body);
  const { sourceColumnId, destinationColumnId, cardId, newIndex } = req.body;

  // Validate the request body
  if (
    !sourceColumnId ||
    !destinationColumnId ||
    !cardId ||
    newIndex === undefined
  ) {
    console.error("Invalid request body:", {
      sourceColumnId,
      destinationColumnId,
      cardId,
      newIndex,
    });
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
    await redisClient.zAdd(destinationBoardKey, [
      { score: newIndex, value: cardId },
    ]);
    console.log(
      `Added card ${cardId} to column ${destinationColumnId} with priority ${newIndex}`
    );

    // Step 3: Reorder cards within the destination column
    const destinationCards = await redisClient.zRangeWithScores(
      destinationBoardKey,
      0,
      -1
    );

    // Remove the moved card and insert it at the new index
    const reorderedCards = destinationCards.filter(
      (card) => card.value !== cardId
    );
    reorderedCards.splice(newIndex, 0, { score: newIndex, value: cardId });

    // Adjust the scores for all cards to maintain the order
    for (let i = 0; i < reorderedCards.length; i++) {
      reorderedCards[i].score = i; // Reassign scores sequentially
    }

    // Step 4: Clear the sorted set in the destination column
    await redisClient.zRemRangeByRank(destinationBoardKey, 0, -1); // Clear all cards

    // Step 5: Re-add the reordered cards back to Redis with updated scores
    for (const card of reorderedCards) {
      await redisClient.zAdd(destinationBoardKey, [
        { score: card.score, value: card.value },
      ]);
    }

    console.log(
      `Successfully reordered cards in column ${destinationColumnId}`
    );

    // Step 6: Update the card details in Redis
    const timestamp = Date.now();
    await redisClient.hSet(`CardDetails:${cardId}`, {
      ColumnId: destinationColumnId, // Update column ID
      DateOfAdded: timestamp, // Optionally update timestamp
    });

    const columnData = await redisClient.hGetAll(
      `Boards:${destinationColumnId}`
    );
    await redisClient.hSet(`Boards:${destinationColumnId}`, {
      CardNumber: parseInt(columnData.CardNumber, 10) + 1,
    });

    const columnDataDestination = await redisClient.hGetAll(
      `Boards:${sourceColumnId}`
    );
    await redisClient.hSet(`Boards:${sourceColumnId}`, {
      CardNumber: parseInt(columnDataDestination.CardNumber, 10) - 1,
    });

    console.log(
      `Updated card ${cardId}: moved to column ${destinationColumnId}`
    );
    res.status(200).json({ message: "Card priority updated successfully" });
  } catch (error) {
    console.error("Error updating card priority:", error);
    res.status(500).json({ error: "Failed to update card priority" });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded!" });
  }

  // Check if the uploaded file is a JSON file
  if (file.mimetype !== "application/json") {
    return res.status(400).json({ error: "Only JSON files are allowed!" });
  }

  try {
    // Convert buffer to string and parse JSON
    const jsonData = JSON.parse(file.buffer.toString("utf8"));

    // Log the file content
    console.log("Uploaded JSON Data:", jsonData.lists);

    // Access cards directly from jsonData
    if (jsonData.cards && Array.isArray(jsonData.cards)) {
      jsonData.lists.forEach(async (list, index) => {
        //console.log(`Column ${index + 1}:`, list);
        await redisClient.zAdd(`KanbanTable`, {
          score: list.pos,
          value: list.id,
        });

        await redisClient.hSet(`Boards:${list.id}`, {
          ColumnName: list.name,
          tagColor: `red`,
          CardNumber: parseInt(0),
        });
      });
      jsonData.cards.forEach(async (card, index) => {
        //console.log(`Card ${index + 1}:`, card.desc, card.idList);

        const lines = card.desc.split("\n");

        // Extract text after the colon and store in an array
        const result = lines.map((line) => {
          const parts = line.split(":"); // Split by colon
          return parts.length > 1 ? parts.slice(1).join(":").trim() : ""; // Get text after colon
        });
        //result[2]=result[1];
        if (result[2] != []) {
          const timestamp = Date.now();

          const BoardKey = `SortedCards:${card.idList}`;

          // Correct usage of zAdd
          await redisClient.zAdd(BoardKey, [
            { score: timestamp, value: card.id },
          ]);

          //update the cardNumber
          const columnData = await redisClient.hGetAll(`Boards:${card.idList}`);
          const increasedInt = parseInt(columnData.CardNumber, 10) + 1;

          await redisClient.hIncrBy(`Boards:${card.idList}`, "CardNumber", 1);

          //console.log(card.desc);

          //console.log(result);

          await redisClient.hSet(`CardDetails:${card.id}`, {
            ColumnId: card.idList,
            ContactName: result[0] || "Unknown", // Default to "Unknown" if not available
            BusinessName: result[2], // Already ensured above
            DateOfAdded: timestamp,
            FirstContact: "none",
            PhoneNumber: result[3] || "N/A", // Default to "N/A" if not available
            Email: result[5] || "N/A",
            Website: result[14] || "N/A",
            Instagram: result[16] || "N/A",
            Facebook: result[18] || "N/A",
            IsCommented: String(false),
          });
        }
      });
    } else {
      console.log("No cards found in the uploaded JSON.");
    }

    res.json({ message: "File uploaded and logged successfully!" });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    res.status(400).json({ error: "Invalid JSON file!" });
  }
});

app.get("/api/export", async (req, res) => {
  try {
    // Retrieve KanbanTable
    const kanbanTable = await redisClient.zRangeWithScores(
      "KanbanTable",
      0,
      -1
    );

    // Prepare `lists` array
    const lists = [];
    for (const board of kanbanTable) {
      const boardId = board.value;
      const boardDetails = await redisClient.hGetAll(`Boards:${boardId}`);
      lists.push({
        id: boardId,
        name: boardDetails.ColumnName,
        pos: board.score, // Score used as position
      });
    }

    // Prepare `cards` array
    const cards = [];
    for (const board of kanbanTable) {
      const boardId = board.value;
      const sortedCardsKey = `SortedCards:${boardId}`;
      const sortedCards = await redisClient.zRangeWithScores(
        sortedCardsKey,
        0,
        -1
      );

      for (const card of sortedCards) {
        const cardId = card.value;
        const cardDetails = await redisClient.hGetAll(`CardDetails:${cardId}`);
        cards.push({
          id: cardId,
          idList: cardDetails.ColumnId,
          desc: `Name: ${cardDetails.ContactName}\nBusiness: ${cardDetails.BusinessName}\nPhone: ${cardDetails.PhoneNumber}\nEmail: ${cardDetails.Email}\nWebsite: ${cardDetails.Website}\nInstagram: ${cardDetails.Instagram}\nFacebook: ${cardDetails.Facebook}`,
          pos: card.score, // Use score as position
        });
      }
    }

    // Reconstruct the original JSON structure
    const exportData = {
      lists,
      cards,
    };

    console.log(exportData);

    // Send the JSON data
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ error: "Failed to export data!" });
  }
});

//Availability

async function checkCustomAvailability(
  date,
  standardAvailabilityArr,
  openClosedFlag
) {
  console.log("Checking custom availability on this day", date);
  console.log(openClosedFlag);
  console.log(standardAvailabilityArr);
  if (openClosedFlag === "both") {
    let addedTimes = await redisClient.zRange(`AddedTimes:${date}`, 0, -1);
    addedTimes = addedTimes.map((item) => Number(item));
    let deletedTimes = await redisClient.zRange(`DeletedTimes:${date}`, 0, -1);
    deletedTimes = deletedTimes.map((item) => Number(item));
    console.log("Added Times: ", addedTimes);
    let allSet = new Set([...standardAvailabilityArr, ...addedTimes]);
    let allAvailableTimes = [...allSet];
    allAvailableTimes = allAvailableTimes.filter(
      (item) => !deletedTimes.includes(item)
    );
    console.log("Merged Array: ", allAvailableTimes);
  }
  return standardAvailabilityArr;
}

app.patch(
  "/api/availability/standard-availability",
  authenticateJWT,
  async (req, res) => {
    const { availableTimes } = req.body;

    console.log("Received availableTimes:", availableTimes);

    // Validate the presence of availableTimes
    if (!Array.isArray(availableTimes)) {
      return res
        .status(400)
        .json({ error: "Invalid input: availableTimes must be an array" });
    }

    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      // Use Promise.all to handle asynchronous operations properly
      await Promise.all(
        availableTimes.map(async (entry) => {
          // Ensure all values are present before saving
          if (!entry.day || !entry.openingTime || !entry.closingTime) {
            throw new Error(`Missing data for day: ${entry.day}`);
          }

          // Log the entry for debugging
          console.log(`Saving availability for: ${entry.day}`, entry);
          console.log(entry.isDayOff);
          // Ensure property names are properly capitalized for Redis keys
          await redisClient.hSet(`StandardAvailability:${entry.day}`, {
            OpeningTime: entry.openingTime, // Ensure consistency with input field name
            ClosingTime: entry.closingTime, // Ensure consistency with input field name
            IsDayOff: entry.isDayOff.toString(), // Store boolean as string
          });
        })
      );

      res.status(200).json({ message: "Availability updated successfully" });
    } catch (error) {
      console.error("Error updating availability:", error);
      res
        .status(500)
        .json({ error: `Failed to update availability: ${error.message}` });
    }
  }
);

app.get(
  "/api/availability/standard-availability",
  authenticateJWT,
  async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    try {
      const standardAvailability = await Promise.all(
        daysOfWeek.map(async (day) => {
          const availability = await redisClient.hGetAll(
            `StandardAvailability:${day}`
          );
          return {
            day,
            openingTime: availability.OpeningTime,
            closingTime: availability.ClosingTime,
            isDayOff: availability.IsDayOff === "true",
          };
        })
      );

      console.log(JSON.stringify(standardAvailability, null, 2)); // Properly log the resolved data
      res.status(200).json(standardAvailability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getAvailableTimes(start, end, increment) {
  const result = [];
  for (let i = start; i < end; i += increment) {
    // Use < for exclusive end
    result.push(i);
  }
  return result;
}

function getUnavailableTimes(availableStart, availableEnd) {
  // Create a list of all available hours (0 to 23)
  const allAvailableHours = getAvailableTimes(0, 1440, 60); // All hours from 0 to 23
  //console.log(allAvailableHours);
  // Filter out hours that fall within the available time range (exclusive of availableEnd)
  const unavailableHours = allAvailableHours.filter((hour) => {
    return hour < availableStart || hour >= availableEnd; // Filter out available hours
  });

  return unavailableHours;
}

app.get(
  "/api/availability/add-availability/:rawDate",
  authenticateJWT,
  async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    const { rawDate } = req.params;
    console.log("RawDate", rawDate);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const date = new Date(rawDate);
      const dayNumber = date.getDay();

      const weekdays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const dayName = weekdays[dayNumber];

      //console.log(dayNumber); // 2
      //console.log(dayName);   // "Tuesday"

      const availability = await redisClient.hGetAll(
        `StandardAvailability:${dayName}`
      );
      //console.log(availability);
      //console.log(typeof availability.IsDayOff);

      // Check if it's a day off and return immediately if true
      if (availability.IsDayOff.toLowerCase() === "true") {
        return res.status(200).json({ message: "DayOff" });
      }

      const startHour = parseInt(timeToMinutes(availability.OpeningTime));
      const endHour = parseInt(timeToMinutes(availability.ClosingTime));
      //console.log(startHour);

      // Generate available times
      const allAvailableTimes = getAvailableTimes(startHour, endHour, 60);
      const allUnavailableTimes = getUnavailableTimes(
        startHour,
        endHour,
        startHour,
        endHour
      );

      console.log(allAvailableTimes, "\nunavailable", allUnavailableTimes);
      console.log(getUnavailableTimes(2, 6, 0, 240));

      // Send the available times after all checks are done
      return res.status(200).json({ unavailableTimes: allUnavailableTimes });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.get(
  "/api/availability/delete-availability/:rawDate",
  authenticateJWT,
  async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    const { rawDate } = req.params;
    console.log("RawDate", rawDate);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const date = new Date(rawDate);
      const dayNumber = date.getDay();

      const weekdays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const dayName = weekdays[dayNumber];

      console.log(dayNumber); // 2
      console.log(dayName); // "Tuesday"

      const availability = await redisClient.hGetAll(
        `StandardAvailability:${dayName}`
      );
      console.log(availability);
      console.log(typeof availability.IsDayOff);

      // Check if it's a day off and return immediately if true
      if (availability.IsDayOff.toLowerCase() === "true") {
        return res.status(200).json({ message: "DayOff" });
      }

      const startHour = parseInt(timeToMinutes(availability.OpeningTime));
      const endHour = parseInt(timeToMinutes(availability.ClosingTime));
      console.log(startHour);

      // Generate available times
      const allAvailableTimes = getAvailableTimes(startHour, endHour, 60);
      const allUnavailableTimes = getUnavailableTimes(
        startHour,
        endHour,
        startHour,
        endHour
      );

      console.log(
        "availabletimes ",
        allAvailableTimes,
        "un: ",
        allUnavailableTimes
      );
      console.log(getUnavailableTimes(2, 6, 0, 240));

      // Send the available times after all checks are done
      return res.status(200).json({ availableTimes: allAvailableTimes });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/api/availability/add-availability-to-the-database",
  authenticateJWT,
  async (req, res) => {
    const { date, times } = req.body;

    // Validate the request payload
    if (!date || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        error:
          "Invalid data. Please provide a valid date and an array of times.",
      });
    }

    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      console.log(`Selected Date: ${date}`);
      console.log(`Selected Times: ${times}`);

      redisClient.sAdd("CustomDatesAdded", date);

      await Promise.all(
        times.map((time) =>
          redisClient.zAdd(`AddedTimes:${date}`, [
            {
              score: time,
              value: time,
            },
          ])
        )
      );

      res.status(200).json({ message: "Availability saved successfully" });
    } catch (err) {
      console.error("Error while saving availability:", err.message);
      res.status(500).json({
        error:
          "An error occurred while saving availability. Please try again later.",
      });
    }
  }
);

app.delete(
  "/api/availability/delete-availability-to-the-database",
  authenticateJWT,
  async (req, res) => {
    const { date, times } = req.body;

    // Validate the request payload
    if (!date || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        error:
          "Invalid data. Please provide a valid date and an array of times.",
      });
    }

    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      console.log(`Selected Date: ${date}`);
      console.log(`Selected Times: ${times}`);

      redisClient.sAdd("CustomDatesDeleted", date);
      await Promise.all(
        times.map((time) =>
          redisClient.zAdd(`DeletedTimes:${date}`, [
            {
              score: time,
              value: time,
            },
          ])
        )
      );
      res.status(200).json({ message: "Availability saved successfully" });
    } catch (err) {
      console.error("Error while saving availability:", err.message);
      res.status(500).json({
        error:
          "An error occurred while saving availability. Please try again later.",
      });
    }
  }
);

//Booking

app.get(
  "/api/availability/show-available-times/:rawDate",
  authenticateJWT,
  async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    const { rawDate } = req.params;
    console.log("RawDate", rawDate);
    const currentTime = req.query.current_time;

    if (currentTime) {
      const [day, UTC, exactTime] = currentTime
        .replace("[", "")
        .replace("]", "")
        .split(", ")
        .map((item) => item.trim());

      console.log(`Day: ${day}, UTC: ${UTC}, Exact Time: ${exactTime}`);
    }
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const date = new Date(rawDate);
      const dayNumber = date.getDay();

      const weekdays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const dayName = weekdays[dayNumber];

      console.log(dayNumber); // 2
      console.log(dayName); // "Tuesday"

      const availability = await redisClient.hGetAll(
        `StandardAvailability:${dayName}`
      );
      console.log(availability);
      console.log(typeof availability.IsDayOff);

      // Check if it's a day off and return immediately if true
      if (availability.IsDayOff.toLowerCase() === "true") {
        return res.status(200).json({ message: "DayOff" });
      }

      const startHour = parseInt(timeToMinutes(availability.OpeningTime));
      const endHour = parseInt(timeToMinutes(availability.ClosingTime));
      console.log(startHour);

      // Generate available times
      const availableTimes = getAvailableTimes(startHour, endHour, 60);

      const allAvailableTimes = await checkCustomAvailability(
        rawDate,
        availableTimes,
        "both"
      );

      console.log("availabletimes ", allAvailableTimes);

      // Send the available times after all checks are done
      return res.status(200).json({ availableTimes: allAvailableTimes });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const { gmail } = require("googleapis/build/src/apis/gmail");

// Path to your credentials JSON file
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

async function createGoogleMeetEvent() {
  try {
    console.log("hellow google");

    const auth = await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    console.log("hellow google2: ", auth);
    const calendar = google.calendar({ version: "v3", auth });

    // Define the event details
    const event = {
      summary: "Google Meet Test Meeting",
      description: "A test meeting created via Google Calendar API.",
      start: {
        dateTime: new Date().toISOString(), // Current time
        timeZone: "America/New_York", // Adjust your timezone
      },
      end: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
        timeZone: "America/New_York", // Adjust your timezone
      },
      conferenceData: {
        createRequest: {
          requestId: "sample123", // Unique request ID
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees: [
        { email: "example@example.com" }, // Add attendees here
      ],
    };

    // Create the event
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1, // Required for Meet link creation
    });

    console.log("Meeting Created!");
    console.log("Join URL:", response.data.hangoutLink);
    return response.data.hangoutLink;
  } catch (error) {
    console.error("Error creating Google Meet event:", error.message);
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your email provider if not Gmail
  auth: {
    user: "deid.unideb@gmail.com", // Your email address
    pass: "ytke aiwa pzin kmwc", // Your email password or app password
  },
});

app.post(
  "/api/availability/booking/add-booking",
  authenticateJWT,
  async (req, res) => {
    try {
      // Call the createGoogleMeetEvent function
      const googleMeetEventLink = await createGoogleMeetEvent();

      // Email details
      const mailOptions = {
        from: "deid.unideb@gmail.com", // Sender email address
        to: "deid.unideb@gmail.com", // Recipient email address (assuming it's provided in the request body)
        subject: "Your Google Meet Event Details",
        text: `Here is your Google Meet event link: ${googleMeetEventLink}`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      await redisClient.hSet(`Meetings:client4`, {
        link: googleMeetEventLink,
        at: 730,
        type: "Kick Off Meeting",
      });
      // Respond with success
      res.status(200).json({
        message: "Booking created and email sent successfully.",
        eventLink: googleMeetEventLink,
      });
    } catch (error) {
      console.error("Error creating booking or sending email:", error);
      res.status(500).json({
        message: "Failed to create booking or send email.",
        error: error.message,
        error: error.stack,
      });
    }
  }
);

function utcToMinutes(gmtString) {
  const match = gmtString.match(/UTC([+-])(\d+)/);
  if (!match) return null; // Return null if the format is incorrect

  const sign = match[1] === "+" ? -1 : 1; // Positive offsets are negative in minutes
  const hours = parseInt(match[2], 10);

  return sign * hours * 60;
}

app.patch(
  "/api/changeUserProgress/:userId",
  authenticateJWT,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { progressStep } = req.body;
      console.log("here it is the progress number", progressStep);

      const userKey = `user:${userId}`;
      const userData = await redisClient.hGetAll(userKey);
      console.log(userData);

      if (!userData) {
        return res.status(404).json({ error: "User ID not found in Redis." });
      }

      if (!userData || Object.keys(userData).length === 0) {
        return res
          .status(404)
          .json({ error: `User data not found for userId: ${userIdReal}` });
      }

      await redisClient.hSet(userKey, "progress", progressStep);
      console.log(progressStep);

      res.status(200).json({
        message: `Progress for user ${userId} successfully updated to ${progressStep}.`,
      });
    } catch (error) {
      console.error("Error updating user progress:", error);
      res.status(500).json({
        message: "Failed to update user progress. Please try again later.",
        error: error.message,
      });
    }
  }
);

app.get("/api/allUsersProgress", authenticateJWT, async (req, res) => {
  try {
    const users = await redisClient.sMembers("users"); // Get all user IDs
    console.log("Users:", users);

    const allUserData = await Promise.all(
      users.map(async (user) => {
        const userData = await redisClient.hGetAll(`user:${user}`); // Get user data from Redis

        if (userData.role === "user") {
          // Check if the role is 'user'
          return {
            id: user,
            name: `${userData.firstName || ""} ${
              userData.lastName || ""
            }`.trim(),
            company: userData.username || "",
            step: parseInt(userData.step || "0", 10),
          };
        }

        return null; // Return null if the role is not 'user'
      })
    );

    // Filter out null values from the final response
    const filteredUserData = allUserData.filter((user) => user !== null);

    console.log("Filtered User Data:", filteredUserData);

    res.status(200).json({ allUserData: filteredUserData });
  } catch (error) {
    console.error("Error fetching all user progress:", error);
    res.status(500).json({
      message: "Failed to fetch user progress. Please try again later.",
      error: error.message,
    });
  }
});

app.get("/api/userData/:userId", authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = await redisClient.hGetAll(`user:${userId}`);
    console.log(userData);

    res.status(200).json({ userData: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      message: "Failed to fetch user data. Please try again later.",
      error: error.message,
    });
  }
});
