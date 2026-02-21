const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.134:5174",
  "http://192.168.0.134:5173",
  "http://192.168.0.120:5173",
  "http://192.168.0.137:5173",
  "http://192.168.0.156:5173",
  "http://192.168.0.119:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

module.exports = cors(corsOptions);
