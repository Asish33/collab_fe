"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import MenuBar from "./menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import type { JSONContent } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";

const lowlight = createLowlight(common);

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
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      Placeholder.configure({
        placeholder:
          typeof content === "string" && content.trim().length > 0
            ? ""
            : "Start typing… Use the toolbar for formatting",
        includeChildren: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextStyle,
      Color,
      CharacterCount.configure({ limit: 100000 }),
    ],
    content: content ?? "",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-xl bg-gradient-to-br from-slate-50 to-white/60 ring-1 ring-slate-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 transition-colors duration-200 px-5 py-4",
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
      editor.commands.setContent(content as JSONContent | string, {
        emitUpdate: false,
      });
    } catch {
      // noop: if invalid content, ignore to avoid breaking editor
    }
  }, [editor, content]);

  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className="space-y-3">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex justify-end text-xs text-slate-500 select-none">
        {charCount.toLocaleString()} characters
      </div>
    </div>
  );
}
