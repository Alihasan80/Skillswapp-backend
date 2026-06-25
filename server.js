import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dns from "dns";

import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import skillRoutes from "./src/routes/skill.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import activityRoutes from "./src/routes/activity.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import swapRequestRoutes from "./src/routes/swaprequest.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import matchRoutes from "./src/routes/matchRoutes.js";

dotenv.config();

//dns fix
dns.setServers(["8.8.8.8", "1.1.1.1"]);

//connect to DB before starting server
await connectDB();

const app = express();
const server = createServer(app);

//CORS configuration
const allowedOrigins = [
  "http://localhost:5173"
];


app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//user to socket mapping
const userSocketMap = {};

//pass socket and user map to routes
app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

//socket.io connection handling
io.on("connection", (socket) => {
  // console.log("User Connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    // console.log(`User ${userId} registered`);
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("skill_added", (data) => {
    io.emit("skill_updated", data);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        console.log(` User ${userId} removed`);
        break;
      }
    }
    console.log(" User Disconnected:", socket.id);
  });
});
//routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/swaprequests", swapRequestRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/match", matchRoutes);
app.use("/uploads", express.static("uploads"));

//api test route
app.get("/", (req, res) => {
  res.send("API is running ");
});

//server start
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});