"use client";

import { useState, useEffect } from "react";
import { Page } from "../Cms";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Editor from "@monaco-editor/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
} from "lucide-react";

interface PageEditorContentProps {
  page: Page;
  onChange: (page: Page) => void;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

// ─── Visual Tab (TipTap WYSIWYG) ─────────────────────────

function VisualEditor({
  page,
  onChange,
}: {
  page: Page;
  onChange: (page: Page) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: page.html || "",
    onUpdate: ({ editor }) => {
      onChange({ ...page, html: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[400px] text-foreground text-[15px] leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (editor && page.html !== editor.getHTML()) {
      editor.commands.setContent(page.html || "");
    }
  }, [page.id]);

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <>
      {/* WYSIWYG Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted">
        <select
          onChange={(e) => {
            if (!editor) return;
            const val = e.target.value;
            if (val === "p") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .setHeading({ level: Number(val) as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
          }}
          className="text-xs border border-border bg-background px-2 py-1 rounded text-foreground focus:outline-none mr-1"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          title="Bold"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          title="Italic"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          active={editor?.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          active={editor?.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          active={editor?.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          active={editor?.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <AlignJustify size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={addLink} title="Insert Link">
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert Image">
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={15} />
        </ToolbarButton>
      </div>

      {/* TipTap content area */}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </>
  );
}

// ─── Code Tab (Monaco with HTML / CSS / JS sub-tabs) ─────

function CodeEditor({
  page,
  onChange,
}: {
  page: Page;
  onChange: (page: Page) => void;
}) {
  const [activeCodeTab, setActiveCodeTab] = useState<"html" | "css" | "js">(
    "html",
  );

  const monacoOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: "on" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: "on" as const,
    formatOnPaste: true,
    formatOnType: true,
    autoClosingBrackets: "always" as const,
    autoClosingQuotes: "always" as const,
    autoIndent: "full" as const,
    bracketPairColorization: { enabled: true },
    smoothScrolling: true,
    cursorSmoothCaretAnimation: "on" as const,
  };

  const languageMap = { html: "html", css: "css", js: "javascript" };

  return (
    <>
      {/* HTML / CSS / JS sub-tabs */}
      <div className="flex border-b border-[#dcdcde] bg-[#1e1e1e]">
        {(["html", "css", "js"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCodeTab(tab)}
            className={`px-5 py-2.5 text-sm font-mono uppercase tracking-wide transition-colors ${
              activeCodeTab === tab
                ? "text-white border-b-2 border-[#2271b1] bg-[#252526]"
                : "text-[#858585] hover:text-white hover:bg-[#2a2d2e]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Monaco editor */}
      <div className="h-[500px]">
        <Editor
          height="100%"
          language={languageMap[activeCodeTab]}
          value={page[activeCodeTab] ?? ""}
          onChange={(value) =>
            onChange({ ...page, [activeCodeTab]: value || "" })
          }
          theme="vs-dark"
          options={monacoOptions}
          loading={
            <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-sm text-[#858585]">
              Loading editor...
            </div>
          }
        />
      </div>
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────

export function PageEditorContent({ page, onChange }: PageEditorContentProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "code">("visual");

  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      {/* Visual | Code top-level tabs — aligned right like WordPress */}
      <div className="flex justify-end border-b border-border bg-card px-3">
        {(["visual", "code"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Render active tab */}
      {activeTab === "visual" ? (
        <VisualEditor page={page} onChange={onChange} />
      ) : (
        <CodeEditor page={page} onChange={onChange} />
      )}
    </div>
  );
}
