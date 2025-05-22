const { v4: uuidv4 } = require("uuid");
const redis = require("redis");
const nodemailer = require("nodemailer");

// Initialize Redis client
const redisClient = redis.createClient({
  url: "redis://localhost:6380",
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully");
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
})();

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deid.unideb@gmail.com", // Your email address
    pass: "ytke aiwa pzin kmwc", // Your email password or app password
  },
});

// API route to handle contact form submissions
const handleContactSubmission = async (req, res) => {
  const { fullName, email, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Generate a unique key for the hash (use date as part of the key)
    const date = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const hashKey = `contact:${date}`;

    // Generate a unique ID for this entry
    const entryId = uuidv4();

    // Store the data in Redis as a hash
    await redisClient.hSet(
      hashKey,
      entryId,
      JSON.stringify({
        fullName,
        email,
        message,
        timestamp: new Date().toISOString(),
      })
    );

    // Prepare the email content
    const mailOptions = {
      from: `${email}`, // Replace with your Gmail address
      to: `deid.unideb@gmail.com`, // Replace with the recipient's email
      subject: `New Contact Form Submission - ${fullName}`,
      text: `You have received a new contact form submission:\n\n
      Name: ${fullName}\n
      Email: ${email}\n
      Message: ${message}\n`,
    };

    // Send email using Nodemailer
    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "Contact form submitted and email sent successfully." });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

module.exports = { handleContactSubmission };
