import SwapRequest from "../models/SwapRequest.model.js";

// POST /api/swaprequests — send a request
export const sendSwapRequest = async (req, res) => {
  try {
    const { toUser, offerSkill, wantSkill, message, availability } = req.body;

    if (!toUser || !offerSkill || !wantSkill || !message || !availability) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // prevent sending request to yourself
    if (toUser === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
    }

    const request = await SwapRequest.create({
      fromUser: req.user.id,
      toUser,
      offerSkill,
      wantSkill,
      message,
      availability,
      status: "Pending",
    });

    await request.populate("fromUser toUser", "name avatar role");

    res.status(201).json({ success: true, message: "Swap request sent!", data: request });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/swaprequests — get all my requests (sent + received)
export const getMySwapRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }],
    })
      .populate("fromUser", "name avatar role")
      .populate("toUser", "name avatar role")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/swaprequests/:id — accept or reject
export const updateSwapRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Accepted or Rejected" });
    }

    const request = await SwapRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("fromUser toUser", "name avatar role");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: `Request ${status}`, data: request });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};