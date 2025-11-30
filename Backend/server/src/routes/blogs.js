import express from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js"; // assuming you have one
import { protect, restrictTo, optionalProtect } from "../middleware/auth.js";

const router = express.Router();

/* ===============================
   📊 1️⃣ Blog Stats (Admin Only)
================================ */
router.get("/stats", protect, restrictTo("admin"), async (req, res) => {
  try {
    // Get total blogs, total views, total likes, and total comments
    const [totalBlogs, totalViews, totalLikes, totalComments] =
      await Promise.all([
        Blog.countDocuments(),
        Blog.aggregate([
          { $group: { _id: null, total: { $sum: "$viewCount" } } },
        ]),
        Blog.aggregate([{ $unwind: "$likes" }, { $count: "totalLikes" }]),
        Comment.countDocuments(), // optional if comments are in separate collection
      ]);

    res.status(200).json({
      totalBlogs,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      totalComments: totalComments || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   🕒 2️⃣ Recent Blogs (Admin Only)
================================ */
router.get("/recent", protect, restrictTo("admin"), async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .populate("comments")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      status: "success",
      data: { blogs },
    });
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   🌍 3️⃣ Public Blogs with Filters
================================ */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, author, search } = req.query;
    const query = { status: "published" };

    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { metaKeywords: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .populate("author", "name")
      .populate("comments")
      .sort("-publishedAt")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: blogs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { blogs },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   📖 4️⃣ Single Blog View
================================ */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findById(req.params.id)
      .populate("author", "name")
      .populate("comments");

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    // Note: do NOT increment view count on GET requests. The frontend
    // should explicitly call POST /:id/view to count a view. This allows
    // control over who is counted (e.g., exclude admins) and prevents
    // accidental double-counting from multiple GETs.
    res.status(200).json({
      status: "success",
      data: { blog },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   ✍️ 5️⃣ Create Blog (Admin Only)
================================ */
router.post("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    // 🧩 Defensive fix: parse blocks safely
    let blocks = req.body.blocks;

    // If blocks arrives as a string (e.g., "[{...}]")
    if (typeof blocks === "string") {
      try {
        blocks = JSON.parse(blocks);
      } catch (err) {
        return res.status(400).json({
          status: "error",
          message: "Invalid blocks format — must be valid JSON.",
        });
      }
    }

    // ✅ Create blog
    const blog = await Blog.create({
      title: req.body.title,
      blocks, // always array of objects
      status: req.body.status,
      publishedAt: req.body.publishedAt,
      author: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: { blog },
    });
  } catch (error) {
    console.error("Blog creation error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   📝 6️⃣ Update Blog (Admin Only)
================================ */
router.patch("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { blog },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   ❌ 7️⃣ Delete Blog (Admin Only)
================================ */
router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

/* ===============================
   ❤️ 8️⃣ Like / Unlike Blog
================================ */
router.post("/:id/like", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    const updatedLikes = await blog.toggleLike(req.user._id);

    res.status(200).json({
      status: "success",
      data: {
        likes: updatedLikes,
        likedBy: blog.likes,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});
// Increment blog view (accepts anonymous tokens or authenticated users)
router.post("/:id/view", optionalProtect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    // If the requester is an admin, don't count the view
    if (req.user && req.user.role === "admin") {
      return res.status(200).json({
        status: "success",
        data: { viewCount: blog.viewCount, counted: false },
      });
    }

    // Determine anonymous token from header or cookie
    const anonToken =
      req.headers["x-viewer-token"] ||
      (req.cookies && req.cookies.viewerToken) ||
      null;
    const ip =
      req.ip || (req.headers && req.headers["x-forwarded-for"]) || null;

    const visitor = {
      userId: req.user ? req.user._id : null,
      anonToken: anonToken,
      ip: ip,
    };

    const result = await blog.addView(visitor);

    res.status(200).json({
      status: "success",
      data: { viewCount: result.viewCount, counted: result.counted },
    });
  } catch (error) {
    console.error("Error updating view count:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update view count",
    });
  }
});

/* ===============================
   👀 9️⃣ Viewers List (Admin Only)
   Returns a privacy-masked list of recent viewers for the blog
================================ */
router.get("/:id/viewers", protect, restrictTo("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid blog ID" });
    }

    // Populate any referenced users in viewedBy
    const blog = await Blog.findById(req.params.id).populate(
      "viewedBy.user",
      "name email"
    );
    if (!blog) {
      return res
        .status(404)
        .json({ status: "error", message: "Blog not found" });
    }

    // Mask helpers
    const maskIp = (ip) => {
      if (!ip) return null;
      try {
        if (ip.includes(".")) {
          const parts = ip.split(".");
          if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
        }
        // Fallback for IPv6 or others
        return ip.slice(0, 6) + "...";
      } catch (e) {
        return null;
      }
    };

    const maskAnon = (t) => {
      if (!t) return null;
      if (t.length <= 8) return "***";
      return `${t.slice(0, 6)}...${t.slice(-2)}`;
    };

    const maskUser = (u) => {
      if (!u) return null;
      return {
        id: u._id ? u._id.toString().slice(-6).padStart(6, "*") : null,
        name: u.name ? `${u.name[0]}***` : null,
        email: u.email ? u.email.replace(/(.).+(@.+)/, "$1***$2") : null,
      };
    };

    const viewers = (blog.viewedBy || []).map((v) => {
      return {
        type: v.user ? "user" : v.anonToken ? "anon" : v.ip ? "ip" : "unknown",
        user: v.user ? maskUser(v.user) : null,
        anonToken: v.anonToken ? maskAnon(v.anonToken) : null,
        ip: v.ip ? maskIp(v.ip) : null,
        lastSeen: v.lastSeen,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        viewCount: blog.viewCount || 0,
        viewers: viewers.slice(-100).reverse(), // most recent first, cap to 100
        totalViewers: blog.viewedBy ? blog.viewedBy.length : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching viewers:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch viewers" });
  }
});
// 💬 Add a comment to a blog
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Comment content cannot be empty",
      });
    }

    // 1️⃣ Ensure blog exists
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    // 2️⃣ Create the comment
    const newComment = await Comment.create({
      content,
      author: req.user._id,
      blog: blog._id,
      parentComment: parentComment || null,
    });

    // 3️⃣ Populate author info (so frontend can use name directly)
    const populatedComment = await newComment.populate({
      path: "author",
      select: "name _id",
    });

    // 4️⃣ Send formatted response
    res.status(201).json({
      status: "success",
      data: {
        id: populatedComment._id,
        content: populatedComment.content,
        createdAt: populatedComment.createdAt,
        author: {
          id: populatedComment.author._id,
          name: populatedComment.author.name,
        },
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
