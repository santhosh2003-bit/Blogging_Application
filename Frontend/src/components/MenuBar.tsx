import { useState } from "react";
import { Editor } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type,
} from "lucide-react";
import ColorPicker from "./ColorPicker";
import LinkModal from "./LinkModal";
import EmojiPicker from "./EmojiPicker";

const FONT_SIZES = [
  { label: "8px", value: "8px" },
  { label: "10px", value: "10px" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "48px", value: "48px" },
];

interface Props {
  editor: Editor;
}

export function MenuBar({ editor }: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [colorPickerType, setColorPickerType] = useState<"text" | "background">(
    "text"
  );

  const handleLinkSubmit = (url: string, text?: string) => {
    if (text && text.trim()) {
      editor.chain().focus().insertContent(text).setLink({ href: url }).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleColorSelect = (color: string) => {
    // Use the textStyle mark to apply inline color/background reliably
    if (colorPickerType === "text") {
      editor.chain().focus().setMark("textStyle", { color }).run();
    } else {
      editor.chain().focus().setMark("textStyle", { backgroundColor: color }).run();
    }
    // Don't close the picker automatically - let user try different colors
  };

  const applyTextAlign = (alignment: "left" | "center" | "right" | "justify") => {
    try {
      if (editor.commands && (editor.commands as any).setTextAlign) {
        // call the extension command and run it
        const res = editor.chain().focus().setTextAlign(alignment).run();
        if (!res) {
          // fallback: set node attribute for paragraph
          editor.chain().focus().setNode("paragraph", { textAlign: alignment }).run();
        }
      } else {
        // fallback when command not available
        editor.chain().focus().setNode("paragraph", { textAlign: alignment }).run();
      }
    } catch {
      // fallback
      editor.chain().focus().setNode("paragraph", { textAlign: alignment }).run();
    }
  };

  // font size changes are handled inline on the <select/> element; function removed to avoid unused-var TS error

  const openTextColorPicker = () => {
    setColorPickerType("text");
    setShowColorPicker(true);
  };

  const openBgColorPicker = () => {
    setColorPickerType("background");
    setShowBgColorPicker(true);
  };

  // Robust heading handler: if toggleHeading isn't available or fails,
  // fall back to setNode('heading'). Also allow toggling back to paragraph.
  const applyHeading = (level: 1 | 2 | 3) => {
    try {
      if (editor.isActive("heading", { level })) {
        editor.chain().focus().setNode("paragraph").run();
        return;
      }

      const ok = editor.chain().focus().toggleHeading({ level }).run();
      if (!ok) {
        // fallback
        editor.chain().focus().setNode("heading", { level }).run();
      }
    } catch {
      // last-resort fallback
      editor.chain().focus().setNode("heading", { level }).run();
    }
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${
          editor.isActive("bold") ? "bg-blue-100" : "hover:bg-gray-200"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${
          editor.isActive("italic") ? "bg-blue-100" : "hover:bg-gray-200"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded ${
          editor.isActive("underline") ? "bg-blue-100" : "hover:bg-gray-200"
        }`}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      {/* Colors */}
      <button
        onClick={openTextColorPicker}
        className="p-1 rounded hover:bg-gray-200"
        title="Text Color"
      >
        <Type className="w-4 h-4" />
      </button>

      <button
        onClick={openBgColorPicker}
        className="p-1 rounded hover:bg-gray-200"
        title="Background Color"
      >
        <Palette className="w-4 h-4" />
      </button>

      {/* Font Size */}
      <select
        onChange={(e) =>
          editor.chain().focus().setFontSize(e.target.value).run()
        }
        className="p-1 rounded border border-gray-300 text-sm bg-white hover:bg-gray-50"
        title="Font Size"
        defaultValue=""
      >
        <option value="" disabled>
          Size
        </option>
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>

      {/* Links */}
      <button
        onClick={() => setShowLinkModal(true)}
        className={`p-1 rounded ${
          editor.isActive("link") ? "bg-blue-100" : "hover:bg-gray-200"
        }`}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>

      {/* Headings */}
      <button
        onClick={() => applyHeading(1)}
        className={`p-1 rounded ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-100"
            : "hover:bg-gray-200"
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyHeading(2)}
        className={`p-1 rounded ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-100"
            : "hover:bg-gray-200"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyHeading(3)}
        className={`p-1 rounded ${
          editor.isActive("heading", { level: 3 })
            ? "bg-blue-100"
            : "hover:bg-gray-200"
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${
          editor.isActive("bulletList") ? "bg-blue-100" : "hover:bg-gray-200"
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded ${
          editor.isActive("orderedList") ? "bg-blue-100" : "hover:bg-gray-200"
        }`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      {/* Quote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1 rounded ${
          editor.isActive("blockquote") ? "bg-blue-100" : "hover:bg-gray-200"
        }`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>

      {/* Text Alignment */}
      <button
        onClick={() => applyTextAlign("left")}
        className={`p-1 rounded ${
          editor.isActive({ textAlign: "left" })
            ? "bg-blue-100"
            : "hover:bg-gray-200"
        }`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyTextAlign("center")}
        className={`p-1 rounded ${
          editor.isActive({ textAlign: "center" })
            ? "bg-blue-100"
            : "hover:bg-gray-200"
        }`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyTextAlign("right")}
        className={`p-1 rounded ${
          editor.isActive({ textAlign: "right" })
            ? "bg-blue-100"
            : "hover:bg-gray-200"
        }`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyTextAlign("justify")}
        className={`p-1 rounded ${
          editor.isActive({ textAlign: "justify" })
            ? "bg-blue-100"
            : "hover:bg-gray-200"
        }`}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      {/* Emoji Picker */}
      <EmojiPicker
        onEmojiSelect={(emoji) =>
          editor.chain().focus().insertContent(emoji).run()
        }
      />

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      {/* Modals */}
      {showColorPicker && (
        <ColorPicker
          onColorSelect={handleColorSelect}
          onClose={() => setShowColorPicker(false)}
          title="Choose Text Color"
        />
      )}

      {showBgColorPicker && (
        <ColorPicker
          onColorSelect={handleColorSelect}
          onClose={() => setShowBgColorPicker(false)}
          title="Choose Background Color"
        />
      )}

      {showLinkModal && (
        <LinkModal
          onLinkSubmit={handleLinkSubmit}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
}
