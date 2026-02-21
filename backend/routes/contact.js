const express = require("express");
const router = express.Router();
const { handleContactSubmission } = require("../utils/mail_utils/contact");

router.post("/contact", handleContactSubmission);

module.exports = router;
