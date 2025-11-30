import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "../components/Sidebar";
import BlockList from "../components/BlockList";
import { type Block, type BlockType } from "../types";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, Save, Smartphone, Monitor, ArrowLeft } from "lucide-react";
import BlockRenderer from "../components/BlockRenderer";
import { useAuth } from "../contexts/AuthContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export default function EditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const { token, user } = useAuth();
  const [title, setTitle] = useState("Untitled Blog");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(editId);

  // 🧩 Normalize blocks into TipTap JSON structure
  const normalizeBlocks = (incoming: any[]): Block[] => {
    return (incoming || []).map((b) => {
      const content = b.content ?? b.blocks ?? "";
      let normalizedContent = content;

      try {
        if (typeof content === "string") {
          normalizedContent = {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: content }] },
            ],
          };
        }
        if (Array.isArray(content)) {
          normalizedContent = { type: "doc", content };
        }
        if (content && typeof content === "object" && content.type !== "doc") {
          normalizedContent = { type: "doc", content: [content] };
        }
      } catch {
        normalizedContent = {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "" }] },
          ],
        };
      }

      return {
        id: b.id || uuidv4(),
        type: b.type || "paragraph",
        content: normalizedContent,
        attrs: b.attrs || {},
      };
    });
  };

  // 🧠 Load existing blog for editing (if edit param present)
  useEffect(() => {
    if (editingId) {
      loadBlogForEditing(editingId);
    }
  }, [editingId]);

  const loadBlogForEditing = async (blogId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.status === "error") throw new Error(data.message);

      const blog = data.data.blog;
      setTitle(blog.title);
      setBlocks(normalizeBlocks(blog.blocks));
    } catch (error) {
      console.error("Error loading blog for editing:", error);
      alert(`Failed to load blog for editing: ${error.message}`);
    }
  };

  // 💾 Save as Draft
  const saveAsDraft = async () => {
    if (!token) return alert("Not authorized");

    try {
      setSaving(true);

      const response = await fetch(`${BACKEND_URL}/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          blocks,
          status: "draft",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Saved as draft!");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  // 🚀 Publish or Update Blog
  const publish = async () => {
    if (!token) return alert("Not authorized");

    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        const response = await fetch(`${BACKEND_URL}/api/blogs/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            blocks,
            status: "published",
            publishedAt: new Date(),
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        navigate(
          user && user.role === "admin"
            ? `/admin/view/${editingId}`
            : `/view/${editingId}`
        );
      } else {
        // Create new blog
        const response = await fetch(`${BACKEND_URL}/api/blogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            blocks, // not JSON.stringify(blocks)
            status: "published",
            publishedAt: new Date(),
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        navigate(
          user && user.role === "admin"
            ? `/admin/view/${data.data.blog._id}`
            : `/view/${data.data.blog._id}`
        );
      }
    } catch (error) {
      console.error("Error publishing blog:", error);
      alert("Failed to publish blog. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ➕ Add Block
  const addBlock = (type: BlockType) => {
    const defaultContent =
      type === "heading"
        ? {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "" }],
              },
            ],
          }
        : {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "" }] },
            ],
          };

    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: defaultContent,
      attrs: {},
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: any, attrs?: any) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content, attrs } : b)));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      {viewMode === "edit" && <Sidebar onAddBlock={addBlock} />}

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold outline-none flex-1 mr-4"
              placeholder="Blog Title"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setViewMode(viewMode === "edit" ? "preview" : "edit")
              }
              className="p-2"
            >
              {viewMode === "edit" ? (
                <Eye className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </button>

            {viewMode === "preview" && (
              <button
                onClick={() =>
                  setDevice(device === "desktop" ? "mobile" : "desktop")
                }
                className="p-2"
              >
                {device === "desktop" ? (
                  <Smartphone className="w-5 h-5" />
                ) : (
                  <Monitor className="w-5 h-5" />
                )}
              </button>
            )}

            <button
              onClick={saveAsDraft}
              disabled={saving}
              className="px-4 py-2 bg-gray-200 rounded flex items-center gap-1"
            >
              <Save className="w-4 h-4" /> Draft
            </button>

            <button
              onClick={publish}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Publish"}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === "edit" ? (
            <div className="max-w-4xl mx-auto">
              <BlockList
                blocks={blocks}
                onReorder={setBlocks}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            </div>
          ) : (
            <div
              className={`mx-auto ${
                device === "mobile" ? "max-w-sm" : "max-w-4xl"
              } p-4 bg-white shadow-lg rounded`}
            >
              <h1 className="text-3xl font-bold mb-6">{title}</h1>
              {blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
