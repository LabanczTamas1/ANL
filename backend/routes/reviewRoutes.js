const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const { addReview, getReviews } = require("../controllers/reviewController");

// POST /api/reviews
router.post("/", authenticateJWT, addReview);

// GET /api/reviews?score=5&random=true
router.get("/", getReviews);

module.exports = router;
