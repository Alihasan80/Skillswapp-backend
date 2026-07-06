import express from "express";
import auth    from "../middleware/auth.middleware.js";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  savePost,
  getSavedPosts,
} from "../controllers/post.controller.js";

const router = express.Router();

// ── Post CRUD 
router.get("/",           auth, getPosts);       // all posts
router.post("/",          auth, createPost);     // new post
router.put("/:id",        auth, updatePost);     // post edit
router.delete("/:id",     auth, deletePost);     // post delete

//  Post Interactions
router.put("/:id/like",   auth, likePost);       // like toggle
router.put("/:id/save",   auth, savePost);       // save toggle
router.get("/saved",      auth, getSavedPosts);  // saved posts

//  Comments
router.post("/:id/comment",                auth, addComment);     // comment add
router.delete("/:id/comment/:commentId",   auth, deleteComment);  // comment delete

export default router;