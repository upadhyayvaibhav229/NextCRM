"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2, ExternalLink } from "lucide-react";

const SOCIAL_PLATFORMS = [
  { value: "facebook", label: "Facebook", icon: "f" },
  { value: "instagram", label: "Instagram", icon: "ig" },
  { value: "twitter", label: "Twitter / X", icon: "x" },
  { value: "linkedin", label: "LinkedIn", icon: "in" },
  { value: "github", label: "GitHub", icon: "gh" },
  { value: "youtube", label: "YouTube", icon: "yt" },
];

interface SocialLink {
  platform: string;
  url: string;
}

interface FooterSettings {
  footerBrandTitle: string;
  footerDescription: string;
  footerCopyright: string;
  socialLinks: SocialLink[];
}

const DEFAULT_SETTINGS: FooterSettings = {
  footerBrandTitle: "My Website",
  footerDescription: "",
  footerCopyright: `© ${new Date().getFullYear()} My Website. All rights reserved.`,
  socialLinks: [],
};

export function FooterSettingsSection() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ─── Fetch existing footer settings ──────────────────────

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/footer-setting/");
        const data = await res.json();
        if (data.success && data.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.data.footer });
        }
      } catch {
        // no settings yet — use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ─── Save ─────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/footer-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "footer", value: settings }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Social links helpers ─────────────────────────────────

  const addSocialLink = () => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "facebook", url: "" }],
    }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setSettings((prev) => {
      const updated = [...prev.socialLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socialLinks: updated };
    });
  };

  const removeSocialLink = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Footer Settings
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            Manage footer branding, description and social links
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-600 text-sm rounded-lg">
          Footer settings saved successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Branding */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Branding
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Brand Title
              </label>
              <input
                type="text"
                value={settings.footerBrandTitle}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    footerBrandTitle: e.target.value,
                  }))
                }
                placeholder="My Website"
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description
              </label>
              <textarea
                value={settings.footerDescription}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    footerDescription: e.target.value,
                  }))
                }
                placeholder="A short description about your website..."
                rows={3}
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Copyright Text
              </label>
              <input
                type="text"
                value={settings.footerCopyright}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    footerCopyright: e.target.value,
                  }))
                }
                placeholder={`© ${new Date().getFullYear()} My Website. All rights reserved.`}
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Social Links
            </h2>
            <button
              onClick={addSocialLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Plus size={13} />
              Add Link
            </button>
          </div>

          {settings.socialLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No social links yet. Click "Add Link" to add one.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {settings.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(index, "platform", e.target.value)
                    }
                    className="text-sm bg-background border border-border rounded-lg px-2 py-2 text-foreground focus:outline-none focus:border-ring w-36 shrink-0"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                  />
                  {link.url && (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => removeSocialLink(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Columns info */}
        <div className="bg-muted/30 border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
            Footer Link Columns
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Footer columns are managed via Menus. Create menus with these
            locations:
          </p>
          <div className="flex flex-col gap-1.5">
            {["footer-1", "footer-2", "footer-3"].map((loc) => (
              <div
                key={loc}
                className="flex items-center gap-2 text-sm font-mono"
              >
                <span className="px-2 py-0.5 bg-muted border border-border rounded text-muted-foreground">
                  {loc}
                </span>
                <span className="text-muted-foreground text-xs">
                  → Footer Column {loc.split("-")[1]}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Go to{" "}
            <span className="font-semibold text-foreground">Menus</span> to
            manage footer link columns.
          </p>
        </div>
      </div>
    </div>
  );
}