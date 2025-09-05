import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Code,
  Quote,
  Redo2,
  Undo2,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  Palette,
  ListChecks,
} from "lucide-react";
import { Toggle } from "./ui/toggle";
import { Editor } from "@tiptap/react";
import React from "react";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Add a URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    try {
      const normalized = new URL(url).toString();
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalized })
        .run();
    } catch {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const removeLink = () => editor.chain().focus().unsetLink().run();

  const options = [
    {
      icon: <Undo2 className="size-4" />,
      onClick: () => editor.chain().focus().undo().run(),
      pressed: false,
      aria: "Undo",
    },
    {
      icon: <Redo2 className="size-4" />,
      onClick: () => editor.chain().focus().redo().run(),
      pressed: false,
      aria: "Redo",
    },
    "sep",
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
      aria: "Heading 1",
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
      aria: "Heading 2",
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
      aria: "Heading 3",
    },
    "sep",
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
      aria: "Bold",
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
      aria: "Italic",
    },
    {
      icon: <UnderlineIcon className="size-4" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      pressed: editor.isActive("underline"),
      aria: "Underline",
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
      aria: "Strikethrough",
    },
    {
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      pressed: editor.isActive("highlight"),
      aria: "Highlight",
    },
    "sep",
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: editor.isActive({ textAlign: "left" }),
      aria: "Align left",
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
      aria: "Align center",
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
      aria: "Align right",
    },
    "sep",
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
      aria: "Bullet list",
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
      aria: "Ordered list",
    },
    {
      icon: <ListChecks className="size-4" />,
      onClick: () => editor.chain().focus().toggleTaskList().run(),
      pressed: editor.isActive("taskList"),
      aria: "Checklist",
    },
    "sep",
    {
      icon: <Quote className="size-4" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      pressed: editor.isActive("blockquote"),
      aria: "Blockquote",
    },
    {
      icon: <Code className="size-4" />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      pressed: editor.isActive("codeBlock"),
      aria: "Code block",
    },
    "sep",
    {
      icon: <LinkIcon className="size-4" />,
      onClick: setLink,
      pressed: editor.isActive("link"),
      aria: "Add link",
    },
    {
      icon: <UnlinkIcon className="size-4" />,
      onClick: removeLink,
      pressed: false,
      aria: "Remove link",
    },
  ] as const;

  return (
    <div className="sticky top-14 z-50 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md shadow-sm px-2 py-1 flex items-center gap-1 w-fit transition-all">
      {options.map((option, index) => {
        if (option === "sep") {
          return (
            <span key={`sep-${index}`} className="mx-1 h-4 w-px bg-slate-200" />
          );
        }
        return (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.onClick}
            aria-label={option.aria}
            className="data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-600 hover:bg-slate-100 transition-colors rounded-md"
          >
            {option.icon}
          </Toggle>
        );
      })}
      <div className="ml-1 h-6 w-px bg-slate-200" />
      <label className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-slate-100 transition-colors">
        <Palette className="size-4 text-slate-600" />
        <input
          type="color"
          aria-label="Text color"
          defaultValue="#000000"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          className="h-4 w-4 cursor-pointer appearance-none border-0 bg-transparent p-0"
        />
      </label>
    </div>
  );
}
