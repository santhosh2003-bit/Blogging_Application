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
blogSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  await this.save();
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
