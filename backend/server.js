require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require("express-session");
const corsMiddleware = require("./config/cors");
const { initializeRedisClient, getRedisClient } = require("./config/database");
const authenticateJWT = require("./middleware/authenticateJWT");
const { authorizeRoles } = require("./helpers/authorizationHelpers");
const blockBannedIPs = require("./utils/admin/blockBannedIPs");
const { trackRequest } = require("./utils/admin/trackRequest");
const ensureAdminAccount = require("./utils/ensureAdminAccount");

require("./passport");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const emailRoutes = require("./routes/email");
const contactRoutes = require("./routes/contact");
const kanbanRoutes = require("./routes/kanban");
const availabilityRoutes = require("./routes/availability");
const bookingRoutes = require("./routes/booking");
const fileManagementRoutes = require("./routes/fileManagement");
const progressRoutes = require("./routes/progress");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.use(express.json());
app.use(corsMiddleware);

console.log("server.js-----------------");
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

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

(async () => {
  try {
    await initializeRedisClient();
    console.log("Redis client initialized successfully.");
    ensureAdminAccount();
  } catch (err) {
    console.error("Error during server initialization:", err);
    process.exit(1);
  }
})();

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/email", emailRoutes);
app.use("/inbox", emailRoutes);
app.use("/sentmails", emailRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/kanban", kanbanRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/availability", bookingRoutes);
app.use("/api", fileManagementRoutes);
app.use("/api", progressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/user", userRoutes);

app.use(trackRequest);
app.use(blockBannedIPs);

app.get("/", (req, res) => {
  res.send(
    '<h1>Home</h1><a href="/auth/google">Login with Google</a><br><a href="/auth/facebook">Login with Facebook</a>'
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
