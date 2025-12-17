const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const { enhanceDescription } = require("../controllers/aiController");

const router = express.Router();

router.post("/enhance-description", requireAuth, enhanceDescription);

module.exports = router;
