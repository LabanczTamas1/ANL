const { v4: uuidv4 } = require("uuid");
const redisClient = require("../redisClient"); // use your existing client

async function addReview(user, { username, score, description }) {
  const reviewId = uuidv4();
  const time = new Date().toISOString();
  const role = user.role || "user";

  const reviewData = {
    id: reviewId,
    username,
    score: String(score), // keep consistent type
    description,
    time,
    role,
  };

  await redisClient.hSet(`review:${reviewId}`, reviewData);
  await redisClient.sAdd(`reviews:score:${score}`, reviewId);

  return reviewData;
}

async function getReviewsByScore(score, randomize = false) {
  const reviewIds = await redisClient.sMembers(`reviews:score:${score}`);
  if (!reviewIds || reviewIds.length === 0) return [];

  const reviews = [];
  for (const id of reviewIds) {
    const data = await redisClient.hGetAll(`review:${id}`);
    if (Object.keys(data).length > 0) {
      reviews.push(data);
    }
  }

  if (randomize) {
    return reviews.sort(() => Math.random() - 0.5);
  }

  return reviews;
}

module.exports = { addReview, getReviewsByScore };
