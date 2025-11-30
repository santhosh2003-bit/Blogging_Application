import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { type BlogPost } from "../types";
import { BarChart3, Eye, MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export default function UserDashboard() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalComments: 0,
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    console.log("Token in DashboardPage:", token);
    if (!token) {
      window.location.href = "/login";
      return;
    }
    console.log("Fetching blogs with token:", token);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    console.log("Fetching blogs with token:", token);
    try {
      const response = await fetch(`${BACKEND_URL}/api/blogs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        const blogPosts: BlogPost[] = result.data.blogs.map((item: any) => ({
          id: item._id,
          title: item.title,
          slug: item.slug,
          blocks: item.blocks,
          status: item.status,
          publishedAt: item.publishedAt,
          comments: item.comments || [],
          viewCount: item.viewCount || 0,
        }));

        setBlogs(blogPosts);

        // Stats calculation
        const totalViews = blogPosts.reduce(
          (sum, blog) => sum + (blog.viewCount || 0),
          0
        );
        const totalComments = blogPosts.reduce(
          (sum, blog) => sum + blog.comments.length,
          0
        );

        setStats({
          totalBlogs: blogPosts.length,
          totalViews,
          totalComments,
        });
      } else {
        console.error("Failed to fetch blogs:", result.message);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                View your blog posts and track performance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white overflow-hidden shadow rounded-lg relative"
            onMouseEnter={() => setHoveredCard("blogs")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Blogs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalBlogs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {hoveredCard === "blogs" && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
                <h4 className="font-semibold mb-2">Your Blogs</h4>
                <div className="space-y-2">
                  {blogs.slice(0, 10).map((blog) => (
                    <div key={blog.id} className="text-sm">
                      <p className="font-medium truncate">{blog.title}</p>
                      <p className="text-gray-600">
                        Views: {blog.viewCount || 0}, Comments:{" "}
                        {blog.comments.length}
                      </p>
                    </div>
                  ))}
                  {blogs.length > 10 && (
                    <p className="text-xs text-gray-500">
                      ...and {blogs.length - 10} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className="bg-white overflow-hidden shadow rounded-lg relative"
            onMouseEnter={() => setHoveredCard("views")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Views
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalViews}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {hoveredCard === "views" && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
                <h4 className="font-semibold mb-2">Your Blogs by Views</h4>
                <div className="space-y-2">
                  {[...blogs]
                    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                    .slice(0, 10)
                    .map((blog) => (
                      <div key={blog.id} className="text-sm">
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
            className="bg-white overflow-hidden shadow rounded-lg relative"
            onMouseEnter={() => setHoveredCard("comments")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Comments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalComments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {hoveredCard === "comments" && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
                <h4 className="font-semibold mb-2">Your Blogs by Comments</h4>
                <div className="space-y-2">
                  {[...blogs]
                    .sort((a, b) => b.comments.length - a.comments.length)
                    .slice(0, 10)
                    .map((blog) => (
                      <div key={blog.id} className="text-sm">
                        <p className="font-medium truncate">{blog.title}</p>
                        <p className="text-gray-600">
                          Comments: {blog.comments.length}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Blog Posts
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              A list of all your blog posts and their performance metrics.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No blogs yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No blogs available to view.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <li key={blog.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/view/${blog.id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate"
                          >
                            {blog.title}
                          </Link>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {blog.viewCount || 0}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {blog.comments.length}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {blog.publishedAt
                                ? formatDate(blog.publishedAt)
                                : "Draft"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              blog.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {blog.status}
                          </span>
                          <Link
                            to={`/view/${blog.id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Read More
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
