"use client";

import { useState } from "react";
import { Post } from "../Cms";
import { PostEditorHeader } from "./PostEditorHeader";
import { PostEditorActions } from "./PostEditorActions";
import { PostEditorContent } from "./PostEditorContent";
import { PostEditorMeta } from "./PostEditorMeta";

interface PostEditorProps {
  post: Post;
  onChange: (post: Post) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PostEditor({ post, onChange, onSave, onCancel }: PostEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (status?: string) => {
    setIsSaving(true);
    try {
      if (status) onChange({ ...post, status });
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col bg-background">
      {/* Top header — title + permalink */}
      <PostEditorHeader post={post} onChange={onChange} onCancel={onCancel} />

      {/* Sticky actions bar */}
      <PostEditorActions
        post={post}
        onChange={onChange}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Main content area */}
      <div className="flex-1 w-full max-w-215 mx-auto px-6 py-6 flex flex-col gap-4">
        <PostEditorContent post={post} onChange={onChange} />
        <PostEditorMeta post={post} onChange={onChange} />
      </div>
    </div>
  );
}
