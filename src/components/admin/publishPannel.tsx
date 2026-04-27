"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Eye, Clock, Calendar } from "lucide-react";
import { Page } from "./Cms";

interface PublishPanelProps {
  page: Page;
  onChange: (page: Page) => void;
  onSave: () => void;
  onPublish: () => void;
  isSaving: boolean;
}


export function PublishPanel({
  page,
  onChange,
  onSave,
  onPublish,
  isSaving,
}: PublishPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingVisibility, setEditingVisibility] = useState(false);

  const isPublished = page.status === "published";

  return (
    <div className="bg-white border border-[#dcdcde] rounded shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#f6f7f7] border-b border-[#dcdcde]">
        <h2 className="text-sm font-semibold text-[#1d2327]">Publish</h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#787c82] hover:text-[#1d2327] transition-colors"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Save Draft + Preview */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-[#dcdcde]">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm border border-[#dcdcde] bg-white text-[#3c434a] rounded hover:bg-[#f6f7f7] transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() =>
                window.open(`/preview/${page.slug}`, "_blank")
              }
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#2271b1] hover:text-[#135e96] transition-colors"
            >
              <Eye size={14} />
              Preview
            </button>
          </div>

          {/* Status rows */}
          <div className="px-3 py-3 space-y-2 border-b border-[#dcdcde]">
            {/* Status */}
            <div className="flex items-center gap-2 text-sm text-[#3c434a]">
              <Clock size={14} className="text-[#787c82]" />
              <span className="font-medium">Status:</span>
              {editingStatus ? (
                <div className="flex items-center gap-2 ml-auto">
                  <select
                    value={page.status}
                    onChange={(e) =>
                      onChange({ ...page, status: e.target.value })
                    }
                    className="text-xs border border-[#dcdcde] px-1 py-0.5 rounded focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <button
                    onClick={() => setEditingStatus(false)}
                    className="text-xs text-[#2271b1] hover:underline"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <span className="ml-auto">
                  {isPublished ? "Published" : "Draft"}
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="ml-2 text-xs text-[#2271b1] hover:underline"
                  >
                    Edit
                  </button>
                </span>
              )}
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-2 text-sm text-[#3c434a]">
              <Eye size={14} className="text-[#787c82]" />
              <span className="font-medium">Visibility:</span>
              <span className="ml-auto">
                Public
                <button
                  onClick={() => setEditingVisibility(!editingVisibility)}
                  className="ml-2 text-xs text-[#2271b1] hover:underline"
                >
                  Edit
                </button>
              </span>
            </div>

            {/* Publish date */}
            {isPublished && (
              <div className="flex items-center gap-2 text-sm text-[#3c434a]">
                <Calendar size={14} className="text-[#787c82]" />
                <span className="font-medium">Published on:</span>
                <span className="ml-auto text-xs text-[#787c82]">
                  {page.publishedAt
                    ? new Date(page.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between px-3 py-3">
            <button className="text-xs text-[#b32d2e] hover:text-[#a02020] hover:underline transition-colors">
              Move to Trash
            </button>
            <button
              onClick={onPublish}
              disabled={isSaving}
              className="px-4 py-1.5 text-sm font-medium bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors disabled:opacity-50"
            >
              {isSaving ? "Publishing..." : isPublished ? "Update" : "Publish"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}