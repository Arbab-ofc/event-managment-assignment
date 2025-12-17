const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");
const { joinEvent, leaveEvent } = require("../controllers/rsvpController");
const requireAuth = require("../middlewares/requireAuth");
const optionalAuth = require("../middlewares/optionalAuth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", optionalAuth, getEventById);
router.post("/", requireAuth, upload.single("image"), createEvent);
router.put("/:id", requireAuth, upload.single("image"), updateEvent);
router.delete("/:id", requireAuth, deleteEvent);
router.post("/:id/rsvp", requireAuth, joinEvent);
router.delete("/:id/rsvp", requireAuth, leaveEvent);

module.exports = router;
