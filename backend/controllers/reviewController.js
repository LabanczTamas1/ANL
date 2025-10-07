const { v4: uuidv4 } = require("uuid");
const redisClient = require("../redisClient");

// Add a review
const addReview = async (req, res) => {
  try {
    const { username, score, description } = req.body;
    const userId = req.user.id;

    if (!score || !description || !username) {
      return res.status(400).json({ error: "Username, score and description are required" });
    }

    const reviewId = uuidv4();
    const time = new Date().toISOString();
    const role = req.user.role || "user";

    const reviewData = {
      id: reviewId,
      username,
      score: String(score),
      description,
      time,
      role
    };

    await redisClient.hSet(`review:${reviewId}`, reviewData);
    await redisClient.sAdd(`reviews:score:${score}`, reviewId);

    res.status(201).json({ message: "Review added successfully", review: reviewData });
  } catch (error) {
    console.error("[REVIEWS] Add review error:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
};

// Get reviews
const getReviews = async (req, res) => {
  try {
    const { score, random } = req.query;

    if (!score) {
      return res.status(400).json({ error: "Score query parameter is required" });
    }

    const reviewIds = await redisClient.sMembers(`reviews:score:${score}`);
    if (!reviewIds || reviewIds.length === 0) {
      return res.json({ reviews: [] });
    }

    const reviews = [];
    for (const id of reviewIds) {
      const data = await redisClient.hGetAll(`review:${id}`);
      if (Object.keys(data).length > 0) {
        reviews.push(data);
      }
    }

    let result = reviews;
    if (random === "true") {
      result = reviews.sort(() => Math.random() - 0.5);
    }

    res.json({ reviews: result });
  } catch (error) {
    console.error("[REVIEWS] Fetch reviews error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

module.exports = { addReview, getReviews };
