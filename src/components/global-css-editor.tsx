"use client";

import { useEffect, useState } from "react";

export function GlobalCssEditor() {
  const [css, setCss] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedCss = localStorage.getItem("cms_global_css");
    if (storedCss) {
      setCss(storedCss);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cms_global_css", css);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setCss("");
    localStorage.removeItem("cms_global_css");
    setSaved(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-foreground mb-1">
          Global CSS
        </h1>
        <p className="text-sm font-mono text-muted-foreground">
          app/admin/setting/global-css/page.tsx
        </p>
      </div>

      <div className="max-w-5xl space-y-6">
        <div className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Add custom CSS that applies across preview pages.
          </p>
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder={`/* Add your custom CSS here */\nbody {\n  background: #f5f5f5;\n}`}
            className="min-h-105 w-full resize-y bg-background border border-border p-4 font-mono text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Reset
          </button>
          {saved && (
            <span className="text-sm text-green-500">Saved successfully</span>
          )}
        </div>

        {/* <div className="max-w-2xl bg-card border border-border p-6">
          <h2 className="font-medium text-foreground mb-3">How it works</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Stored in `localStorage` as `cms_global_css`.</p>
            <p>Injected into preview pages in addition to per-page CSS.</p>
            <p>Use `/admin/setting/global-css` or the sidebar section.</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
