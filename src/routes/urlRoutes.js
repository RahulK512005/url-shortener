const express = require("express");
const {
  createShortUrl,
  redirectUrl,
  getUrlAnalytics,
} = require("../controllers/urlController");

const router = express.Router();

router.post("/api/shorten", createShortUrl);
router.get("/api/analytics/:code", getUrlAnalytics);
router.get("/:code", redirectUrl);

module.exports = router;
