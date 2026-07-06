import Post from "../models/Post.js";

// GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name avatar role")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("getPosts error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/posts 
export const createPost = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    const post = await Post.create({
      author:      req.user.id,
      title,
      description: description || title,
    });

    await post.populate("author", "name avatar role");

    // socket — real time
    req.io.emit("post:created", post);

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("createPost error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/posts/:id — post edit 
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { title, description } = req.body;
    post.title       = title       || post.title;
    post.description = description || post.description;
    await post.save();

    await post.populate("author", "name avatar role");
    req.io.emit("post:updated", post);

    res.json({ success: true, data: post });
  } catch (error) {
    console.error("updatePost error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/posts/:id — post delete 
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await post.deleteOne();
    req.io.emit("post:deleted", { id: req.params.id });

    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("deletePost error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/posts/:id/like — like / unlike toggle 
export const likePost = async (req, res) => {
  try {
    const post   = await Post.findById(req.params.id);
    const userId = String(req.user.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const alreadyLiked = post.likes.map(String).includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => String(id) !== userId);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({
      success: true,
      liked:      !alreadyLiked,
      likeCount:  post.likes.length,
    });
  } catch (error) {
    console.error("likePost error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/posts/:id/comment — comment add 
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "comment text required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.comments.push({ user: req.user.id, text });
    await post.save();
    await post.populate("comments.user", "name avatar");

    const newComment = post.comments[post.comments.length - 1];
    req.io.emit("post:commented", { postId: req.params.id, comment: newComment });

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("addComment error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/posts/:id/comment/:commentId — comment delete 
export const deleteComment = async (req, res) => {
  try {
    const post    = await Post.findById(req.params.id);
    const comment = post?.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (String(comment.user) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    post.comments.pull({ _id: req.params.commentId });
    await post.save();

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("deleteComment error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/posts/:id/save — save / unsave toggle 
export const savePost = async (req, res) => {
  try {
    const post   = await Post.findById(req.params.id);
    const userId = String(req.user.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const alreadySaved = post.saved.map(String).includes(userId);

    if (alreadySaved) {
      post.saved = post.saved.filter((id) => String(id) !== userId);
    } else {
      post.saved.push(req.user.id);
    }

    await post.save();

    res.json({
      success: true,
      saved:      !alreadySaved,
      savedCount: post.saved.length,
    });
  } catch (error) {
    console.error("savePost error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/posts/saved — saved posts list
export const getSavedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ saved: req.user.id })
      .populate("author", "name avatar role")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("getSavedPosts error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};