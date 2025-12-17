const mongoose = require("mongoose");
const Event = require("../models/Event");
const RSVP = require("../models/RSVP");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImageBuffer } = require("../services/cloudinary");

const isFutureDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
};

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, dateTime, location, capacity, category } = req.body;

  if (!title || !description || !dateTime || !location || !capacity) {
    return res
      .status(400)
      .json({ success: false, message: "All required fields must be provided" });
  }

  if (!isFutureDate(dateTime)) {
    return res
      .status(400)
      .json({ success: false, message: "Event date must be in the future" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Event image is required" });
  }

  const uploadResult = await uploadImageBuffer(req.file.buffer, "events");

  const event = await Event.create({
    title,
    description,
    dateTime,
    location,
    capacity: Number(capacity),
    category: category || null,
    imageUrl: uploadResult.secure_url,
    createdBy: req.user._id
  });

  return res.status(201).json({ success: true, event });
});

const getEvents = asyncHandler(async (req, res) => {
  const { search, category, from, to } = req.query;
  const now = new Date();
  const filter = { dateTime: { $gte: now } };

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  if (category) {
    filter.category = category;
  }

  if (from || to) {
    filter.dateTime = { ...filter.dateTime };
    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) {
        filter.dateTime.$gte = fromDate;
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) {
        filter.dateTime.$lte = toDate;
      }
    }
  }

  const events = await Event.find(filter)
    .sort({ dateTime: 1 })
    .populate("createdBy", "name email");

  return res.status(200).json({ success: true, events });
});

const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const event = await Event.findById(id).populate("createdBy", "name email");
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  let isRsvped = false;
  if (req.user) {
    const existing = await RSVP.findOne({ event: event._id, user: req.user._id });
    isRsvped = Boolean(existing);
  }

  return res.status(200).json({ success: true, event, isRsvped });
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (String(event.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const { title, description, dateTime, location, capacity, category } = req.body;

  if (dateTime && !isFutureDate(dateTime)) {
    return res
      .status(400)
      .json({ success: false, message: "Event date must be in the future" });
  }

  if (req.file) {
    const uploadResult = await uploadImageBuffer(req.file.buffer, "events");
    event.imageUrl = uploadResult.secure_url;
  }

  if (title !== undefined) event.title = title;
  if (description !== undefined) event.description = description;
  if (dateTime !== undefined) event.dateTime = dateTime;
  if (location !== undefined) event.location = location;
  if (capacity !== undefined) event.capacity = Number(capacity);
  if (category !== undefined) event.category = category || null;

  await event.save();

  return res.status(200).json({ success: true, event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (String(event.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  await RSVP.deleteMany({ event: event._id });
  await event.deleteOne();

  return res.status(200).json({ success: true, message: "Event deleted" });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
