"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Page } from "./Cms";

interface PageAttributesPanelProps {
  page: Page;
  pages: Page[];
  onChange: (page: Page) => void;
}

export function PageAttributesPanel({
  page,
  pages,
  onChange,
}: PageAttributesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Filter out the current page from parent options
  const parentOptions = pages.filter((p) => p.id !== page.id);

  return (
    <div className="bg-white border border-[#dcdcde] rounded shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#f6f7f7] border-b border-[#dcdcde]">
        <h2 className="text-sm font-semibold text-[#1d2327]">Page Attributes</h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#787c82] hover:text-[#1d2327] transition-colors"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 py-3 space-y-4">
          {/* Parent */}
          <div>
            <label className="block text-sm font-medium text-[#1d2327] mb-1">
              Parent
            </label>
            <select
              value={(page as any).parentId ?? ""}
              onChange={(e) =>
                onChange({
                  ...page,
                  parentId: e.target.value ? Number(e.target.value) : null,
                } as any)
              }
              className="w-full text-sm border border-[#dcdcde] bg-white px-2 py-1.5 rounded focus:outline-none focus:border-[#2271b1] text-[#3c434a]"
            >
              <option value="">(no parent)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-[#1d2327] mb-1">
              Template
            </label>
            <select
              value={(page as any).template ?? "default"}
              onChange={(e) =>
                onChange({ ...page, template: e.target.value } as any)
              }
              className="w-full text-sm border border-[#dcdcde] bg-white px-2 py-1.5 rounded focus:outline-none focus:border-[#2271b1] text-[#3c434a]"
            >
              <option value="default">Default template</option>
              <option value="full-width">Full Width</option>
              <option value="landing">Landing Page</option>
              <option value="sidebar">With Sidebar</option>
            </select>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-[#1d2327] mb-1">
              Order
            </label>
            <input
              type="number"
              value={(page as any).order ?? 0}
              onChange={(e) =>
                onChange({ ...page, order: Number(e.target.value) } as any)
              }
              className="w-20 text-sm border border-[#dcdcde] bg-white px-2 py-1.5 rounded focus:outline-none focus:border-[#2271b1] text-[#3c434a]"
            />
          </div>

          {/* Help text */}
          <p className="text-xs text-[#787c82]">
            Need help? Use the Help tab above the screen title.
          </p>
        </div>
      )}
    </div>
  );
}