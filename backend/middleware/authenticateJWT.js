const jwt = require("jsonwebtoken");
const redisClient = require("../redisClient");

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";

const authenticateJWT = async (req, res, next) => {
  console.log(`[AUTH] Authenticating request: ${req.method} ${req.originalUrl}`);

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[AUTH] Missing or invalid Authorization header");
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[AUTH] Decoded token:", decoded);

    const exists = await redisClient.exists(`user:${decoded.id}`);
    if (!exists) {
      console.error(`[AUTH] User not found for ID: ${decoded.id}`);
      return res.status(404).json({ error: "User not found" });
    }

    const userData = await redisClient.hGetAll(`user:${decoded.id}`);
    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    req.user = {
      id: decoded.id,
      ...userData,
      role: userData.role || decoded.role || "user",
    };

    console.log(`[AUTH] User authenticated: ${req.user.id}, role: ${req.user.role}`);
    next();
  } catch (err) {
    console.error("[AUTH] JWT verification or Redis error:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateJWT;
