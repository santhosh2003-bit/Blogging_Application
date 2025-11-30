import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart,
  Users,
  ThumbsUp,
  MessageSquare,
  Loader,
  X,
} from "lucide-react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showCommentsPopup, setShowCommentsPopup] = useState(false);
  const [selectedBlogComments, setSelectedBlogComments] = useState<any>(null);
  const [showCommentDetailPopup, setShowCommentDetailPopup] = useState(false);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/blogs/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setStats(data);

        const blogsResponse = await fetch(`${BACKEND_URL}/api/blogs/recent`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const blogsData = await blogsResponse.json();
        setRecentBlogs(blogsData.data.blogs);

        // Fetch all blogs for hover popups
        const allBlogsResponse = await fetch(`${BACKEND_URL}/api/blogs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allBlogsData = await allBlogsResponse.json();
        if (allBlogsData.status === "success") {
          setAllBlogs(
            allBlogsData.data.blogs.map((blog: any) => ({
              ...blog,
              comments: blog.comments || [],
              likes: blog.likes || [],
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  const handleDeleteBlog = async (e: any, id: number) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/blogs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setRecentBlogs(recentBlogs.filter((blog: any) => blog._id !== id));
      } else {
        console.error("Failed to delete the blog.");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleCommentsClick = () => {
    setShowCommentsPopup(true);
  };

  const handleBlogCommentsClick = async (blog: any) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/blogs/${blog._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        setSelectedBlogComments({
          blog: data.data.blog,
          comments: data.data.blog.comments || [],
        });
      } else if (response.status === 429) {
        alert("Too many requests. Please wait a moment and try again.");
      } else {
        console.error("Error fetching blog comments:", data.message);
      }
    } catch (error) {
      console.error("Error fetching blog comments:", error);
      alert("An error occurred while fetching comments. Please try again.");
    }
  };

  const handleCommentClick = (comment: any) => {
    setSelectedComment(comment);
    setShowCommentDetailPopup(true);
  };

  const closeCommentsPopup = () => {
    setShowCommentsPopup(false);
    setSelectedBlogComments(null);
  };

  const closeCommentDetailPopup = () => {
    setShowCommentDetailPopup(false);
    setSelectedComment(null);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <Link
          to="editor"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Blog
        </Link>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative"
          onMouseEnter={() => setHoveredCard("blogs")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Blogs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalBlogs}
              </p>
            </div>
            <BarChart className="w-8 h-8 text-blue-600" />
          </div>
          {hoveredCard === "blogs" && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">All Blogs</h4>
              <div className="space-y-2">
                {allBlogs.slice(0, 10).map((blog: any) => (
                  <div key={blog._id} className="text-sm">
                    <p className="font-medium truncate">{blog.title}</p>
                    <p className="text-gray-600">
                      Views: {blog.viewCount || 0}, Comments:{" "}
                      {blog.comments?.length || 0}
                    </p>
                  </div>
                ))}
                {allBlogs.length > 10 && (
                  <p className="text-xs text-gray-500">
                    ...and {allBlogs.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative"
          onMouseEnter={() => setHoveredCard("views")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalViews}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
          {hoveredCard === "views" && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">Top Blogs by Views</h4>
              <div className="space-y-2">
                {[...allBlogs]
                  .sort(
                    (a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0)
                  )
                  .slice(0, 10)
                  .map((blog: any) => (
                    <div key={blog._id} className="text-sm">
                      <p className="font-medium truncate">{blog.title}</p>
                      <p className="text-gray-600">
                        Views: {blog.viewCount || 0}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative"
          onMouseEnter={() => setHoveredCard("likes")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalLikes}
              </p>
            </div>
            <ThumbsUp className="w-8 h-8 text-red-600" />
          </div>
          {hoveredCard === "likes" && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">Top Blogs by Likes</h4>
              <div className="space-y-2">
                {[...allBlogs]
                  .sort(
                    (a: any, b: any) =>
                      (b.likes?.length || 0) - (a.likes?.length || 0)
                  )
                  .slice(0, 10)
                  .map((blog: any) => (
                    <div key={blog._id} className="text-sm">
                      <p className="font-medium truncate">{blog.title}</p>
                      <p className="text-gray-600">
                        Likes: {blog.likes?.length || 0}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative"
          onMouseEnter={() => setHoveredCard("comments")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Comments
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalComments}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
          {hoveredCard === "comments" && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">Top Blogs by Comments</h4>
              <div className="space-y-2">
                {[...allBlogs]
                  .sort(
                    (a: any, b: any) =>
                      (b.comments?.length || 0) - (a.comments?.length || 0)
                  )
                  .slice(0, 10)
                  .map((blog: any) => (
                    <div
                      key={blog._id}
                      className="text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => {
                        handleBlogCommentsClick(blog);
                        setShowCommentsPopup(true);
                      }}
                    >
                      <p className="font-medium truncate">{blog.title}</p>
                      <p className="text-gray-600">
                        Comments: {blog.comments?.length || 0}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Blogs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Blogs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBlogs.map((blog: any) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {blog.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {blog.viewCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {blog.likes?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {blog.comments?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap items-center flex gap-2 text-sm">
                    <Link
                      to={`view/${blog._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      to={`editor?id=${blog._id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </Link>
                    <button
                      className="bg-red-500 border-0 rounded-md px-2 py-1 text-white"
                      onClick={(e) => handleDeleteBlog(e, blog._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comments Popup */}
      {showCommentsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Blog Comments
              </h2>
              <button
                onClick={closeCommentsPopup}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close comments popup"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {!selectedBlogComments ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Blogs with Comments
                  </h3>
                  <div className="space-y-2">
                    {[...allBlogs]
                      .filter((blog: any) => blog.comments?.length > 0)
                      .sort(
                        (a: any, b: any) =>
                          (b.comments?.length || 0) - (a.comments?.length || 0)
                      )
                      .map((blog: any) => (
                        <div
                          key={blog._id}
                          className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => handleBlogCommentsClick(blog)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {blog.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {blog.comments?.length || 0} comments
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Comments for: {selectedBlogComments.blog.title}
                    </h3>
                    <button
                      onClick={() => setSelectedBlogComments(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ← Back to Blogs
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedBlogComments?.comments.length > 0 &&
                      selectedBlogComments?.comments.map((comment: any) => (
                        <div
                          key={comment._id}
                          className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => handleCommentClick(comment)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 line-clamp-2">
                                {comment.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                By: {comment.author?.name || "Anonymous"} •{" "}
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comment Detail Popup */}
      {showCommentDetailPopup && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Comment Details
              </h2>
              <button
                onClick={closeCommentDetailPopup}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close comment detail popup"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Comment Text
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedComment.text}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Author:</span>
                    <p className="text-gray-900">
                      {selectedComment.author?.name || "Anonymous"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date:</span>
                    <p className="text-gray-900">
                      {new Date(selectedComment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
