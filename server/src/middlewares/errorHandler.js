const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Resource already exists" });
  }

  return res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
