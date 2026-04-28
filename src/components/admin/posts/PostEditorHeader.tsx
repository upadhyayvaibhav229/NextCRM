"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Post } from "../Cms";

interface PostEditorHeaderProps {
  post: Post;
  onChange: (post: Post) => void;
  onCancel: () => void;
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PostEditorHeader({ post, onChange, onCancel }: PostEditorHeaderProps) {
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState(post.slug);

  const handleTitleChange = (value: string) => {
    const newSlug = generateSlug(value);
    setSlugInput(newSlug);
    onChange({ ...post, title: value, slug: newSlug });
  };

  const handleSlugSave = () => {
    const clean = generateSlug(slugInput);
    setSlugInput(clean);
    onChange({ ...post, slug: clean });
    setEditingSlug(false);
  };

  return (
    <div className="border-b border-border bg-card px-6 py-4">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        All Posts
      </button>

      {/* Title */}
      <input
        type="text"
        value={post.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Post title"
        className="w-full text-[28px] font-semibold bg-transparent text-foreground border-none outline-none placeholder:text-muted-foreground/40 tracking-tight"
      />

      {/* Permalink */}
      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
        <span>Permalink:</span>
        {editingSlug ? (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">/posts/</span>
            <input
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              className="border-b border-primary bg-transparent text-foreground text-xs outline-none px-0.5 min-w-[120px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSlugSave();
                if (e.key === "Escape") setEditingSlug(false);
              }}
            />
            <button
              onClick={handleSlugSave}
              className="text-xs text-primary hover:underline"
            >
              OK
            </button>
            <button
              onClick={() => { setSlugInput(post.slug); setEditingSlug(false); }}
              className="text-xs text-muted-foreground hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-foreground font-medium">/posts/{post.slug}</span>
            <button
              onClick={() => setEditingSlug(true)}
              className="text-xs px-1.5 py-0.5 border border-border rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
