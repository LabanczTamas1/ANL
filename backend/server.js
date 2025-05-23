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
const blockBannedIPs = require("./utils/admin/blockBannedIPs");
const { translations } = require('./utils/emailTranslations');
const { trackRequest, getRequestStats, resetRequestStats } = require('./utils/admin/trackRequest');
require("dotenv").config();
require("./passport");
const nodemailer = require("nodemailer");
//const redisClient = require('./redisClient');
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.134:5174",
  "http://192.168.0.134:5173",
  "http://192.168.0.120:5173",
  "http://192.168.0.137:5173",
  "http://192.168.0.156:5173",
  "http://192.168.0.119:5173",
  "http://192.168.56.1:5173/",
  "http://localhost:5173/",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      console.log("Blocked by CORS:", origin);
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
  url: 'redis://default:jzA40kSsOunBOxoox33qCrXv6d4vkUp9@redis-12518.c293.eu-central-1-1.ec2.redns.redis-cloud.com:12518',
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
// Update Google callback route
// Google callback route
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";

// In your Google callback route, use this constant
app.get(
  "/auth/google/callback",
  (req, res, next) => {
    // Check if this is a calendar-specific OAuth request
    const state = req.query.state;
    if (state) {
      try {
        // This appears to be a calendar OAuth flow
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        
        // If it contains booking data, it's our calendar flow
        if (decodedState.bookingFlow && decodedState.date && decodedState.times) {
          // Store the state in req so we can access it later
          req.calendarState = decodedState;
          
          // Create a custom authenticator just for calendar permission
          const calendarAuth = passport.authenticate('google', { 
            session: false,
            failureRedirect: 'http://localhost:5173/home/booking?error=calendar_auth_failed' 
          });
          
          return calendarAuth(req, res, next);
        }
      } catch (error) {
        console.error("Error parsing state:", error);
        // If error in parsing, continue with regular auth flow
      }
    }
    
    // If we got here, it's a regular login/register flow
    const userAuth = passport.authenticate('google', {
      failureRedirect: 'http://localhost:5173/login'
    });
    
    return userAuth(req, res, next);
  },
  async (req, res) => {
    // Check which flow we're handling
    if (req.calendarState) {
      // This is the calendar booking flow
      try {
        // Get the OAuth tokens
        const tokens = req.authInfo;
        
        // Extract booking details from state
        const { date, times, email } = req.calendarState;
        
        // Use the tokens to create a Google Meet event
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'http://localhost:3000/auth/google/callback'
        );
        oauth2Client.setCredentials(tokens);
        
        // Create calendar event with the obtained credentials
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        
        // Format the time from minutes into a proper date
        const formatTimeToDate = (dateStr, minutes) => {
          const date = new Date(dateStr);
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          date.setHours(hours, mins, 0, 0);
          return date;
        };
        
        const startTime = formatTimeToDate(date, times[0]);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour meeting
        
        // Define the event details
        const event = {
          summary: "Booking Meeting",
          description: "Meeting created via the booking application.",
          start: {
            dateTime: startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
          attendees: [
            { email: email || "deid.unideb@gmail.com" },
          ],
        };
        
        // Create the event
        const response = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
          conferenceDataVersion: 1,
        });
        
        // Store meeting information
        await redisClient.hSet(`Meetings:client4`, {
          link: response.data.hangoutLink,
          at: parseInt(times[0], 10),
          type: "Kick Off Meeting",
          date: date,
        });
        
        // Send email with meeting details (using your existing email sending function)
        // ...
        
        // Redirect to the successful booking page with query parameters
        const encodedMeetingInfo = Buffer.from(JSON.stringify({
          date: date,
          time: times[0],
          link: response.data.hangoutLink,
          type: "Kick Off Meeting"
        })).toString('base64');
        
        res.redirect(`http://localhost:5173/home/successful-booking?meeting=${encodedMeetingInfo}`);
      } catch (error) {
        console.error("Error in calendar OAuth flow:", error);
        res.redirect('http://localhost:5173/home/booking?error=calendar_creation_failed');
      }
    } else {
      // This is the regular login/register flow
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Redirect to frontend with token
      res.redirect(`http://localhost:5173/oauth-callback?token=${token}`);
    }
  }
);

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

// Facebook callback route
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role || "user", // Use the user's role from DB, default to 'user'
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/oauth-callback?token=${token}`);
  }
);

const authenticateJWT = (req, res, next) => {
  console.log(
    `[AUTH] Authenticating request: ${req.method} ${req.originalUrl}`
  );

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[AUTH] Missing or invalid Authorization header");
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("[AUTH] JWT verification failed:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    console.log("[AUTH] Decoded token:", decoded);

    redisClient
      .exists(`user:${decoded.id}`)
      .then((exists) => {
        if (!exists) {
          console.error(`[AUTH] User not found for ID: ${decoded.id}`);
          return res.status(404).json({ error: "User not found" });
        }

        return redisClient.hGetAll(`user:${decoded.id}`);
      })
      .then((userData) => {
        if (!userData) {
          return res.status(404).json({ error: "User data not found" });
        }

        req.user = {
          id: decoded.id,
          ...userData,
          role: userData.role || decoded.role || "user",
        };

        console.log(
          `[AUTH] User authenticated: ${req.user.id}, role: ${req.user.role}`
        );
        next();
      })
      .catch((error) => {
        console.error("[AUTH] Error checking user:", error);
        return res.status(500).json({ error: "Authentication error" });
      });
  });
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient permissions" });
    }
    next();
  };
};

app.get("/user/me", authenticateJWT, (req, res) => {
  // No need to verify the token again since authenticateJWT already did that
  // and placed the user in req.user

  // Get user data from Redis using the id from the token
  redisClient
    .hGetAll(`user:${req.user.id}`) // Changed from decoded.userId to req.user.id
    .then((userData) => {
      if (!userData || Object.keys(userData).length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        userId: req.user.id, // Changed from decoded.userId
        username: userData.username || userData.email,
        email: userData.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        role: userData.role || req.user.role || "user", // Added role information
      });
    })
    .catch((err) => {
      console.error("Redis error:", err);
      res.status(500).json({ error: "Server error" });
    });
});

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deid.unideb@gmail.com",
    pass: "ytke aiwa pzin kmwc",
  },
});

app.post("/auth/register", async (req, res) => {
  try {
    console.log("[AUTH] Processing registration request");
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await redisClient.exists(`user:email:${email}`);
    if (userExists) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Generate a unique ID for the new user
    const userId = uuidv4();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Store user data in Redis
    await redisClient.hSet(`user:${userId}`, {
      id: userId,
      email,
      name,
      password: hashedPassword,
      role: "user",
      createdAt: new Date().toISOString()
    });
    
    // Create email reference for lookup
    await redisClient.set(`user:email:${email}`, userId);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        email,
        role: "user"
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    console.log(`[AUTH] User registered: ${userId}, email: ${email}`);
    
    // Return token to client
    res.status(201).json({ token, userId });
  } catch (error) {
    console.error("[AUTH] Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    console.log("[AUTH] Processing login request");
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Check if user exists by email
    const userId = await redisClient.get(`user:email:${email}`);
    if (!userId) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Get user data
    const userData = await redisClient.hGetAll(`user:${userId}`);
    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, userData.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        email: userData.email,
        role: userData.role || "user"
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    console.log(`[AUTH] User authenticated: ${userId}, email: ${email}`);
    
    res.json({ token, userId });
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/auth/token-login", authenticateJWT, (req, res) => {
  // This endpoint can be used to verify a token and return user data
  // Similar to how your OAuth callback provides the token to the frontend
  
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

app.use(trackRequest);

app.get('/api/stats', authenticateJWT, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const stats = await getRequestStats();
    res.json(stats);
  } catch (error) {
    console.error('Error retrieving request stats:', error);
    res.status(500).json({ error: 'Failed to retrieve request statistics' });
  }
});

app.post('/api/stats/reset', authenticateJWT, authorizeRoles('owner', 'admin'), async (req, res) => {
  try {
    const result = await resetRequestStats();
    res.json(result);
  } catch (error) {
    console.error('Error resetting request stats:', error);
    res.status(500).json({ error: 'Failed to reset request statistics' });
  }
});

// Protect the profile route with JWT authentication
app.get("/profile", authenticateJWT, (req, res) => {
  res.send(`Welcome ${req.user.username}!`);
});

app.get("/listAllUsers", authenticateJWT, async (req, res) => {
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

app.use(blockBannedIPs(redisClient));

app.post("/admin/ban-ip", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP address is required" });

  try {
    await redisClient.sAdd("banned_ips", ip);
    res.json({ message: `IP ${ip} has been banned.` });
  } catch (err) {
    console.error("Error banning IP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unban an IP
app.post("/admin/unban-ip", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP address is required" });

  try {
    await redisClient.sRem("banned_ips", ip);
    res.json({ message: `IP ${ip} has been unbanned.` });
  } catch (err) {
    console.error("Error unbanning IP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/admin/banned-ips", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const ips = await redisClient.sMembers("banned_ips");
    res.json({ banned: ips });
  } catch (err) {
    console.error("Error fetching banned IPs:", err);
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

  // Validate the role input
  if (!["admin", "user", "owner"].includes(role)) {
    return res
      .status(400)
      .json({ error: "Invalid role. Allowed roles are: admin, user, owner" });
  }

  try {
    // Step 2: Check if the user exists in Redis
    const userKey = `user:${userId}`;
    const userData = await redisClient.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 3: Update the role in Redis
    await redisClient.hSet(userKey, "role", role);
    console.log(`User role updated to ${role} for user ID: ${userId}`);

    // Step 4: Send success response
    res
      .status(200)
      .json({ 
        message: `User role updated successfully to ${role}`,
        user: {
          id: userId,
          email: userData.email,
          name: userData.name,
          role: role
        }
      });
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

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getAllUserEmails() {
  const pattern = "user:email:*";
  const emails = [];
  const userDetails = [];
   
  try {
    let cursor = 0;
    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
       
      cursor = result.cursor;
      const keys = result.keys;
       
      // Process each key to extract email
      for (const key of keys) {
        const email = key.split("user:email:")[1];
        if (email) {
          emails.push(email);
          
          // Get the username associated with this email
          // Assuming there's a mapping between email and username in the database
          const userKey = `user:email:${email}`;
          const userId = await redisClient.get(userKey);
          
          // Now get the username from the hash using the userId
          console.log(userId);
          const username = userId ? 
            await redisClient.hGet(`user:${userId}`, 'username') || '' : 
            'asd';
        
          userDetails.push({
            email,
            username
          });
        }
      }
    } while (cursor !== 0);
     
    // Return the emails with additional info about count
    return {
      count: emails.length,
      data: userDetails,
    };
  } catch (error) {
    console.error("Redis scan error:", error);
    throw new Error("Failed to retrieve emails from Redis");
  }
}

app.get(
  "/admin/emails",
  authenticateJWT,
  authorizeRoles("admin", "owner"),
  async (req, res) => {
    try {
      const emailsResult = await getAllUserEmails();
         
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        success: true,
        count: emailsResult.count,
        emails: emailsResult.data,
        // The username is now dynamic based on the database structure
        // No need for hardcoding "Jancsi"
      });
    } catch (err) {
      console.error("Failed to get emails:", err);
      res.status(500).json({
        success: false,
        error: "Server error while fetching emails",
        message: err.message,
      });
    }
  }
);

app.put("/api/mark-as-read", authenticateJWT, async (req, res) => {
  const { emailIds, username } = req.body; // Add username parameter

  if (!emailIds || !Array.isArray(emailIds)) {
    return res.status(400).json({ error: "Valid emailIds array is required" });
  }

  try {
    // Verify the JWT token to get the user info
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Use the username from request body or decoded token
    const name = username || req.body.name || decoded.name;
    const userNameCreated = `username:${name}`; // Match the same format used in inbox endpoint
    
    console.log("Looking up user with key:", userNameCreated);
    const userId = await redisClient.get(userNameCreated);
    
    if (!userId) {
      return res.status(400).json({ error: "User not found" });
    }
    
    console.log("Found user ID:", userId);
    console.log("Marking emails as read:", emailIds);

    // Mark each email as read
    for (const emailId of emailIds) {
      await redisClient.hSet(`MailDetails:${emailId}`, "isRead", "true");
    }

    res.status(200).json({ message: "Emails marked as read successfully" });
  } catch (error) {
    console.error("Error marking emails as read:", error);
    res.status(500).json({ error: "Failed to mark emails as read" });
  }
});

// Endpoint to get unread email count
app.get("/inbox/:username/unread-count", authenticateJWT, async (req, res) => {
  const { username } = req.params;
  console.log("Fetching unread count for username:", username);
  const userNameCreated = `username:${username}`;

  try {
    const userId = await redisClient.get(userNameCreated);
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("User ID:", userId);

    // Get all emails from the inbox
    const mails = await redisClient.zRange(`inbox:${userId}`, 0, -1);
    console.log("Total emails in inbox:", mails.length);
    
    // Count unread emails
    let unreadCount = 0;
    
    for (const mailId of mails) {
      const emailData = await redisClient.hGetAll(`MailDetails:${mailId}`);
      if (emailData.isRead !== "true") {
        unreadCount++;
      }
    }
    
    console.log("Unread email count:", unreadCount);
    res.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
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
      decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    // Save email data in Redis as a hash with isRead set to false by default
    await redisClient.hSet(emailDetails, {
      fromId: userId, // Store userId as 'from'
      fromName: name,
      fromEmail: fromEmail,
      subject: subject,
      recipient: recipientString, // Use the serialized string here
      body: bodyString,
      timeSended: timestamp, 
      isRead: "false" // Add this flag for tracking read status
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
    const storedData = await redisClient.hGetAll(emailDetails);
    console.log("Stored Data in Redis:", storedData);

    // Set a TTL (optional): e.g., expire the email data after 30 days
    await redisClient.expire(emailDetails, 30 * 24 * 60 * 60); // 30 days in seconds

    console.log(recipient);
    const mailOptions = {
      from: "deid.unideb@gmail.com",
      to: `${recipient}`,
      subject: `${subject}`,
      text: `Email from ANL Website:
      ${body}
      `,
    };
    console.log(mailOptions);

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email saved successfully", id: mailId }); // Use mailId here
  } catch (error) {
    console.error("Error saving email:", error);
    res.status(500).json({ error: "Failed to save email" });
  }
});

app.delete("/api/delete-emails", authenticateJWT, async (req, res) => {
  const { emailIds, username } = req.body;

  // Validate the incoming data
  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    return res.status(400).json({ error: "Email IDs array is required" });
  }

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // Get the user ID from the username
    const userName = `username:${username}`;
    const userId = await redisClient.get(userName);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const inboxKey = `inbox:${userId}`;
    
    // Process each email ID
    for (const emailId of emailIds) {
      // First, get the email details to check if it exists
      const emailDetailsKey = `MailDetails:${emailId}`;
      const emailExists = await redisClient.exists(emailDetailsKey);
      
      if (emailExists) {
        // Remove the email ID from the user's inbox sorted set
        await redisClient.zRem(inboxKey, emailId);
        
        // We could either delete the email details completely or mark it as deleted
        // For now, let's just delete it (alternatively you could add a 'deleted' field)
        await redisClient.del(emailDetailsKey);
      }
    }

    res.status(200).json({ 
      message: `Successfully deleted ${emailIds.length} email(s)`,
      deletedIds: emailIds
    });
    
  } catch (error) {
    console.error("Error deleting emails:", error);
    res.status(500).json({ error: "Failed to delete emails" });
  }
});

// Update the inbox endpoint to include the read status in the response
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
      mails.map(async (mailId) => {
        const details = await redisClient.hGetAll(`MailDetails:${mailId}`);
        return { ...details, id: mailId };
      })
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
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-fallback-secret-key"
      ); // Replace with your secret key
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
      const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";
      decoded = jwt.verify(token, JWT_SECRET); // Replace with your secret key
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

// app.put("/api/cards/:cardId", authenticateJWT, async (req, res) => {
//   try {
//     const { cardId } = req.params;
//     const { columnId } = req.body;
    
//     console.log("CardId:", cardId);
//     console.log("ColumnId:", columnId);
    
//     if (!columnId) {
//       return res.status(400).json({ error: "Column ID is required" });
//     }
    
//     const userId = req.user.userId; // From authenticateJWT middleware
    
//     const timestamp = Date.now();
    
//     const BoardKey = `SortedCards:${columnId}`;
    
//     // First, remove the card from the old column (if it exists)
//     const currentColumnId = await redisClient.hGet(
//       `CardDetails:${cardId}`,
//       "ColumnId"
//     );
    
//     if (currentColumnId) {
//       const oldBoardKey = `SortedCards:${currentColumnId}`;
//       // Remove card from old column's sorted set
//       await redisClient.zRem(oldBoardKey, cardId);
//     }
    
//     // Now, update the column for this card in Redis
//     await redisClient.hSet(`CardDetails:${cardId}`, "ColumnId", columnId);
    
//     // Add the card to the new column's sorted set
//     await redisClient.zAdd(BoardKey, [{ score: timestamp, value: cardId }]);
    
//     res.status(200).json({ message: "Card updated successfully" });
//   } catch (error) {
//     console.error("Error updating card:", error);
//     res.status(500).json({ error: "Failed to update card" });
//   }
// });

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
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-fallback-secret-key");
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
      decoded = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey"); // Replace with your secret key
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
  console.log(file);

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

    // Log the file structure to understand its format
    console.log("JSON Data structure:", Object.keys(jsonData));

    // Determine which format we're dealing with
    const isNewFormat = jsonData.kanbanTable && jsonData.boardData;
    const isOldFormat = jsonData.lists && jsonData.cards;

    if (!isNewFormat && !isOldFormat) {
      return res.status(400).json({ error: "Unrecognized JSON format!" });
    }

    // Process data based on format
    if (isNewFormat) {
      // Handle new format with kanbanTable and boardData
      await processNewFormat(jsonData);
    } else {
      // Handle old format with lists and cards
      await processOldFormat(jsonData);
    }

    res.json({
      message: "File uploaded and processed successfully!",
      format: isNewFormat ? "new" : "old",
    });
  } catch (error) {
    console.error("Error processing JSON:", error);
    res
      .status(400)
      .json({ error: "Error processing JSON file: " + error.message });
  }
});

// Function to process the new format
async function processNewFormat(jsonData) {
  const { kanbanTable, boardData, cardDetails } = jsonData;

  console.log("Processing new format data");
  console.log("KanbanTable entries:", kanbanTable.length);
  console.log("Board entries:", Object.keys(boardData).length);

  // Clear existing data if needed
  // await redisClient.del("KanbanTable");

  // Process kanbanTable (column order)
  if (kanbanTable && kanbanTable.length) {
    const entries = kanbanTable.map((item) => ({
      score: Number(item.score),
      value: String(item.value),
    }));

    if (entries.length > 0) {
      await redisClient.zAdd("KanbanTable", entries);
    }
  }

  // Process boardData (column details)
  if (boardData) {
    for (const [boardId, data] of Object.entries(boardData)) {
      await redisClient.hSet(`Boards:${boardId}`, {
        ColumnName: data.ColumnName || "Untitled",
        tagColor: data.tagColor || "red",
        CardNumber: data.CardNumber || "0",
      });
    }
  }

  // Process card details if included
  if (cardDetails) {
    for (const [cardId, data] of Object.entries(cardDetails)) {
      // Store card details
      await redisClient.hSet(`CardDetails:${cardId}`, {
        ColumnId: data.ColumnId || "",
        ContactName: data.ContactName || "Unknown",
        BusinessName: data.BusinessName || "Unknown",
        DateOfAdded: data.DateOfAdded || String(Date.now()),
        FirstContact: data.FirstContact || "none",
        PhoneNumber: data.PhoneNumber || "N/A",
        Email: data.Email || "N/A",
        Website: data.Website || "N/A",
        Instagram: data.Instagram || "N/A",
        Facebook: data.Facebook || "N/A",
        IsCommented: data.IsCommented || "false",
      });

      // Add card to the appropriate sorted set
      if (data.ColumnId) {
        const score = Number(data.DateOfAdded) || Date.now();
        await redisClient.zAdd(`SortedCards:${data.ColumnId}`, [
          {
            score,
            value: String(cardId),
          },
        ]);
      }
    }
  }
}

// Function to process the old format (your existing code)
async function processOldFormat(jsonData) {
  const lists = jsonData.lists || [];
  const cards = jsonData.cards || [];

  console.log("Processing old format data");
  console.log("Lists found:", lists.length);

  // Process lists
  for (const list of lists) {
    // Make sure list.pos and list.id are valid
    if (!list.id || list.pos === undefined) {
      console.warn("Skipping list with invalid id or position:", list);
      continue;
    }

    // Convert pos to number if it's not already
    const posScore = Number(list.pos);
    if (isNaN(posScore)) {
      console.warn(`Invalid position value for list ${list.id}: ${list.pos}`);
      continue;
    }

    // Add to sorted set with proper format
    try {
      await redisClient.zAdd("KanbanTable", [
        {
          score: posScore,
          value: String(list.id),
        },
      ]);

      await redisClient.hSet(`Boards:${list.id}`, {
        ColumnName: list.name || "Untitled",
        tagColor: "red",
        CardNumber: "0", // Store as string to avoid type issues
      });
    } catch (redisError) {
      console.error(`Redis error processing list ${list.id}:`, redisError);
    }
  }

  // Process cards if they exist
  if (cards.length > 0) {
    console.log("Cards found:", cards.length);

    for (const card of cards) {
      // Skip if required fields are missing
      if (!card.id || !card.idList || !card.desc) {
        console.warn("Skipping card with missing required fields:", card.id);
        continue;
      }

      try {
        const lines = card.desc.split("\n");

        // Extract text after the colon and store in an array
        const result = lines.map((line) => {
          const parts = line.split(":"); // Split by colon
          return parts.length > 1 ? parts.slice(1).join(":").trim() : ""; // Get text after colon
        });

        if (result[2]) {
          const timestamp = Date.now();
          const BoardKey = `SortedCards:${card.idList}`;

          // Add card to sorted set with proper format
          await redisClient.zAdd(BoardKey, [
            {
              score: timestamp,
              value: String(card.id),
            },
          ]);

          // Update the cardNumber
          await redisClient.hIncrBy(`Boards:${card.idList}`, "CardNumber", 1);

          // Store card details
          await redisClient.hSet(`CardDetails:${card.id}`, {
            ColumnId: String(card.idList),
            ContactName: result[0] || "Unknown",
            BusinessName: result[2] || "Unknown",
            DateOfAdded: String(timestamp),
            FirstContact: "none",
            PhoneNumber: result[3] || "N/A",
            Email: result[5] || "N/A",
            Website: result[14] || "N/A",
            Instagram: result[16] || "N/A",
            Facebook: result[18] || "N/A",
            IsCommented: "false",
          });
        }
      } catch (cardError) {
        console.error(`Error processing card ${card.id}:`, cardError);
      }
    }
  } else {
    console.log("No cards found in the uploaded JSON.");
  }
}

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

function extractUTCOffset(utcString) {
  const match = utcString.match(/[-+]?\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function getCountedTimesFromUTC(array, UTCOffset) {
  const newArray = array
    .map((num) => num + UTCOffset * 60 - 1440)
    .filter((num) => num >= 0 && num <= 1440);
  console.log("functions new Array: ", newArray);
  return newArray;
}

async function checkCustomAvailability(
  date,
  standardAvailabilityArr,
  openClosedFlag
) {
  console.log("Checking custom availability on this day", date);
  console.log(openClosedFlag);
  console.log(standardAvailabilityArr);

  let allAvailableTimes = [];

  if (openClosedFlag === "both") {
    let addedTimes = await redisClient.zRange(`AddedTimes:${date}`, 0, -1);
    addedTimes = addedTimes.map((item) => Number(item));
    console.log(`Added times: ${date}`, addedTimes);

    let deletedTimes = await redisClient.zRange(`DeletedTimes:${date}`, 0, -1);
    deletedTimes = deletedTimes.map((item) => Number(item));

    console.log("Added Times: ", addedTimes);

    let allSet = new Set([...standardAvailabilityArr, ...addedTimes]);
    console.log("as", allSet);
    allAvailableTimes = [...allSet].filter(
      (item) => !deletedTimes.includes(item)
    );

    console.log("Merged Array: ", allAvailableTimes);
  }

  return allAvailableTimes;
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

function getAvailableTimes(start, end, increment, offset) {
  const result = [];
  for (let i = start; i < end; i += increment) {
    result.push(i + offset);
  }
  return result;
}

function getUnavailableTimes(availableStart, availableEnd) {
  // Create a list of all available hours (0 to 23)
  const allAvailableHours = getAvailableTimes(0, 1440, 60, 0); // All hours from 0 to 23
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
      console.log(startHour);
      console.log(endHour);

      // Generate available times
      const allAvailableTimes = getAvailableTimes(startHour, endHour, 60, 0);
      console.log(allAvailableTimes);
      const allUnavailableTimes = getUnavailableTimes(startHour, endHour);
      console.log("From here:");

      console.log(allAvailableTimes, "\nunavailable", allUnavailableTimes);

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
    console.log("-------------Availability-------------------");
    const token = req.headers["authorization"]?.split(" ")[1];
    const { rawDate } = req.params;
    console.log("RawDate", rawDate);
    const currentTime = req.query.current_time;
    let day, UTC, exactTime;

    if (currentTime) {
      [day, UTC, exactTime] = currentTime
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
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = weekdays[dayNumber];

      console.log(dayName, dayNumber); // Example: Tuesday 2

      function getSurroundingDays(dayIndex) {
        const yesterday = (dayIndex - 1 + 7) % 7;
        const tomorrow = (dayIndex + 1) % 7;

        return [weekdays[yesterday], weekdays[dayIndex], weekdays[tomorrow]];
      }

      console.log(getSurroundingDays(dayNumber));

      const availabilityYesterday = await redisClient.hGetAll(
        `StandardAvailability:${getSurroundingDays(dayNumber)[0]}`
      );
      const availabilityToday = await redisClient.hGetAll(
        `StandardAvailability:${getSurroundingDays(dayNumber)[1]}`
      );
      const availabilityTomorrow = await redisClient.hGetAll(
        `StandardAvailability:${getSurroundingDays(dayNumber)[2]}`
      );
      console.log(availabilityYesterday);
      console.log(availabilityToday);
      console.log(availabilityTomorrow);

      const isDayOff = (availability) =>
        availability?.IsDayOff?.toLowerCase() === "true";

      // Check each day individually and set appropriate arrays
      const availableTimesYesterday = isDayOff(availabilityYesterday)
        ? []
        : getAvailableTimes(
            parseInt(timeToMinutes(availabilityYesterday.OpeningTime)),
            parseInt(timeToMinutes(availabilityYesterday.ClosingTime)),
            60,
            0
          );

      const availableTimesToday = isDayOff(availabilityToday)
        ? []
        : getAvailableTimes(
            parseInt(timeToMinutes(availabilityToday.OpeningTime)),
            parseInt(timeToMinutes(availabilityToday.ClosingTime)),
            60,
            1440
          );

      const availableTimesTomorrow = isDayOff(availabilityTomorrow)
        ? []
        : getAvailableTimes(
            parseInt(timeToMinutes(availabilityTomorrow.OpeningTime)),
            parseInt(timeToMinutes(availabilityTomorrow.ClosingTime)),
            60,
            2880
          );

      console.log("availableTimesYesterday:", availableTimesYesterday);
      console.log("availableTimesToday:", availableTimesToday);
      console.log("availableTimesTomorrow:", availableTimesTomorrow);

      const allAvailableTimesYesterday = await checkCustomAvailability(
        rawDate,
        availableTimesYesterday,
        "both"
      );
      const allAvailableTimesToday = await checkCustomAvailability(
        rawDate,
        availableTimesToday,
        "both"
      );
      const allAvailableTimesTomorrow = await checkCustomAvailability(
        rawDate,
        availableTimesTomorrow,
        "both"
      );

      console.log("availabletimes ", allAvailableTimesToday);

      console.log(
        allAvailableTimesYesterday,
        allAvailableTimesToday,
        allAvailableTimesTomorrow
      );
      const mergedAllAvailableTimes = [
        ...allAvailableTimesYesterday,
        ...allAvailableTimesToday,
        allAvailableTimesTomorrow,
      ].flat();
      console.log("AllTimes Merged: ", mergedAllAvailableTimes);
      console.log(extractUTCOffset(UTC));
      const allAvailableTimes = getCountedTimesFromUTC(
        mergedAllAvailableTimes,
        extractUTCOffset(UTC)
      );

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

async function createGoogleMeetEvent(date, time, email, customAuth = null, timezone = "America/New_York") {
  try {
    console.log("Creating Google Meet event...");
    console.log("Using timezone:", timezone);

    // Helpers
    function parseValidTime(timeInput) {
      const raw = Array.isArray(timeInput) ? timeInput[0] : timeInput;
      const minutes = parseInt(raw, 10);
      if (isNaN(minutes)) throw new Error("Invalid time format provided");

      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    const parsedDate = Array.isArray(date) ? date[0] : date;
    const parsedTime = parseValidTime(time);
    const startDateTimeStr = `${parsedDate}T${parsedTime}:00`;
    const startDateTime = new Date(startDateTimeStr);

    if (isNaN(startDateTime.getTime())) {
      throw new Error("Invalid date or time value.");
    }

    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour

    // Use provided auth or authenticate
    const auth = customAuth || await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: "Google Meet - Ads and Leads",
      description: "A kick off meeting with Ads and Leads created via Google Calendar API.",
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees: [
        { email: Array.isArray(email) ? email[0] : email },
      ],
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    console.log("Meeting Created!");
    console.log("Join URL:", response.data.hangoutLink);
    return response.data.hangoutLink;

  } catch (error) {
    console.error("Error creating Google Meet event:", error.message);
    throw error; // optionally bubble up to catch at controller-level
  }
}




function convertMinutesToTime(minutes) {
  const totalMinutes = parseInt(minutes, 10);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMin = mins.toString().padStart(2, "0");

  return `${displayHour}:${displayMin} ${ampm}`;
}

// 1. Enhanced booking endpoint that stores meeting history
// Enhanced booking endpoint with timezone support
app.post(
  "/api/availability/booking/add-booking",
  authenticateJWT,
  async (req, res) => {
    try {
      const { date, times, email, timezone, language } = req.body;
      console.log(date, times, email, timezone, language);
      
      // Get user ID from JWT token
      const userId = req.user.id; // Assuming JWT middleware adds user info to req.user
      
      // Use provided timezone or default to America/New_York
      const userTimezone = timezone || "Europe/Bucharest";
      
      // Check if we already have calendar access by trying to create an event
      let googleMeetEventLink;
      let needsGoogleAuth = false;
      
      try {
        // Try to create the event directly with timezone
        googleMeetEventLink = await createGoogleMeetEvent(date, times, email, null, userTimezone);
      } catch (authError) {
        console.error("Calendar auth error:", authError);
        // If this fails due to auth, we'll need to get calendar permission
        needsGoogleAuth = true;
      }
      
      // If we need Google Calendar authorization
      if (needsGoogleAuth) {
        // Set up OAuth client
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'http://localhost:3000/auth/google/callback'
        );
        
        // Create state with booking information including timezone
        const stateData = {
          bookingFlow: true, // Flag to identify this as a calendar flow
          date: date,
          times: times,
          email: email || "deid.unideb@gmail.com",
          userId: userId, // Add userId to state data so we can associate meeting with user after auth
          timezone: userTimezone // Include timezone in state data
        };
        
        // Generate authorization URL
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
          state: Buffer.from(JSON.stringify(stateData)).toString('base64'),
        });
        
        // Respond with auth URL that frontend will use to redirect
        return res.status(401).json({
          error: 'Google Calendar authorization required',
          authUrl: authUrl,
        });
      }
      
      // If we got here, we already have calendar access and created an event
      
      // Format time for email
      const formattedTime = convertMinutesToTime(times[0]);
      
      // Email details with timezone information
      const translationKey = translations[language.toLowerCase()] ? language.toLowerCase() : "english";
  const translation = translations[translationKey];
  
  const mailOptions = {
    from: "deid.unideb@gmail.com",
    to: email || "deid.unideb@gmail.com",
    subject: translation.subject,
    text: `
    ${translation.linkIntro} ${googleMeetEventLink}
    
    🗓️ ${translation.date} ${date}
    ⏰ ${translation.time} ${formattedTime}
    🌐 ${translation.timezone} ${userTimezone}
    
    ${translation.instructions}
    `
  };
      
      // Send the email
      await transporter.sendMail(mailOptions);
      
      // Store meeting information in Redis
      await redisClient.hSet(`Meetings:client4`, {
        link: googleMeetEventLink,
        at: parseInt(times[0], 10),
        type: "Kick Off Meeting",
        date: date,
        timezone: userTimezone
      });
      
      // Store meeting in meeting history database with user association
      const meetingData = {
        userId: userId,
        clientEmail: email || "deid.unideb@gmail.com",
        meetingLink: googleMeetEventLink,
        startTime: parseInt(times[0], 10),
        meetingType: "Kick Off Meeting",
        date: date,
        timezone: userTimezone,
        formattedTime: formattedTime,
        createdAt: new Date().toISOString()
      };
      
      // Store meeting in a meetings collection in Redis
      // Using a unique meeting ID
      const meetingId = `meeting:${Date.now()}:${userId}`;
      await redisClient.hSet(`Meetings:${meetingId}`, meetingData);
      
      // Add this meeting ID to the user's meeting list
      await redisClient.sAdd(`UserMeetings:${userId}`, meetingId);
      
      // Respond with success and meeting ID
      res.status(200).json({
        message: "Availability saved successfully",
        eventLink: googleMeetEventLink,
        meetingId: meetingId
      });
    } catch (error) {
      console.error("Error creating booking or sending email:", error);
      res.status(500).json({
        message: "Failed to create booking or send email.",
        error: error.message,
      });
    }
  }
);

app.get(
  "/api/meeting",
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.id; // Get user ID from JWT token
      
      // Validate user authentication
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized access. Invalid authentication token."
        });
      }
      
      // Get list of meeting IDs associated with this user
      let meetingIds;
      try {
        meetingIds = await redisClient.sMembers(`UserMeetings:${userId}`);
      } catch (redisError) {
        console.error("Redis error fetching user meeting IDs:", redisError);
        return res.status(500).json({
          message: "Database error while fetching user meetings",
          error: redisError.message
        });
      }
      
      // Return empty array if no meetings found
      if (!meetingIds || meetingIds.length === 0) {
        return res.status(200).json({
          meetings: []
        });
      }
      
      // Fetch meeting details for each meeting ID
      const meetings = [];
      for (const meetingId of meetingIds) {
        try {
          const meetingData = await redisClient.hGetAll(`Meetings:${meetingId}`);
          
          if (meetingData && Object.keys(meetingData).length > 0) {
            // Convert start time back to readable format if needed
            if (meetingData.startTime || meetingData.at) {
              const startMinutes = parseInt(meetingData.startTime || meetingData.at, 10);
              meetingData.formattedTime = convertMinutesToTime(startMinutes);
            }
            
            meetings.push({
              id: meetingId,
              ...meetingData
            });
          }
        } catch (meetingError) {
          console.error(`Error fetching meeting ${meetingId}:`, meetingError);
          // Continue with other meetings instead of failing the entire request
        }
      }
      
      // Sort meetings by date and time
      meetings.sort((a, b) => {
        // Handle invalid dates gracefully
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        // First compare by date
        const dateComparison = dateA - dateB;
        if (dateComparison !== 0) return dateComparison;
        
        // If same date, compare by time (handle missing time values)
        const timeA = parseInt(a.startTime || a.at || 0, 10);
        const timeB = parseInt(b.startTime || b.at || 0, 10);
        return timeA - timeB;
      });
      
      // Return the sorted meetings
      res.status(200).json({
        meetings: meetings
      });
    } catch (error) {
      console.error("Error fetching user meetings:", error);
      res.status(500).json({
        message: "Failed to fetch user meetings",
        error: error.message
      });
    }
  }
);
// 3. Endpoint to get meeting details by ID
app.get(
  "/api/meetings/:meetingId",
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { meetingId } = req.params;
      
      // Verify this meeting belongs to the user
      const isMemberResult = await redisClient.sIsMember(`UserMeetings:${userId}`, meetingId);
      
      if (!isMemberResult) {
        return res.status(403).json({
          message: "Unauthorized to access this meeting"
        });
      }
      
      // Get meeting details
      const meetingData = await redisClient.hGetAll(`Meetings:${meetingId}`);
      
      if (!meetingData || Object.keys(meetingData).length === 0) {
        return res.status(404).json({
          message: "Meeting not found"
        });
      }
      
      // Convert start time to readable format
      if (meetingData.startTime || meetingData.at) {
        const startMinutes = parseInt(meetingData.startTime || meetingData.at, 10);
        meetingData.formattedTime = convertMinutesToTime(startMinutes);
      }
      
      res.status(200).json({
        meeting: {
          id: meetingId,
          ...meetingData
        }
      });
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      res.status(500).json({
        message: "Failed to fetch meeting details",
        error: error.message
      });
    }
  }
);

// 4. Endpoint to delete a meeting
app.delete(
  "/api/meetings/:meetingId",
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { meetingId } = req.params;
      
      // Verify this meeting belongs to the user
      const isMemberResult = await redisClient.sIsMember(`UserMeetings:${userId}`, meetingId);
      
      if (!isMemberResult) {
        return res.status(403).json({
          message: "Unauthorized to delete this meeting"
        });
      }
      
      // Get meeting details before deletion (for calendar deletion if needed)
      const meetingData = await redisClient.hGetAll(`Meetings:${meetingId}`);
      
      if (!meetingData || Object.keys(meetingData).length === 0) {
        return res.status(404).json({
          message: "Meeting not found"
        });
      }
      
      // Optional: Add logic to delete from Google Calendar if needed
      // This would require extracting the Google Calendar event ID from the link or storing it separately
      
      // Delete meeting from Redis
      await redisClient.del(`Meetings:${meetingId}`);
      
      // Remove meeting ID from user's meeting list
      await redisClient.sRem(`UserMeetings:${userId}`, meetingId);
      
      res.status(200).json({
        message: "Meeting deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({
        message: "Failed to delete meeting",
        error: error.message
      });
    }
  }
);

app.get(
  "/api/meetings/latest",
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.id; // Get user ID from JWT token
      
      // Get list of meeting IDs associated with this user
      const meetingIds = await redisClient.sMembers(`UserMeetings:${userId}`);
      
      if (!meetingIds || meetingIds.length === 0) {
        return res.status(404).json({
          message: "No meetings found for this user"
        });
      }
      
      // Create an array to store meetings with their data
      const meetings = [];
      
      // Fetch meeting details for each meeting ID
      for (const meetingId of meetingIds) {
        const meetingData = await redisClient.hGetAll(`Meetings:${meetingId}`);
        
        if (meetingData && Object.keys(meetingData).length > 0) {
          // Parse date and time for sorting
          const meetingDate = new Date(meetingData.date);
          const meetingTime = parseInt(meetingData.startTime || meetingData.at, 10);
          
          // Add formatted time
          const startMinutes = parseInt(meetingData.startTime || meetingData.at, 10);
          const hours = Math.floor(startMinutes / 60);
          const mins = startMinutes % 60;
          const formattedTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          
          meetings.push({
            id: meetingId,
            date: meetingDate,
            time: meetingTime,
            formattedTime: formattedTime,
            ...meetingData
          });
        }
      }
      
      // Sort meetings by date (newest first) and time
      meetings.sort((a, b) => {
        // First compare by date (newest first)
        const dateComparison = b.date - a.date;
        if (dateComparison !== 0) return dateComparison;
        
        // If same date, compare by time (latest first)
        return b.time - a.time;
      });
      
      // Get the latest meeting
      const latestMeeting = meetings[0];
      
      if (!latestMeeting) {
        return res.status(404).json({
          message: "No meetings found for this user"
        });
      }
      
      // Remove the temporary date and time props used for sorting
      delete latestMeeting.date;
      delete latestMeeting.time;
      
      res.status(200).json({
        meeting: latestMeeting
      });
    } catch (error) {
      console.error("Error fetching latest meeting:", error);
      res.status(500).json({
        message: "Failed to fetch latest meeting",
        error: error.message
      });
    }
  }
);

// Legacy endpoint for backward compatibility
app.get(
  "/api/availability/booking/latest",
  authenticateJWT,
  async (req, res) => {
    try {
      // First try to get data from Meetings:client4 (original storage location)
      const meetingData = await redisClient.hGetAll("Meetings:client4");
      
      if (meetingData && Object.keys(meetingData).length > 0) {
        return res.status(200).json(meetingData);
      }
      
      // If no data in original location, try to get the user's latest meeting
      const userId = req.user.id;
      const meetingIds = await redisClient.sMembers(`UserMeetings:${userId}`);
      
      if (!meetingIds || meetingIds.length === 0) {
        return res.status(404).json({
          message: "No meetings found"
        });
      }
      
      // Since we need to find the latest meeting, we'll fetch all and sort
      const meetings = [];
      
      for (const meetingId of meetingIds) {
        const meeting = await redisClient.hGetAll(`Meetings:${meetingId}`);
        if (meeting && Object.keys(meeting).length > 0) {
          meetings.push({
            id: meetingId,
            date: new Date(meeting.date),
            ...meeting
          });
        }
      }
      
      // Sort by date (newest first)
      meetings.sort((a, b) => b.date - a.date);
      
      // Get latest meeting
      const latestMeeting = meetings[0];
      
      if (!latestMeeting) {
        return res.status(404).json({
          message: "No meetings found"
        });
      }
      
      // Format meeting data to match legacy format
      const legacyFormatMeeting = {
        date: latestMeeting.date,
        at: latestMeeting.startTime || latestMeeting.at,
        link: latestMeeting.meetingLink || latestMeeting.link,
        type: latestMeeting.meetingType || latestMeeting.type || "Kick Off Meeting"
      };
      
      res.status(200).json(legacyFormatMeeting);
    } catch (error) {
      console.error("Error fetching latest meeting:", error);
      res.status(500).json({
        message: "Failed to fetch latest meeting",
        error: error.message
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
    console.log("[API] Processing all users progress request");
    
    // Get all user keys from Redis that match the pattern
    const userKeys = await redisClient.keys("user:*");
    
    // Filter out email reference keys
    const userDataKeys = userKeys.filter(key => !key.startsWith("user:email:"));
    console.log("Keeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee--------------------ys", userKeys);
    console.log("Keeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee--------------------ys", userDataKeys);
    const allUserData = await Promise.all(
      userDataKeys.map(async (userKey) => {
        // Get user data from Redis
        console.log("-->Key: ", userKey);
        const userData = await redisClient.hGetAll(userKey);
        console.log("--?Data: ", userData);
        
        // Only include users with "user" role
        if (userData.role === "user") {
          return {
            id: userData.id,
            name: userData.name || userData.firstName + " " + userData.lastName || "",
            company: userData.company || "",
            step: parseInt(userData.progress || "1", 10),
            status: userData.status || "new",
            spends: parseFloat(parseFloat(userData.spends || 0).toFixed(2)),
          };
        }
        
        return null;
      })
    );
    
    // Filter out null values
    console.log(allUserData);
    const filteredUserData = allUserData.filter(user => user !== null);
    
    console.log(`[API] Retrieved progress data for ${filteredUserData.length} users`);
    
    res.status(200).json({ allUserData: filteredUserData });
  } catch (error) {
    console.error("[API] Error fetching all user progress:", error);
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

app.patch("/api/modifyUserData", authenticateJWT, async (req, res) => {
  try {
    const user = req.body;
    console.log("User to modify:", user);
    
    // Ensure we have a user ID
    if (!user.id) {
      console.error("Error: No user ID provided");
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    // Get current user data
    const userData = await redisClient.hGetAll(`user:${user.id}`);
    
    if (!userData || Object.keys(userData).length === 0) {
      console.error(`Error: User with ID ${user.id} not found`);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    console.log("Current user data:", userData);
    
    // Create an object with fields to update - ensure we preserve existing data
    // Convert numeric fields from strings to numbers as needed for Redis storage
    const updateFields = {
      // Preserve core identification fields
      id: user.id,
      name: user.name || userData.name,
      company: user.company || userData.company,
      // Update operational fields - ensure numeric fields are stored as strings in Redis
      progress: user.progress !== undefined ? String(user.progress) : (userData.progress || '0'),
      step: user.step !== undefined ? String(user.step) : (userData.step || '0'),
      status: user.status || userData.status || "new",
      spends: user.spends !== undefined ? String(user.spends) : (userData.spends || '0')
    };
    
    console.log("Updating user with fields:", updateFields);
    
    // Update user data
    await redisClient.hSet(`user:${user.id}`, updateFields);
    
    // Handle termination status
    if (user.status === "terminated" && userData.status !== "terminated") {
      console.log("User terminated for the first time");
      const currentMonth = new Date().getMonth() + 1;
      
      // Safely get the current termination count
      let terminatedCount = 0;
      try {
        const getValue = await redisClient.hGet("ClientsTerminatedByMonth", String(currentMonth));
        terminatedCount = getValue ? Number(getValue) : 0;
      } catch (err) {
        console.error("Error getting termination count:", err);
      }
      
      // Update the termination count
      await redisClient.hSet("ClientsTerminatedByMonth", {
        [currentMonth]: terminatedCount + 1
      });
    }
    
    if (user.status === "terminated") {
      const currentMonth = new Date().getMonth() + 1;
      
      // Add user spends to the sorted set
      try {
        // Convert spends to number for score
        const spendsValue = parseFloat(updateFields.spends);
        await redisClient.zAdd(`Spends:${currentMonth}`, {
          score: spendsValue,
          value: user.id
        });
        
        // Calculate total spends
        const spendsRaw = await redisClient.zRangeWithScores(
          `Spends:${currentMonth}`,
          0,
          -1
        );
        
        const totalScore = spendsRaw.reduce(
          (sum, item) => sum + parseFloat(item.score),
          0
        );
        
        console.log(`Total spends for month ${currentMonth}:`, totalScore);
      } catch (err) {
        console.error("Error updating spends:", err);
      }
    }
    
    // Get updated user data to confirm changes
    const updatedUser = await redisClient.hGetAll(`user:${user.id}`);
    console.log("Updated user data:", updatedUser);
    
    // Convert string values back to numbers for the response
    const formattedUpdatedUser = {
      ...updatedUser,
      id: user.id,
      step: updatedUser.step ? parseInt(updatedUser.step) : 0,
      progress: updatedUser.progress ? parseInt(updatedUser.progress) : 0,
      spends: updatedUser.spends ? parseFloat(updatedUser.spends) : 0
    };
    
    // Fetch all users to return in response
    try {
      const usersSet = await redisClient.sMembers("users");
      const allUserData = await Promise.all(
        usersSet.map(async (userId) => {
          const userData = await redisClient.hGetAll(`user:${userId}`);
          // Convert string values to numbers and ensure ID is included
          return { 
            ...userData, 
            id: userId,
            step: userData.step ? parseInt(userData.step) : 0,
            progress: userData.progress ? parseInt(userData.progress) : 0,
            spends: userData.spends ? parseFloat(userData.spends) : 0
          };
        })
      );
      
      console.log("Returning updated user list with", allUserData.length, "users");
      
      // Send success response with updated user data
      res.status(200).json({
        success: true, 
        message: "User data updated successfully",
        allUserData: allUserData,
        updatedUser: formattedUpdatedUser // Include the properly formatted updated user
      });
    } catch (err) {
      console.error("Error retrieving all users:", err);
      
      // Still return success for the individual user update
      res.status(200).json({
        success: true,
        message: "User data updated successfully",
        updatedUser: formattedUpdatedUser
      });
    }
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user data",
      error: error.message
    });
  }
});

app.get("/api/terminatedStatistics", authenticateJWT, async (req, res) => {
  try {
    const months = [
      { name: "January", number: 1, moneyValue: 0, terminatedCount: 0 },
      { name: "February", number: 2, moneyValue: 0, terminatedCount: 0 },
      { name: "March", number: 3, moneyValue: 0, terminatedCount: 0 },
      { name: "April", number: 4, moneyValue: 0, terminatedCount: 0 },
      { name: "May", number: 5, moneyValue: 0, terminatedCount: 0 },
      { name: "June", number: 6, moneyValue: 0, terminatedCount: 0 },
      { name: "July", number: 7, moneyValue: 0, terminatedCount: 0 },
      { name: "August", number: 8, moneyValue: 0, terminatedCount: 0 },
      { name: "September", number: 9, moneyValue: 0, terminatedCount: 0 },
      { name: "October", number: 10, moneyValue: 0, terminatedCount: 0 },
      { name: "November", number: 11, moneyValue: 0, terminatedCount: 0 },
      { name: "December", number: 12, moneyValue: 0, terminatedCount: 0 },
    ];

    for (let i = 1; i <= 12; i++) {
      const spendsRaw = await redisClient.zRangeWithScores(
        `Spends:${i}`,
        0,
        -1,
        { withScores: true }
      );
      const totalScore = spendsRaw.reduce(
        (sum, item) => sum + parseFloat(item.score),
        0
      );
      const usersTerminated = await redisClient.hGet(
        `ClientsTerminatedByMonth`,
        `${i}`
      );
      console.log(usersTerminated);
      // Find the month and update its moneyValue and terminatedCount
      const month = months.find((month) => month.number === i);
      if (month) {
        month.moneyValue = totalScore;
        month.terminatedCount = usersTerminated | 0;
      }
    }

    console.log(months);

    // Send the updated months array back to the client
    res.status(200).json({ months });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      message: "Failed to fetch user data. Please try again later.",
      error: error.message,
    });
  }
});

app.post("/api/add-user", authenticateJWT, async (req, res) => {
  const { firstName, lastName, email, username, company } = req.body;

  // Log the incoming request body
  console.log("Received registration request:", req.body);

  // Validate request fields
  if (!firstName || !lastName || !email || !username) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if the username already exists in Redis
    console.log(`Checking if username "${username}" exists in Redis...`);
    const existingUser = await redisClient.hGetAll(`username:${username}`);
    console.log("Existing user:", existingUser);

    if (existingUser && Object.keys(existingUser).length > 0) {
      return res
        .status(400)
        .json({ error: `Username "${username}" already exists` });
    }

    // Generate a unique ID for the user
    const userId = uuidv4();
    console.log("Generated unique user ID:", userId);

    // Save the user in Redis
    const userKey = `user:${userId}`;
    await redisClient.sAdd("users", `${userId}`);

    const usernameKey = `username:${username}`;
    const emailKey = `email:${email}`;

    // Create a user object with all necessary fields
    const userData = {
      id: userId,               // Include ID in the user data
      firstName: firstName,
      lastName: lastName,
      email: email,
      username: username,
      name: username,           // Set name to username for UserManagement component
      role: "user",
      progress: 0,
      step: 0,                  // Add step field
      spends: 0,
      status: "new"             // Set initial status
    };

    // Add company field if provided
    if (company) {
      userData.company = company;
    }

    // Save all user data in Redis
    await redisClient.hSet(userKey, userData);

    console.log("User saved to Redis successfully");

    // Save the username-to-ID and email-to-ID mappings
    await redisClient.set(usernameKey, userId);
    await redisClient.set(emailKey, userId);

    // Retrieve the saved user from Redis to confirm
    const savedUser = await redisClient.hGetAll(userKey);
    console.log("Retrieved saved user from Redis:", savedUser);

    // Send success response with saved user data
    res
      .status(201)
      .json({ 
        message: "User registered successfully", 
        user: savedUser 
      });
  } catch (error) {
    // General error handling
    console.error("Error saving or retrieving user from Redis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/user/profile", authenticateJWT, async (req, res) => {
  try {
    // User ID is available from the JWT token via the middleware
    const userId = req.user.id;
    
    // Get user data from Redis
    const userData = await redisClient.hGetAll(`user:${userId}`);
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Don't send sensitive information to the client
    const { password, ...userInfo } = userData;
    
    res.json({ 
      user: userInfo,
      isOAuth: userData.provider === "google"
    });
    
  } catch (error) {
    console.error("[USER] Profile retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// GET endpoint for retrieving user profile
app.get("/api/user/profile", authenticateJWT, async (req, res) => {
  try {
    // User ID is available from the JWT token via the middleware
    const userId = req.user.id;
    
    // Get user data from Redis
    const userData = await redisClient.hGetAll(`user:${userId}`);
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Don't send sensitive information to the client
    const { password, ...userInfo } = userData;
    
    res.json({ 
      user: userInfo,
      isOAuth: userData.provider === "google"
    });
    
  } catch (error) {
    console.error("[USER] Profile retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// PUT endpoint for updating user profile
app.put("/api/user/profile", authenticateJWT, async (req, res) => {
  try {
    // User ID is available from the JWT token via the middleware
    const userId = req.user.id;
    const { firstName, lastName, email, username, currentPassword, newPassword } = req.body;
    
    // Get current user data
    const userData = await redisClient.hGetAll(`user:${userId}`);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Prepare update data
    const updateData = {};
    
    // Handle basic profile fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // Handle username update
    if (username !== undefined && username !== userData.username) {
      // You might want to check if username is already taken
      updateData.username = username;
    }
    
    // Handle email update
    if (email !== undefined && email !== userData.email) {
      // Check if email already exists
      const emailExists = await redisClient.exists(`user:email:${email}`);
      if (emailExists) {
        return res.status(409).json({ error: "Email already in use" });
      }
      
      // Update email reference
      await redisClient.del(`user:email:${userData.email}`);
      await redisClient.set(`user:email:${email}`, userId);
      
      updateData.email = email;
    }
    
    // Handle password update
    if (newPassword) {
      // Check if user is from OAuth
      if (userData.provider === "google") {
        return res.status(400).json({ 
          error: "Password cannot be changed for accounts created with Google OAuth",
          isOAuth: true
        });
      }
      
      // Verify current password
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required" });
      }
      
      const passwordValid = await bcrypt.compare(currentPassword, userData.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      // Update password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    
    // Update user data in Redis if there are changes
    if (Object.keys(updateData).length > 0) {
      await redisClient.hSet(`user:${userId}`, updateData);
      
      // Generate new token with updated information if email changed
      if (updateData.email || updateData.role) {
        const token = jwt.sign(
          {
            id: userId,
            email: updateData.email || userData.email,
            role: userData.role
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        
        return res.json({ 
          message: "Profile updated successfully", 
          token,
          isOAuth: userData.provider === "google"
        });
      }
      
      return res.json({ 
        message: "Profile updated successfully",
        isOAuth: userData.provider === "google"
      });
    }
    
    // No changes
    return res.json({ 
      message: "No changes to update",
      isOAuth: userData.provider === "google"
    });
    
  } catch (error) {
    console.error("[USER] Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});