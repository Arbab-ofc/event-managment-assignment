const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/token");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Name, email, and password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already in use" });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user._id);
  return res.status(200).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
  });
});

const me = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
});

module.exports = { register, login, me };
