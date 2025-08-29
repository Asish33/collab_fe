"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import MenuBar from "./menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import type { JSONContent } from "@tiptap/core";

interface RichTextEditorProps {
  content: JSONContent | string;
  onChange: (content: JSONContent) => void;
}
export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor) return;
    if (content === undefined || content === null) return;
    try {
      // Set content when prop changes (supports JSON or HTML/string)
      editor.commands.setContent(content as any, { emitUpdate: false });
    } catch {
      // noop: if invalid content, ignore to avoid breaking editor
    }
  }, [editor, content]);

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />;
    </div>
  );
}
