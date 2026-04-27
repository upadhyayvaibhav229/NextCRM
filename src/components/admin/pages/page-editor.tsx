"use client";

import { useState } from "react";
import { Page } from "../Cms";
import { PageEditorHeader } from "./PageEditorHeader";
import { PageEditorContent } from "./PageEditorContent";
import { PageEditorSidebar } from "./PageEditorSidebar";

interface PageEditorProps {
  page: Page;
  pages: Page[];
  onChange: (page: Page) => void;
  onSave: (pageToSave?: Page) => Promise<void>;
  onCancel: () => void;
}

export function PageEditor({
  page,
  pages,
  onChange,
  onSave,
  onCancel,
}: PageEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(page);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const updatedPage = {
      ...page,
      status: "published",
    };

    onChange(updatedPage);

    setIsSaving(true);
    try {
      await onSave(updatedPage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background min-h-screen font-sans">
      <PageEditorHeader
        page={page}
        onChange={onChange}
        onCancel={onCancel}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <div className="flex flex-1 gap-6 p-6 max-w-[1400px] w-full mx-auto">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <PageEditorContent page={page} onChange={onChange} />
        </div>

        <div className="w-[280px] shrink-0 flex flex-col gap-4">
          <PageEditorSidebar
            page={page}
            pages={pages}
            onChange={onChange}
            onSave={handleSave}
            onPublish={handlePublish}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
