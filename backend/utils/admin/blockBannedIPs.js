const blockedIPsKey = "banned_ips";

const blockBannedIPs = (redisClient) => {
  return async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    try {
      const isBanned = await redisClient.sIsMember(blockedIPsKey, ip);
      if (isBanned) {
        console.warn(`[BLOCKED IP] ${ip} tried to access ${req.originalUrl}`);
        return res.status(403).json({ error: "Access denied: IP is banned" });
      }
      next();
    } catch (err) {
      console.error("[IP CHECK ERROR]", err);
      next(); // Let the request pass if Redis fails
    }
  };
};

module.exports = blockBannedIPs;
