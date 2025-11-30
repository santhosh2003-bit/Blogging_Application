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
import "./editor-styles.css";

interface Props {
  content: any;
  placeholder?: string;
}

export default function ReadOnlyTipTap({
  content,
  placeholder = "Write something...",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: true }),
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
    editable: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className=" overflow-hidden ">
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
