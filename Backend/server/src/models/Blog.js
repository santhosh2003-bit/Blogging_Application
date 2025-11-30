import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A blog must have a title"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    blocks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A blog must have an author"],
    },
    tags: [String],
    publishedAt: Date,
    viewCount: {
      type: Number,
      default: 0,
    },
    // Store recent viewer records (either registered user or anonymous token)
    viewedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        anonToken: { type: String, default: null },
        ip: { type: String, default: null },
        lastSeen: { type: Date, default: Date.now },
      },
    ],
    // Daily unique counts for analytics (date ISO YYYY-MM-DD)
    dailyViews: [
      {
        date: String,
        count: { type: Number, default: 0 },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    metaDescription: String,
    metaKeywords: [String],
    seoTitle: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🧩 SEO-friendly slug generator
blogSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  this.updatedAt = new Date();
  next();
});

// 📈 Increment view count method
// Add a view from a user (only count once per user)
/**
 * Add a view for a visitor (registered user or anonymous token/IP).
 * visitor: { userId?, anonToken?, ip? }
 * Returns: { viewCount, counted: boolean }
 */
blogSchema.methods.addView = async function (visitor = {}) {
  const { userId = null, anonToken = null, ip = null } = visitor;

  // Ensure arrays exist
  if (!Array.isArray(this.viewedBy)) this.viewedBy = [];
  if (!Array.isArray(this.dailyViews)) this.dailyViews = [];

  // Determine uniqueness key: prefer userId, then anonToken, then ip
  const match = this.viewedBy.find((v) => {
    if (userId && v.user && v.user.toString() === userId.toString())
      return true;
    if (anonToken && v.anonToken && v.anonToken === anonToken) return true;
    if (!userId && !anonToken && ip && v.ip && v.ip === ip) return true;
    return false;
  });

  // If already exists, update lastSeen but do not increment
  if (match) {
    // If we matched on anonToken/ip but now have a userId, attach the user to the existing record
    if (
      userId &&
      (!match.user || match.user.toString() !== userId.toString())
    ) {
      match.user = userId;
      // Optionally clear anonToken to avoid duplicate matching in future
      // keep anonToken for audit but you may clear it: match.anonToken = null;
    }

    match.lastSeen = new Date();
    await this.save();
    return { viewCount: this.viewCount, counted: false };
  }

  // Otherwise add a new viewer record
  this.viewedBy.push({
    user: userId,
    anonToken: anonToken,
    ip: ip,
    lastSeen: new Date(),
  });
  this.viewCount = (this.viewCount || 0) + 1;

  // Update today's daily count
  const today = new Date().toISOString().slice(0, 10);
  let day = this.dailyViews.find((d) => d.date === today);
  if (!day) {
    day = { date: today, count: 0 };
    this.dailyViews.push(day);
  }
  day.count = (day.count || 0) + 1;

  // Compact viewedBy array to keep recent N entries to avoid unbounded growth
  const MAX_VIEWERS = 2000; // configurable
  if (this.viewedBy.length > MAX_VIEWERS) {
    // keep the most recent MAX_VIEWERS entries
    this.viewedBy = this.viewedBy.slice(-1000);
  }

  await this.save();
  return { viewCount: this.viewCount, counted: true };
};

// ❤️ Toggle like/unlike method
blogSchema.methods.toggleLike = async function (userId) {
  const index = this.likes.findIndex(
    (id) => id.toString() === userId.toString()
  );

  if (index > -1) {
    // Unlike if already liked
    this.likes.splice(index, 1);
  } else {
    // Like if not already liked
    this.likes.push(userId);
  }

  await this.save();
  return this.likes.length; // return updated like count
};

// 💬 Virtual populate for comments
blogSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "blog",
});
// 🗑️ Cascade delete comments when a blog is deleted
blogSchema.pre("findOneAndDelete", async function (next) {
  const blog = await this.model.findOne(this.getFilter());

  if (blog) {
    await mongoose.model("Comment").deleteMany({ blog: blog._id });
  }

  next();
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
