const pino = require("pino");
const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file streams
const logFile = path.join(logsDir, "app.log");
const errorLogFile = path.join(logsDir, "error.log");

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== "production";

// Create the main logger
const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Add base properties to all logs
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || require("os").hostname(),
      env: process.env.NODE_ENV || "development",
    },
  },
  // Use pino-pretty in development, write to files in production
  isDevelopment
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: false,
        },
      })
    : pino.multistream([
        // Write all logs to app.log
        { stream: fs.createWriteStream(logFile, { flags: "a" }) },
        // Write error logs to error.log
        {
          level: "error",
          stream: fs.createWriteStream(errorLogFile, { flags: "a" }),
        },
        // Also output to console
        { stream: process.stdout },
      ])
);

// Create a child logger for specific contexts
const createChildLogger = (context) => {
  return logger.child({ context });
};

// Helper function to log errors with stack traces
const logError = (error, context = {}) => {
  logger.error(
    {
      ...context,
      err: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...error,
      },
    },
    error.message || "An error occurred"
  );
};

// Helper function to log HTTP requests
const logRequest = (req, duration = null) => {
  const logData = {
    method: req.method,
    url: req.url,
    userAgent: req.get("user-agent"),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || "anonymous",
  };

  if (duration !== null) {
    logData.duration = `${duration}ms`;
  }

  logger.info(logData, `${req.method} ${req.url}`);
};

// Helper function to log business events
const logBusinessEvent = (eventName, data = {}) => {
  logger.info(
    {
      eventType: "business",
      eventName,
      ...data,
    },
    `Business Event: ${eventName}`
  );
};

module.exports = {
  logger,
  createChildLogger,
  logError,
  logRequest,
  logBusinessEvent,
};
