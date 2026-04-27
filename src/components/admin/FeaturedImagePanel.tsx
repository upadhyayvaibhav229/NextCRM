"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ImagePlus, X } from "lucide-react";
import { Page } from "./Cms";

interface FeaturedImagePanelProps {
  page: Page;
  onChange: (page: Page) => void;
}

export function FeaturedImagePanel({ page, onChange }: FeaturedImagePanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const featuredImage = (page as any).featuredImage as string | null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create object URL for preview (replace with real upload logic)
    const url = URL.createObjectURL(file);
    onChange({ ...page, featuredImage: url } as any);
  };

  const handleUrlInput = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      onChange({ ...page, featuredImage: url } as any);
    }
  };

  const removeImage = () => {
    onChange({ ...page, featuredImage: null } as any);
  };

  return (
    <div className="bg-white border border-[#dcdcde] rounded shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#f6f7f7] border-b border-[#dcdcde]">
        <h2 className="text-sm font-semibold text-[#1d2327]">Featured Image</h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#787c82] hover:text-[#1d2327] transition-colors"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 py-3">
          {featuredImage ? (
            <div className="relative group">
              <img
                src={featuredImage}
                alt="Featured"
                className="w-full rounded border border-[#dcdcde] object-cover max-h-40"
              />
              <button
                onClick={removeImage}
                className="absolute top-1.5 right-1.5 p-1 bg-white border border-[#dcdcde] rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <X size={12} className="text-[#b32d2e]" />
              </button>
              <button
                onClick={removeImage}
                className="block mt-2 w-full text-center text-xs text-[#b32d2e] hover:underline"
              >
                Remove featured image
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#dcdcde] rounded cursor-pointer hover:border-[#2271b1] hover:bg-[#f0f6fc] transition-colors group">
                <ImagePlus
                  size={20}
                  className="text-[#787c82] group-hover:text-[#2271b1] transition-colors mb-1"
                />
                <span className="text-xs text-[#787c82] group-hover:text-[#2271b1] transition-colors">
                  Upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <button
                onClick={handleUrlInput}
                className="w-full text-center text-xs text-[#2271b1] hover:underline"
              >
                Or set from URL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}