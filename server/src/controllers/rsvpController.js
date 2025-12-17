const mongoose = require("mongoose");
const Event = require("../models/Event");
const RSVP = require("../models/RSVP");
const asyncHandler = require("../utils/asyncHandler");

const joinEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existing = await RSVP.findOne({ event: id, user: req.user._id }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: "Already RSVPed" });
    }

    const event = await Event.findById(id).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.rsvpCount >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Event is full" });
    }

    await RSVP.create([{ event: id, user: req.user._id }], { session });
    await Event.updateOne({ _id: id }, { $inc: { rsvpCount: 1 } }).session(session);

    await session.commitTransaction();

    return res.status(200).json({ success: true, message: "RSVP confirmed" });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Already RSVPed" });
    }
    throw error;
  } finally {
    session.endSession();
  }
});

const leaveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const deleteResult = await RSVP.deleteOne({ event: id, user: req.user._id }).session(session);
    if (deleteResult.deletedCount === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Not RSVPed" });
    }

    await Event.updateOne({ _id: id, rsvpCount: { $gt: 0 } }, { $inc: { rsvpCount: -1 } }).session(
      session
    );

    await session.commitTransaction();

    return res.status(200).json({ success: true, message: "RSVP removed" });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = { joinEvent, leaveEvent };
