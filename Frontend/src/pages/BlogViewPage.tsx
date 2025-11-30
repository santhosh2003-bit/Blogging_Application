import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BlockRenderer from "../components/BlockRenderer";
import { type BlogPost, type Comment } from "../types";
import {
  ArrowLeft,
  Eye,
  Calendar,
  Heart,
  Share2,
  MessageCircle,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function BlogViewPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [authorBlogs, setAuthorBlogs] = useState<BlogPost[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<BlogPost[]>([]);
  const [otherBlogs, setOtherBlogs] = useState<BlogPost[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const { user, token } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ✅ Fetch blog by ID
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const response = await fetch(`${BACKEND_URL}/api/blogs/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await response.json();

        if (data.status === "success") {
          const blog = data.data.blog;
          setPost(blog);
          setLikeCount(blog.likes?.length || 0);
          setLiked(
            user ? blog.likes?.some((u: string) => u === user.id) : false
          );

          // Increment view count in backend.
          // - Authenticated non-admin users: send Authorization header
          // - Anonymous users: create/send a stable viewer token via header
          try {
            const headers: Record<string, string> = {};

            // Ensure a stable viewer token exists for all visitors (anonymous or authenticated)
            const ensureViewerToken = () => {
              try {
                const existing = localStorage.getItem("viewerToken");
                if (existing) return existing;
                const array = new Uint8Array(16);
                window.crypto.getRandomValues(array);
                const tok = Array.from(array)
                  .map((b) => b.toString(16).padStart(2, "0"))
                  .join("");
                localStorage.setItem("viewerToken", tok);
                return tok;
              } catch (e) {
                const rand =
                  Math.random().toString(36).slice(2) + Date.now().toString(36);
                localStorage.setItem("viewerToken", rand);
                return rand;
              }
            };

            const viewerToken = ensureViewerToken();
            if (viewerToken) headers["x-viewer-token"] = viewerToken;

            if (token && user && user.role !== "admin") {
              headers["Authorization"] = `Bearer ${token}`;
            }

            // Only send view update when not an admin (admins shouldn't increment)
            if (!(token && user && user.role === "admin")) {
              const resp = await fetch(`${BACKEND_URL}/api/blogs/${id}/view`, {
                method: "POST",
                headers,
              });

              try {
                const json = await resp.json();
                if (json?.status === "success" && json.data?.counted) {
                  showToast("Your view was counted", "success");
                }
              } catch (err) {
                // ignore JSON parse errors
              }
            }
          } catch (err) {
            console.warn("View count update failed:", err);
          }

          // Fetch other posts (author + trending + others)
          fetchRelatedBlogs(blog.author?._id || blog.author);
        } else {
          console.error("Blog not found");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedBlogs = async (authorId: string) => {
      try {
        // Author Blogs
        const resAuthor = await fetch(
          `${BACKEND_URL}/api/blogs?author=${authorId}&status=published`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        const authorData = await resAuthor.json();
        if (authorData.status === "success") {
          setAuthorBlogs(
            authorData.data.blogs.filter((b: any) => b._id !== id)
          );
        }

        // Trending Blogs (most viewed)
        const resTrending = await fetch(
          `${BACKEND_URL}/api/blogs?status=published&sort=-viewCount&limit=6`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        const trendingData = await resTrending.json();
        if (trendingData.status === "success") {
          setTrendingBlogs(
            trendingData.data.blogs.filter((b: any) => b._id !== id)
          );
        }

        // Other blogs (recent)
        const resOther = await fetch(
          `${BACKEND_URL}/api/blogs?status=published&sort=-publishedAt&limit=12`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        const otherData = await resOther.json();
        if (otherData.status === "success") {
          setOtherBlogs(otherData.data.blogs.filter((b: any) => b._id !== id));
        }
      } catch (error) {
        console.error("Error fetching related blogs:", error);
      }
    };

    fetchPost();
  }, [id, user]);

  // ✅ Add Comment
  const addComment = async () => {
    if (!post || !comment) return;
    setCommentLoading(true);

    // Use _id if available, fallback to id
    const blogId = post._id || post.id;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/blogs/${blogId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: comment }),
        }
      );

      const responseData = await response.json();
      if (response.ok) {
        setPost({
          ...post,
          comments: [...(post.comments || []), responseData.data],
        });
        setComment("");
        showToast("Comment posted successfully", "success");
      } else {
        showToast(responseData.message || "Failed to post comment", "error");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Something went wrong", "error");
    } finally {
      setCommentLoading(false);
    }
  };

  // ✅ Handle Like
  const handleLike = async () => {
    if (!token) {
      showToast("Please login to like this post", "error");
      return;
    }

    // Use _id if available, fallback to id
    const blogId = post?._id || post?.id;

    try {
      const response = await fetch(`${BACKEND_URL}/api/blogs/${blogId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setLiked(!liked);
        setLikeCount(data.data.likes);
      } else {
        showToast(data.message || "Failed to like post", "error");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      showToast("Something went wrong", "error");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard", "success");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-serif animate-pulse">
        Loading story...
      </div>
    );
  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-serif">
        Story not found
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white pb-32">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 animate-in slide-in-from-top-5 ${
            toast.type === "success"
              ? "bg-black text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            title="buttons"
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-40 border-b border-gray-100 transition-all duration-300">
        <div className="max-w-screen-xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-gray-500 hover:text-black transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {/* Add User Profile or other nav items here */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-gray-500 mb-8 tracking-wide uppercase">
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <span className="text-gray-300">•</span>
          )}
          <span>
            {new Date(post.publishedAt!).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-medium text-gray-900 mb-10 leading-[1.1] tracking-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl shadow-inner">
            {post?.author?.name?.charAt(0) || "A"}
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-base">
              {post?.author?.name || "Anonymous"}
            </p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Author
            </p>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto border border-gray-200 rounded-md shadow-2xl px-6 py-8 prose prose-xl prose-slate prose-p:font-serif prose-p:text-gray-800 prose-p:leading-loose prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-a:text-black prose-a:underline prose-a:decoration-gray-300 hover:prose-a:decoration-black prose-a:underline-offset-4 prose-img:rounded-2xl prose-img:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-serif">
        {post.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            onUpdate={() => {}}
            readOnly={true}
          />
        ))}
      </article>

      {/* Floating Interaction Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-6 py-3 transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
              liked
                ? "text-red-600 bg-red-50"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span className="font-medium text-sm">{likeCount}</span>
          </button>
          <div className="w-px h-6 bg-gray-200"></div>
          <button
            onClick={() =>
              document
                .getElementById("comments-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">{post.comments.length}</span>
          </button>
          <div className="w-px h-6 bg-gray-200"></div>
          <button
            title="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <section
        id="comments-section"
        className="max-w-2xl mx-auto px-6 py-20 mt-12 border-t border-gray-100"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-12 tracking-tight">
          Responses
        </h2>

        <div className="bg-gray-50 p-8 rounded-2xl mb-16 shadow-sm border border-gray-100">
          <div className="space-y-6">
            <textarea
              placeholder="Share your perspective..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-5 py-4 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all h-40 resize-y placeholder:text-gray-400 font-serif"
            />
            <div className="flex justify-end">
              <button
                onClick={addComment}
                disabled={commentLoading || !comment.trim()}
                className="px-8 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-lg hover:shadow-xl"
              >
                {commentLoading ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {post.comments.map((c: Comment) => (
            <div key={c.id} className="flex gap-5 group">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0 text-lg group-hover:bg-gray-200 transition-colors">
                {c?.author?.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">
                    {c?.author?.name || "Anonymous"}
                  </h3>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-800 font-serif leading-relaxed text-lg">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Sections */}
      <div className="bg-gray-50 py-24 mt-12">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {authorBlogs.length > 0 && (
            <RelatedSection
              title={`More from ${post?.author?.name}`}
              blogs={authorBlogs}
            />
          )}

          {trendingBlogs.length > 0 && (
            <RelatedSection title="Trending on Bloging" blogs={trendingBlogs} />
          )}

          {otherBlogs.length > 0 && (
            <RelatedSection title="Recommended for You" blogs={otherBlogs} />
          )}
        </div>
      </div>
    </div>
  );
}

function RelatedSection({
  title,
  blogs,
}: {
  title: string;
  blogs: BlogPost[];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight border-b border-gray-200 pb-4">
        {title}
      </h2>
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            to={`/view/${blog.id}`}
            className="group block h-full"
          >
            <article className="h-full flex flex-col">
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
                  <span>{blog?.author?.name || "Anonymous"}</span>
                </div>
                <h3 className="font-bold text-2xl text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 leading-tight mb-3">
                  {blog.title}
                </h3>
                <p className="text-gray-500 text-base line-clamp-3 font-serif leading-relaxed">
                  {/* Placeholder for summary */}
                  Read the full story to explore more about this topic...
                </p>
              </div>
              <div className="mt-auto flex items-center gap-5 text-xs font-medium text-gray-400 uppercase tracking-wide pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                <span>{new Date(blog.publishedAt!).toLocaleDateString()}</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{blog.viewCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span>{blog.likes?.length || 0}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
