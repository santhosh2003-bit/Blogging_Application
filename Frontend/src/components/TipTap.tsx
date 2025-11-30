import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { FontSize } from "./extensions/FontSize";

import { MenuBar } from "./MenuBar";
import "./editor-styles.css";

interface Props {
  content: any;
  onChange: (json: any) => void;
  placeholder?: string;
}

export default function TipTap({
  content,
  onChange,
  placeholder = "Write something...",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      FontSize,

      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote", "listItem"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  useEffect(() => {
    if (!editor || !content) return;

    try {
      // Avoid resetting the editor content while the user is actively editing.
      // If the editor already has the same JSON content, do nothing.
      const current = editor.getJSON();
      const incoming = content;
      const same = JSON.stringify(current) === JSON.stringify(incoming);

      if (same) return;

      // Only programmatically set content if the editor is not focused to
      // preserve cursor/selection and avoid jumpiness during typing.
      if (!editor.isFocused) {
        editor.commands.setContent(incoming);
      }
      // If editor is focused, skip setContent to avoid disrupting selection.
    } catch (err) {
      // If anything goes wrong, fall back to setting content once.
      // eslint-disable-next-line no-console
      console.error("TipTap sync error:", err);
      if (editor && !editor.isFocused) editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {editor && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
