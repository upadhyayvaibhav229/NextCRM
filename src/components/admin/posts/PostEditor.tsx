"use client";

import { useState } from "react";
// import { Post } from "../Cms";
import { PostEditorHeader } from "./PostEditorHeader";
import { PostEditorActions } from "./PostEditorActions";
import { PostEditorContent } from "./PostEditorContent";
import { PostEditorSidebar } from "./Posteditorsidebar";
import { Post } from "./Post.type";
import { Button } from "@/src/ui/button";
// import { PostEditorSidebar } from "./PostEditorSidebar";

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Title + permalink */}
      <PostEditorHeader post={post} onChange={onChange} onCancel={onCancel} />

      {/* Sticky actions bar */}
      <PostEditorActions
        post={post}
        onChange={onChange}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <div className="px-6 py-6">

              <Button className="">Add Media</Button>
      </div>

      {/* Two column layout */}
      <div className="flex gap-6  max-w-375 w-full mx-auto">
        {/* Left — editor */}

        <div className="flex-1 min-w-0">
          <PostEditorContent post={post} onChange={onChange} />
        </div>

        {/* Right — sidebar (Excerpt, Format, SEO) */}
        <div className="w-[320px] shrink-0">
          <PostEditorSidebar post={post} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}