import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BlockRenderer from "../components/BlockRenderer";
import { type BlogPost, type Comment } from "../types";
import {
  ArrowLeft,
  MessageCircle,
  User,
  Tag,
  Eye,
  Calendar,
  Heart,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
const BACKEND_URL = import.meta.env.BACKEND_URL;
export default function BlogViewPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [authorBlogs, setAuthorBlogs] = useState<BlogPost[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<BlogPost[]>([]);
  const [otherBlogs, setOtherBlogs] = useState<BlogPost[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const { user, token } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

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

          // Increment view count in backend
          await fetch(`${BACKEND_URL}/api/blogs/${id}/view`, {
            method: "POST",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

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
    if (!post || !name || !comment) return;
    setCommentLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/blogs/${post.id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: comment }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setPost({
          ...post,
          comments: [...(post.comments || []), data],
        });
        setName("");
        setComment("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // ✅ Handle Like
  const handleLike = async () => {
    if (!token) return alert("Please login to like this post");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/blogs/${post?.id}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setLiked(!liked);
        setLikeCount(data.data.likes);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!post) return <div className="p-8">Blog not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-blue-600">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" />
            <span>By {post?.author?.name || "Anonymous"}</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                Published {new Date(post.publishedAt!).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount || 0} views</span>
            </div>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto p-6 bg-white my-8 rounded-lg shadow">
        {post.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            onUpdate={() => {}}
            readOnly={true}
          />
        ))}

        {/* Likes */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              liked
                ? "bg-red-100 border-red-400 text-red-600"
                : "bg-gray-100 border-gray-300 text-gray-700"
            } hover:bg-red-200`}
            disabled={!user}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
            <span>{likeCount}</span>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> Comments ({post.comments.length}
          )
        </h2>

        <div className="space-y-4 mb-6">
          {post.comments.map((c: Comment) => (
            <div key={c.id} className="border-b pb-3">
              <p className="font-medium">{c?.author?.name || "Anonymous"}</p>
              <p className="text-gray-700">{c.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded h-24"
          />
          <button
            onClick={addComment}
            disabled={commentLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {commentLoading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </section>

      {/* Related Sections */}
      {authorBlogs.length > 0 && (
        <RelatedSection
          title={`More from ${post?.author?.name}`}
          blogs={authorBlogs}
        />
      )}

      {trendingBlogs.length > 0 && (
        <RelatedSection title="Trending Posts" blogs={trendingBlogs} />
      )}

      {otherBlogs.length > 0 && (
        <RelatedSection title="Explore More Posts" blogs={otherBlogs} />
      )}
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
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mb-8">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            to={`/view/${blog.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {blog.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>{blog?.author?.name || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(blog.publishedAt!).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{blog.viewCount || 0} views</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
