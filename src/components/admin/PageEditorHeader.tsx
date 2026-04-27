"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { Page } from "./Cms";
import { useState } from "react";

interface PageEditorHeaderProps {
  page: Page;
  onChange: (page: Page) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function PageEditorHeader({
  page,
  onChange,
  onCancel,
  onSave,
  isSaving,
}: PageEditorHeaderProps) {
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugInput, setSlugInput] = useState(page.slug);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (value: string) => {
    const newSlug = generateSlug(value);
    setSlugInput(newSlug);
    onChange({ ...page, title: value, slug: newSlug });
  };

  const handleSlugSave = () => {
    const clean = generateSlug(slugInput);
    setSlugInput(clean);
    onChange({ ...page, slug: clean });
    setSlugEditing(false);
  };

  const openPreview = () => {
    window.open(`/preview/${page.slug}`, "_blank");
  };

  return (
    <div className="bg-white border-b border-[#dcdcde] shadow-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#dcdcde]">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm text-[#3c434a] hover:text-[#2271b1] transition-colors"
          >
            <ArrowLeft size={16} />
            All Pages
          </button>
          <span className="text-[#dcdcde]">|</span>
          <span className="text-sm font-semibold text-[#1d2327]">
            Edit Page
          </span>
          <button
            onClick={onCancel}
            className="ml-2 px-3 py-1 text-sm text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white transition-colors rounded"
          >
            Add Page
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#3c434a] border border-[#dcdcde] bg-white hover:bg-[#f6f7f7] transition-colors rounded"
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </div>

      {/* Title + Permalink */}
      <div className="px-6 py-4">
        <input
          type="text"
          value={page.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Add title"
          className="w-full text-[26px] font-normal text-[#1d2327] border border-[#dcdcde] bg-white px-4 py-3 rounded focus:outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] placeholder:text-[#9ca3af]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        />

        {/* Permalink row */}
        <div className="flex items-center gap-2 mt-2 text-sm text-[#3c434a]">
          <span className="font-medium">Permalink:</span>
          {slugEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-[#2271b1]">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/`
                  : "/"}
              </span>
              <input
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                className="border border-[#2271b1] px-2 py-0.5 text-sm rounded focus:outline-none"
                autoFocus
              />
              <span className="text-[#2271b1]">/</span>
              <button
                onClick={handleSlugSave}
                className="px-2 py-0.5 text-xs bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setSlugInput(page.slug);
                  setSlugEditing(false);
                }}
                className="px-2 py-0.5 text-xs border border-[#dcdcde] rounded hover:bg-[#f6f7f7] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <a
                href={`/${page.slug}`}
                target="_blank"
                className="text-[#2271b1] hover:underline"
              >
                {typeof window !== "undefined"
                  ? `${window.location.origin}/`
                  : "/"}
                <span className="font-medium">{page.slug}</span>/
              </a>
              <button
                onClick={() => setSlugEditing(true)}
                className="px-2 py-0.5 text-xs border border-[#dcdcde] bg-white rounded hover:bg-[#f6f7f7] transition-colors"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}