require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require("express-session");
const pinoHttp = require("pino-http");
const corsMiddleware = require("./config/cors");
const { initializeRedisClient, getRedisClient } = require("./config/database");
const { initializePostgresPool } = require("./config/postgresql");
const bookingRepository = require("./repositories/bookingRepository");
const authenticateJWT = require("./middleware/authenticateJWT");
const { authorizeRoles } = require("./helpers/authorizationHelpers");
const blockBannedIPs = require("./utils/admin/blockBannedIPs");
const { trackRequest } = require("./utils/admin/trackRequest");
const ensureAdminAccount = require("./utils/ensureAdminAccount");
const { logger, logError } = require("./config/logger");

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

// Add Pino HTTP logger middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health", // Don't log health checks
    },
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return "warn";
      } else if (res.statusCode >= 500 || err) {
        return "error";
      }
      return "info";
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers.host,
          userAgent: req.headers["user-agent"],
        },
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  })
);

// Healthcheck endpoint - must be before any other middleware
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

logger.info("Server initialization starting", {
  googleClientIdPresent: !!process.env.GOOGLE_CLIENT_ID,
  googleClientSecretPresent: !!process.env.GOOGLE_CLIENT_SECRET,
});

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

(async () => {
  try {
    await initializeRedisClient();
    logger.info("Redis client initialized successfully (cache layer)");

    await initializePostgresPool();
    logger.info("PostgreSQL pool initialized successfully (primary DB)");

    // Ensure booking table exists
    await bookingRepository.createTable();
    logger.info("Booking table ensured");

    ensureAdminAccount();
    logger.info("Admin account check completed");
  } catch (err) {
    logError(err, { phase: "server_initialization" });
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
  logger.info({ port: PORT }, `Server running at http://localhost:${PORT}`);
}); 