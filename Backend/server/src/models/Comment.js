import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Comment cannot be empty"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Comment must have an author"],
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: [true, "Comment must belong to a blog"],
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically populate author and replies
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "name",
  }).populate({
    path: "parentComment",
    select: "content author",
  });
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
