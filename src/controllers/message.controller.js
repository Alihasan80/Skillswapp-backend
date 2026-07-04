import Message from "../models/Message.js";

// POST /api/messages — send message
export const sendMessage = async (req, res) => {
  try {
    const { receiver, text } = req.body;

    if (!receiver || !text) {
      return res.status(400).json({
        success: false,
        message: "Receiver and text required",
      });
    }

    // Save message to DB
    const message = await Message.create({
      sender: req.user.id,
      receiver,
      text,
    });

    // Populate sender and receiver with name and avatar
    await message.populate("sender receiver", "name avatar");

    // Get socket IDs for sender and receiver
    const receiverSocketId = req.userSocketMap[String(receiver)];
    const senderSocketId   = req.userSocketMap[String(req.user.id)];

    console.log("Sending message...");
    console.log("  Sender ID:", req.user.id);
    console.log("  Receiver ID:", receiver);
    console.log("  Receiver socket:", receiverSocketId);
    console.log("  Sender socket:", senderSocketId);

    // Send to receiver only
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("receive_message", message);
      console.log("Message emitted to receiver");
    } else {
      console.log("Receiver is not online");
    }

    // Send back to sender too (so their own message appears instantly)
    if (senderSocketId) {
      req.io.to(senderSocketId).emit("receive_message", message);
      console.log("Message emitted back to sender");
    }

    res.status(201).json({ success: true, data: message });

  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages/:userId — get conversation between me and one user
export const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id },
      ],
    })
      .populate("sender receiver", "name avatar")
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });

  } catch (error) {
    console.error("getConversation error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages — get all my conversations
export const getConversations = async (req, res) => {
  try {
    console.log("req.user:", req.user);

    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ],
    })
      .populate("sender receiver", "name avatar role phoneVerified")
      .sort({ createdAt: -1 });

    console.log("messages found:", messages.length);

    const seen = new Set();
    const conversations = [];

    messages.forEach((m) => {
      if (!m.sender || !m.receiver) return;

      const other =
        String(m.sender._id) === String(req.user.id)
          ? m.receiver
          : m.sender;

      if (!other || !other._id) return;
      if (!other.phoneVerified) return;
      if (!seen.has(String(other._id))) {
        seen.add(String(other._id));
        conversations.push({
          user: other,
          lastMessage: m.text,
          lastTime: m.createdAt,
          read: m.read,
        });
      }
    });

    res.json({ success: true, data: conversations });

  } catch (error) {
    console.error("getConversations error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

