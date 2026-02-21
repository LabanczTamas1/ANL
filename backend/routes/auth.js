const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    const state = req.query.state;
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
        req.calendarState = decodedState;
      } catch (error) {
        console.error("Error decoding state:", error);
      }
    }

    const userAuth = passport.authenticate("google", {
      failureRedirect: "http://localhost:5173/login",
    });

    return userAuth(req, res, next);
  },
  async (req, res) => {
    if (req.calendarState) {
      try {
        const redisClient = getRedisClient();
        const { email, timeZone, date, time, eventTitle } = req.calendarState;

        if (!req.user) {
          return res.redirect(
            `http://localhost:5173/oauth-callback?error=oauth_failed`
          );
        }

        const userData = await redisClient.hGetAll(
          `user:${req.user.id}`
        );

        const token = jwt.sign(
          {
            id: req.user.id,
            email: req.user.email,
            role: userData.role || "user",
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        const bookingData = {
          email,
          timeZone,
          date,
          time,
          eventTitle,
          googleAccessToken: req.user.accessToken,
          googleRefreshToken: req.user.refreshToken,
        };

        await redisClient.set(
          `calendar:${req.user.id}`,
          JSON.stringify(bookingData),
          { EX: 3600 }
        );

        res.redirect(
          `http://localhost:5173/oauth-callback?token=${token}&calendar=true`
        );
      } catch (error) {
        console.error("Error in calendar OAuth flow:", error);
        res.redirect(`http://localhost:5173/oauth-callback?error=server_error`);
      }
    } else {
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.redirect(`http://localhost:5173/oauth-callback?token=${token}`);
    }
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role || "user",
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.redirect(`http://localhost:5173/oauth-callback?token=${token}`);
  }
);

router.post("/register", async (req, res) => {
  try {
    console.log("[AUTH] Processing registration request");
    const redisClient = getRedisClient();
    const { email, password, firstName, lastName, username } = req.body;

    console.log("username:", username);

    if (!email || !password || !firstName || !lastName || !username) {
      return res
        .status(400)
        .json({ error: "All fields are required" });
    }

    const userExists = await redisClient.exists(`user:email:${email}`);
    if (userExists) {
      return res.status(409).json({ error: "User already exists" });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await redisClient.hSet(`user:${userId}`, {
      id: userId,
      email,
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role: "user",
      verified: "false",
      createdAt: new Date().toISOString(),
    });

    await redisClient.set(`user:email:${email}`, userId);
    await redisClient.set(`user:username:${username}`, userId);

    const verificationCode = crypto.randomInt(100000, 999999).toString();

    await redisClient.set(`verify:email:${email}`, verificationCode, {
      EX: 15 * 60,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"MyApp" <${process.env.SMTP_USER}>`,
      to: process.env.APP_ENV === "production" ? email : "deid.unideb@gmail.com",
      subject: "Verify your email",
      text: `Your verification code is: ${verificationCode}`,
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(
      `[AUTH] User registered (verification sent): ${userId}, email: ${email}`
    );

    res.status(201).json({
      message:
        "Registration successful. Please check your email for the verification code.",
      userId,
    });
  } catch (error) {
    console.error("[AUTH] Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    console.log("[AUTH] Processing email verification request");
    const redisClient = getRedisClient();
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const storedCode = await redisClient.get(`verify:email:${email}`);

    if (!storedCode) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    if (storedCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const userId = await redisClient.get(`user:email:${email}`);
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    await redisClient.hSet(`user:${userId}`, {
      verified: "true",
      verifiedAt: new Date().toISOString(),
    });

    await redisClient.del(`verify:email:${email}`);

    console.log(
      `[AUTH] Email verified for user: ${userId}, email: ${email}`
    );

    res.status(200).json({ message: "Email successfully verified", userId });
  } catch (error) {
    console.error("[AUTH] Email verification error:", error);
    res.status(500).json({ error: "Email verification failed" });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    console.log("[AUTH] Processing resend verification request");
    const redisClient = getRedisClient();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userId = await redisClient.get(`user:email:${email}`);
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await redisClient.hGetAll(`user:${userId}`);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verified === "true") {
      return res
        .status(400)
        .json({ error: "User is already verified" });
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();

    await redisClient.set(`verify:email:${email}`, verificationCode, {
      EX: 15 * 60,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"MyApp" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Your new verification code is: ${verificationCode}`,
      html: `<p>Your new verification code is: <strong>${verificationCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(
      `[AUTH] Verification code resent for user: ${userId}, email: ${email}`
    );

    res
      .status(200)
      .json({ message: "Verification code resent. Please check your email." });
  } catch (error) {
    console.error("[AUTH] Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("[AUTH] Processing login request");
    const redisClient = getRedisClient();
    const { email, password } = req.body;
    console.log("[AUTH] Login attempt for:", email);

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    let userId;

    if (email.includes("@")) {
      userId = await redisClient.get(`user:email:${email}`);
    } else {
      userId = await redisClient.get(`user:username:${email}`);
    }

    if (!userId) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userData = await redisClient.hGetAll(`user:${userId}`);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordValid = await bcrypt.compare(password, userData.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: userId,
        email: userData.email,
        role: userData.role || "user",
        username: userData.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log(
      `[AUTH] User authenticated: ${userId}, email: ${userData.email}`
    );

    res.json({
      token,
      userId,
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        verified: userData.verified,
      },
    });
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/token-login", authenticateJWT, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

module.exports = router;
