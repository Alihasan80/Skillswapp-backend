import Booking from "../models/Booking.js";

// ✅ GENERATE GOOGLE MEET LINK
function generateMeetLink() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand = (n) =>
    Array.from({ length: n }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
}

// POST /api/bookings — create booking
export const createBooking = async (req, res) => {
  try {
    const { teacher, skill, date, time, notes, meetLink } = req.body;

    if (!teacher || !skill || !date) {
      return res.status(400).json({
        success: false,
        message: "Teacher, skill and date required"
      });
    }

    const booking = await Booking.create({
      learner: req.user.id,
      teacher,
      skill,
      date,
      time: time || "",
      notes: notes || "",

      // ✅ IMPORTANT
      meetLink: meetLink || generateMeetLink(),
    });

    await booking.populate("teacher learner", "name avatar role");

    res.status(201).json({
      success: true,
      message: "Booking created!",
      data: booking
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings — get my bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ teacher: req.user.id }, { learner: req.user.id }],
    })
      .populate("teacher", "name avatar role")
      .populate("learner", "name avatar role")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/bookings/:id — update status
export const updateBooking = async (req, res) => {
  try {
    if (!req.body || !req.body.status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const { status } = req.body;

    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("teacher learner", "name avatar role");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      message: "Booking updated",
      data: booking
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};