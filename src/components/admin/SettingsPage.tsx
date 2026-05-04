"use client";

import { useState, useRef, useEffect } from "react";
import {
  Save,
  Globe,
  Settings as SettingsIcon,
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

// ─── Image Upload Component (Simplified - No URL input) ─────────────────────

interface ImageUploadProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
}

function ImageUpload({ label, value, onChange, onUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      if (onUpload) {
        const url = await onUpload(file);
        onChange(url);
      } else {
        // Fallback to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {/* Image Preview */}
      {value && (
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-lg border border-border bg-muted/20 overflow-hidden">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* File Input */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
        />

        {isUploading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Uploading...</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Settings Component ─────────────────────────────────────────────────

interface SiteSettings {
  id: number;
  siteName: string | null;
  siteTagline: string | null;
  logo: string | null;
  favicon: string | null;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  postsPerPage: number;

  homepageType: "posts" | "page";
  homepagePageId: number | null;
  postsPageId: number | null;

  createdAt: Date;
  updatedAt: Date;
}

interface SettingsPageProps {
  initialSettings?: Partial<SiteSettings>;
  onSave: (settings: Partial<SiteSettings>) => Promise<void>;
  onUpload?: (file: File) => Promise<string>;
  isSaving?: boolean;
}

export function SettingsPage({
  initialSettings,
  onSave,
  onUpload,
  isSaving = false,
}: SettingsPageProps) {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    siteName: "",
    siteTagline: "",
    logo: "",
    favicon: "",
    defaultMetaTitle: "",
    defaultMetaDescription: "",
    postsPerPage: 10,
    ...initialSettings,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchPages = async () => {
      const response = await fetch("/api/pages");
      const data = await response.json();
      setPages(data.data);
    };
    fetchPages();
  }, []);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        siteName: "",
        siteTagline: "",
        logo: "",
        favicon: "",
        defaultMetaTitle: "",
        defaultMetaDescription: "",
        postsPerPage: 10,
        ...initialSettings,
      });

      setHasChanges(false);
    }
  }, [initialSettings]);
  const updateField = <K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setSaveStatus("saving");
    try {
      await onSave(settings);
      setSaveStatus("success");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Site Settings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Configure your site's global settings, SEO defaults, and appearance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* General Settings */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  General Settings
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName || ""}
                  onChange={(e) => updateField("siteName", e.target.value)}
                  placeholder="My Awesome Site"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Tagline
                </label>
                <input
                  type="text"
                  name="siteTagline"
                  value={settings.siteTagline || ""}
                  onChange={(e) => updateField("siteTagline", e.target.value)}
                  placeholder="A great place to share knowledge"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <ImageUpload
                label="Site Logo"
                value={settings.logo || null}
                onChange={(url) => updateField("logo", url || "")}
                onUpload={onUpload}
              />

              <ImageUpload
                label="Favicon"
                value={settings.favicon || null}
                onChange={(url) => updateField("favicon", url || "")}
                onUpload={onUpload}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Posts Per Page
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="postsPerPage"
                    value={settings.postsPerPage}
                    onChange={(e) =>
                      updateField(
                        "postsPerPage",
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={1}
                    max={100}
                    className="w-32 border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-muted-foreground">
                    posts per page
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reading Settings */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="text-lg font-semibold">Reading Settings</h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Homepage Displays
                </label>

                <select
                  value={settings.homepageType || "posts"}
                  onChange={(e) =>
                    updateField(
                      "homepageType",
                      e.target.value as "posts" | "page",
                    )
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="posts">Your latest posts</option>
                  <option value="page">A static page</option>
                </select>
              </div>

              {settings.homepageType === "page" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Homepage
                    </label>
                    <select
                      value={settings.homepagePageId || ""}
                      onChange={(e) =>
                        updateField("homepagePageId", Number(e.target.value))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      {
                        /* map pages here */
                        pages.map((page) => (
                          <option key={page.id} value={page.id}>
                            {page.title}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Posts Page
                    </label>
                    <select
                      value={settings.postsPageId || ""}
                      onChange={(e) =>
                        updateField("postsPageId", Number(e.target.value))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            {hasChanges && (
              <button
                type="button"
                onClick={() => {
                  setSettings(initialSettings || {});
                  setHasChanges(false);
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={!hasChanges || saveStatus === "saving"}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === "saving" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {saveStatus === "success" && <CheckCircle2 className="h-4 w-4" />}
              {saveStatus === "error" && <AlertCircle className="h-4 w-4" />}
              {saveStatus === "idle" && <Save className="h-4 w-4" />}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "success" && "Saved!"}
              {saveStatus === "error" && "Error!"}
              {saveStatus === "idle" &&
                (hasChanges ? "Save Changes" : "No Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
