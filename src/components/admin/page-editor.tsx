"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, Check } from "lucide-react";
import { Page } from "./Cms";

interface PageEditorProps {
  page: Page;
  pages: Page[];
  onChange: (page: Page) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PageEditor({
  page,
  pages,
  onChange,
  onSave,
  onCancel,
}: PageEditorProps) {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const openPreview = () => {
    const updatedPages = pages.map((p) => (p.id === page.id ? page : p));
    const isNewPage = !pages.find((p) => p.id === page.id);
    const allPages = isNewPage ? [...pages, page] : updatedPages;
    localStorage.setItem("cms_pages", JSON.stringify(allPages));
    window.open(`/preview/${page.slug}`, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
          <div>
            <input
              type="text"
              value={page.title}
              onChange={(e) =>
                onChange({
                  ...page,
                  title: e.target.value,
                  slug: generateSlug(e.target.value),
                })
              }
              className="bg-transparent text-lg font-bold text-foreground border-none outline-none w-full"
              placeholder="Page Title"
            />
            <p className="font-mono text-xs text-muted-foreground">
              /pages/{page.slug} → app/[slug]/page.tsx
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onChange({
                ...page,
                status: page.status === "published" ? "draft" : "published",
              })
            }
            className={`px-3 py-1.5 text-sm font-medium transition-all ${
              page.status === "published"
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {page.status === "published" ? "Published" : "Draft"}
          </button>
          <button
            onClick={openPreview}
            className="flex items-center gap-2 px-4 py-1.5 bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Check size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex border-b border-border bg-muted/30">
          {(["html", "css", "js"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-mono uppercase transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary bg-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-4 text-xs font-mono text-muted-foreground">
            <Eye size={14} />
            Click Preview to open in new tab
          </div>
        </div>
        <div className="flex-1 relative">
          <textarea
            value={page[activeTab]}
            onChange={(e) => onChange({ ...page, [activeTab]: e.target.value })}
            className="code-editor absolute inset-0 w-full h-full p-4 bg-code-bg text-foreground resize-none border-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}