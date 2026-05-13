"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export function GlobalCssEditor() {
  const [css, setCss]         = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  // ── Fetch from DB ──
  useEffect(() => {
    const fetchCss = async () => {
      try {
        setFetching(true);
        const res  = await fetch("/api/setting/global-css");
        const data = await res.json();
        if (data.success) setCss(data.data?.css || "");
      } catch (err) {
        console.error("Failed to load global CSS:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchCss();
  }, []);

  // ── Save to DB ──
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/setting/global-css", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ css }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──
  const handleReset = async () => {
    try {
      setLoading(true);
      setError("");
      setCss("");

      const res = await fetch("/api/setting/global-css", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ css: "" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-foreground mb-1">
          Global CSS
        </h1>
        <p className="text-sm font-mono text-muted-foreground">
          Applies to all public pages — loaded before page-specific CSS
        </p>
      </div>

      <div className="max-w-5xl space-y-6">
        <div className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-4">
            CSS written here applies to every page. Page-specific CSS
            always overrides global CSS.
          </p>

          {/* Monaco Editor */}
          {fetching ? (
            <div className="flex items-center justify-center h-[420px] bg-[#1e1e1e] text-sm text-[#858585]">
              Loading editor...
            </div>
          ) : (
            <div className="border border-border overflow-hidden">
              <Editor
                height="420px"
                language="css"
                value={css}
                onChange={(value) => setCss(value || "")}
                theme="vs-dark"
                options={{
                  minimap:              { enabled: false },
                  fontSize:             14,
                  lineNumbers:          "on",
                  scrollBeyondLastLine: false,
                  automaticLayout:      true,
                  tabSize:              2,
                  wordWrap:             "on",
                  formatOnPaste:        true,
                  formatOnType:         true,
                  autoClosingBrackets:  "always" as const,
                  autoClosingQuotes:    "always" as const,
                }}
                loading={
                  <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-sm text-[#858585]">
                    Loading editor...
                  </div>
                }
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={loading || fetching}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleReset}
            disabled={loading || fetching}
            className="px-4 py-2 bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          {saved && (
            <span className="text-sm text-green-500">✓ Saved successfully</span>
          )}
          {error && (
            <span className="text-sm text-red-500">{error}</span>
          )}
        </div>

        {/* Info box */}
        <div className="bg-muted/50 border border-border p-4 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How it works</p>
          <p>→ Saved to <code className="font-mono text-xs">SiteSettings.globalCss</code> in DB</p>
          <p>→ Loaded on every public page before page-specific CSS</p>
          <p>→ Page CSS always overrides global CSS</p>
          <p>→ Tailwind CDN already loaded — all Tailwind classes work in pages</p>
        </div>
      </div>
    </div>
  );
}