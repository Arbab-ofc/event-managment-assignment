const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("_id name email avatarUrl");
    if (user) {
      req.user = user;
    }
  } catch (error) {
    req.user = null;
  }

  return next();
};

module.exports = optionalAuth;
