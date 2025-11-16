import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { type BlogPost } from "../types";
import { Calendar, Eye, User } from "lucide-react";

const PAGE_SIZE = 10;

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const fetchBlogs = async (pageNumber: number) => {
    setLoading(true);
    try {
      const from = (pageNumber - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("blogs")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const items: BlogPost[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        blocks: item.blocks,
        status: item.status,
        publishedAt: item.published_at,
        comments: item.comments || [],
        viewCount: item.view_count || 0,
        author: item.author || "Anonymous",
        tags: item.tags || [],
      }));

      setBlogs(items);
      setTotal(count || 0);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">All Blogs</h1>
          <p className="text-sm text-gray-600">
            Browse published posts. Most viewed posts are shown first.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {blogs.map((b) => (
              <article key={b.id} className="bg-white p-4 rounded shadow">
                <Link
                  to={`/view/${b.id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {b.title}
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  {/* <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {b.author}
                  </div> */}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {b.publishedAt
                      ? new Date(b.publishedAt).toLocaleDateString()
                      : "Draft"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {b.viewCount || 0} views
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700 line-clamp-3">
                  {/* Render a short excerpt from first paragraph block if available */}
                  {Array.isArray(b.blocks) &&
                  b.blocks.length > 0 &&
                  b.blocks[0].content
                    ? (function getText(blockContent: any) {
                        try {
                          // If blockContent is a TipTap JSON doc, extract text from first paragraph
                          const doc =
                            blockContent.type === "doc"
                              ? blockContent
                              : Array.isArray(blockContent)
                              ? { type: "doc", content: blockContent }
                              : null;
                          if (doc && doc.content && doc.content.length > 0) {
                            const node = doc.content[0];
                            if (node.type === "paragraph" && node.content) {
                              return node.content
                                .map((t: any) => t.text || "")
                                .join("");
                            }
                            if (node.type === "heading" && node.content) {
                              return node.content
                                .map((t: any) => t.text || "")
                                .join("");
                            }
                          }
                        } catch (e) {
                          return "";
                        }
                        return "";
                      })(b.blocks[0].content)
                    : ""}
                </div>
              </article>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
