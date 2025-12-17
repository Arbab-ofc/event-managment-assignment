const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const upload = require("../middlewares/upload");
const { getMyEvents, updateProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/me/events", requireAuth, getMyEvents);
router.put("/me", requireAuth, upload.single("avatar"), updateProfile);

module.exports = router;
