const Event = require("../models/Event");
const RSVP = require("../models/RSVP");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImageBuffer } = require("../services/cloudinary");

const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const getMyEvents = asyncHandler(async (req, res) => {
  const createdEvents = await Event.find({ createdBy: req.user._id })
    .sort({ dateTime: 1 })
    .populate("createdBy", "name email");

  const rsvps = await RSVP.find({ user: req.user._id }).populate({
    path: "event",
    populate: { path: "createdBy", select: "name email" }
  });

  const attendingEvents = rsvps
    .map((rsvp) => rsvp.event)
    .filter((event) => event !== null);

  return res.status(200).json({ success: true, createdEvents, attendingEvents });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  if (!name && !password && !req.file) {
    return res.status(400).json({ success: false, message: "No updates provided" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    user.name = trimmed;
  }

  if (password) {
    const passwordValue = String(password);
    if (!isStrongPassword(passwordValue)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      });
    }
    user.password = passwordValue;
  }

  if (req.file) {
    const uploadResult = await uploadImageBuffer(req.file.buffer, "avatars");
    user.avatarUrl = uploadResult.secure_url;
  }

  await user.save();

  return res.status(200).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
  });
});

module.exports = { getMyEvents, updateProfile };
