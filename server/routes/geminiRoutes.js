const express = require("express");
const { generateNewsletterContent } = require("../controllers/geminiController");
const router = express.Router();

router.post("/generate-newsletter", generateNewsletterContent);

module.exports = router;
