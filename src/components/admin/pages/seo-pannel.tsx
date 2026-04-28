"use client";

import { useState, useEffect, useRef } from "react";
import {
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  Code2,
  Share2,
  ExternalLink,
  Search,
  BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeoData {
  // General
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  isPillarContent: boolean;
  // Advanced
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  // Schema
  schemaType: string;
  // Social
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

interface SeoCheck {
  label: string;
  pass: boolean | null; // null = warning
}

interface SeoPanelProps {
  /** The page title (from page editor) */
  pageTitle?: string;
  /** The page slug */
  pageSlug?: string;
  /** The page HTML content (used for keyword analysis) */
  pageContent?: string;
  /** Base URL shown in SERP preview */
  siteUrl?: string;
  /** Initial SEO values */
  initialData?: Partial<SeoData>;
  /** Called whenever SEO data changes */
  onChange?: (data: SeoData) => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SEO: SeoData = {
  metaTitle: "",
  metaDescription: "",
  focusKeywords: [],
  isPillarContent: false,
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  schemaType: "WebPage",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
};

const SCHEMA_TYPES = [
  "WebPage",
  "Article",
  "BlogPosting",
  "Product",
  "FAQPage",
  "HowTo",
  "LocalBusiness",
  "Person",
  "Organization",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function buildChecks(
  seo: SeoData,
  pageTitle: string,
  pageSlug: string,
  pageContent: string
): { section: string; checks: SeoCheck[] }[] {
  const kw = seo.focusKeywords[0]?.toLowerCase() ?? "";
  const title = (seo.metaTitle || pageTitle).toLowerCase();
  const desc = seo.metaDescription.toLowerCase();
  const slug = pageSlug.toLowerCase();
  const content = stripHtml(pageContent).toLowerCase();
  const wordCount = countWords(content);
  const first10pct = content.slice(0, Math.floor(content.length * 0.1));

  return [
    {
      section: "Basic SEO",
      checks: [
        {
          label: "Focus Keyword used in SEO Title",
          pass: kw ? title.includes(kw) : null,
        },
        {
          label: "Focus Keyword used in Meta Description",
          pass: kw ? desc.includes(kw) : null,
        },
        {
          label: "Focus Keyword found in URL",
          pass: kw ? slug.includes(kw.replace(/\s+/g, "-")) : null,
        },
        {
          label: "Focus Keyword appears in first 10% of content",
          pass: kw ? first10pct.includes(kw) : null,
        },
        {
          label: "Focus Keyword found in content",
          pass: kw ? content.includes(kw) : null,
        },
        {
          label: `Content is ${wordCount} words (recommend ≥ 600)`,
          pass: wordCount >= 600 ? true : wordCount >= 300 ? null : false,
        },
      ],
    },
    {
      section: "Additional",
      checks: [
        {
          label: "Meta Title length is optimal (50–60 chars)",
          pass:
            (seo.metaTitle || pageTitle).length >= 50 &&
            (seo.metaTitle || pageTitle).length <= 60
              ? true
              : (seo.metaTitle || pageTitle).length > 0
              ? null
              : false,
        },
        {
          label: "Meta Description length is optimal (120–160 chars)",
          pass:
            seo.metaDescription.length >= 120 &&
            seo.metaDescription.length <= 160
              ? true
              : seo.metaDescription.length > 0
              ? null
              : false,
        },
        {
          label: "Canonical URL is set",
          pass: seo.canonicalUrl.length > 0,
        },
        {
          label: "Schema type is configured",
          pass: !!seo.schemaType,
        },
      ],
    },
    {
      section: "Title Readability",
      checks: [
        {
          label: "SEO Title has a positive sentiment word",
          pass: null,
        },
        {
          label: "SEO Title doesn't start with Focus Keyword",
          pass: kw ? !title.startsWith(kw) : null,
        },
        {
          label: "SEO Title has a number",
          pass: null,
        },
      ],
    },
    {
      section: "Content Readability",
      checks: [
        {
          label: "Content uses subheadings",
          pass: /<h[2-6]/i.test(pageContent),
        },
        {
          label: "Images found in content",
          pass: /<img/i.test(pageContent),
        },
      ],
    },
  ];
}

function scoreSeo(groups: { section: string; checks: SeoCheck[] }[]) {
  const all = groups.flatMap((g) => g.checks).filter((c) => c.pass !== null);
  if (!all.length) return 0;
  const passed = all.filter((c) => c.pass === true).length;
  return Math.round((passed / all.length) * 100);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : score >= 50
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-red-600 bg-red-50 border-red-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold border rounded-full ${color}`}
    >
      <BarChart3 className="h-3 w-3" />
      {score}/100
    </span>
  );
}

function CheckItem({ check }: { check: SeoCheck }) {
  const icon =
    check.pass === true ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
    ) : check.pass === null ? (
      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
    );

  return (
    <li className="flex items-start gap-2 py-1.5 text-sm text-foreground/80">
      {icon}
      <span>{check.label}</span>
    </li>
  );
}

function SectionAccordion({
  section,
  checks,
  defaultOpen,
}: {
  section: string;
  checks: SeoCheck[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const errors = checks.filter((c) => c.pass === false).length;
  const warnings = checks.filter((c) => c.pass === null).length;

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{section}</span>
          {errors > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
              ✕ {errors} Error{errors > 1 ? "s" : ""}
            </span>
          )}
          {warnings > 0 && errors === 0 && (
            <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">
              ⚠ {warnings}
            </span>
          )}
          {errors === 0 && warnings === 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
              ✓ Good
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-0.5">
          {checks.map((c, i) => (
            <CheckItem key={i} check={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SeoPanel({
  pageTitle = "",
  pageSlug = "",
  pageContent = "",
  siteUrl = "https://yoursite.com",
  initialData,
  onChange,
}: SeoPanelProps) {
  const [tab, setTab] = useState<"general" | "advanced" | "schema" | "social">(
    "general"
  );
  const [seo, setSeo] = useState<SeoData>({ ...DEFAULT_SEO, ...initialData });
  const [kwInput, setKwInput] = useState("");
  const [serpEdit, setSerpEdit] = useState(false);
  const kwRef = useRef<HTMLInputElement>(null);

  // Notify parent on change
  useEffect(() => {
    onChange?.(seo);
  }, [seo]);

  const update = (patch: Partial<SeoData>) =>
    setSeo((prev) => ({ ...prev, ...patch }));

  const addKeyword = (raw: string) => {
    const kw = raw.trim();
    if (!kw || seo.focusKeywords.includes(kw)) return;
    update({ focusKeywords: [...seo.focusKeywords, kw] });
    setKwInput("");
  };

  const removeKeyword = (kw: string) =>
    update({ focusKeywords: seo.focusKeywords.filter((k) => k !== kw) });

  // SERP preview values
  const serpTitle = seo.metaTitle || pageTitle || "Page Title";
  const serpSlug = pageSlug || "page-slug";
  const serpDesc =
    seo.metaDescription ||
    stripHtml(pageContent).slice(0, 160) ||
    "Page description will appear here…";
  const titleLen = serpTitle.length;
  const descLen = seo.metaDescription.length;

  const checkGroups = buildChecks(seo, pageTitle, pageSlug, pageContent);
  const score = scoreSeo(checkGroups);

  const TABS = [
    { id: "general", label: "General", icon: Globe },
    { id: "advanced", label: "Advanced", icon: Settings },
    { id: "schema", label: "Schema", icon: Code2 },
    { id: "social", label: "Social", icon: Share2 },
  ] as const;

  return (
    <div className="border border-border bg-card rounded-md overflow-hidden text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">SEO Settings</span>
          <ScoreBadge score={score} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/20">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              tab === id
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {tab === "general" && (
        <div className="divide-y divide-border">
          {/* SERP Preview */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Search Preview
              </span>
              <button
                type="button"
                onClick={() => setSerpEdit((e) => !e)}
                className="text-xs text-primary hover:underline"
              >
                {serpEdit ? "Close" : "Edit Snippet"}
              </button>
            </div>

            {/* SERP Card */}
            <div className="border border-border rounded-md p-3 bg-white dark:bg-background space-y-0.5">
              <p className="text-xs text-muted-foreground font-mono truncate">
                {siteUrl}/{serpSlug}
                <ExternalLink className="inline h-3 w-3 ml-1 opacity-50" />
              </p>
              <p className="text-blue-700 dark:text-blue-400 text-base font-medium leading-snug line-clamp-1">
                {serpTitle}
              </p>
              <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">
                {serpDesc}
              </p>
            </div>

            {/* Editable snippet fields */}
            {serpEdit && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">SEO Title</label>
                    <span
                      className={`text-xs ${
                        titleLen > 60
                          ? "text-red-500"
                          : titleLen >= 50
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {titleLen}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seo.metaTitle}
                    onChange={(e) => update({ metaTitle: e.target.value })}
                    placeholder={pageTitle || "Enter SEO title…"}
                    className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {/* Title length bar */}
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        titleLen > 60
                          ? "bg-red-500"
                          : titleLen >= 50
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${Math.min((titleLen / 60) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">Meta Description</label>
                    <span
                      className={`text-xs ${
                        descLen > 160
                          ? "text-red-500"
                          : descLen >= 120
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {descLen}/160
                    </span>
                  </div>
                  <textarea
                    value={seo.metaDescription}
                    onChange={(e) => update({ metaDescription: e.target.value })}
                    placeholder="Enter meta description…"
                    rows={3}
                    className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        descLen > 160
                          ? "bg-red-500"
                          : descLen >= 120
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Focus Keywords */}
          <div className="p-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Focus Keywords
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] border border-border rounded px-2 py-1.5 bg-background focus-within:ring-1 focus-within:ring-primary">
              {seo.focusKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                ref={kwRef}
                type="text"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addKeyword(kwInput);
                  }
                }}
                placeholder={
                  seo.focusKeywords.length === 0
                    ? "Type a keyword and press Enter…"
                    : ""
                }
                className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">Enter</kbd> or{" "}
              <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">,</kbd> to add
            </p>

            {/* Pillar Content */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={seo.isPillarContent}
                onChange={(e) => update({ isPillarContent: e.target.checked })}
                className="rounded border-border accent-primary"
              />
              <span className="text-sm">This post is Pillar Content</span>
            </label>
          </div>

          {/* SEO Checks */}
          <div>
            {checkGroups.map((g) => (
              <SectionAccordion
                key={g.section}
                section={g.section}
                checks={g.checks}
                defaultOpen={g.section === "Basic SEO"}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── ADVANCED TAB ── */}
      {tab === "advanced" && (
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Canonical URL</label>
            <input
              type="url"
              value={seo.canonicalUrl}
              onChange={(e) => update({ canonicalUrl: e.target.value })}
              placeholder={`${siteUrl}/${pageSlug}`}
              className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use the default page URL
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Robots Meta</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.robotsIndex}
                  onChange={(e) => update({ robotsIndex: e.target.checked })}
                  className="rounded border-border accent-primary"
                />
                <span className="text-sm">Index this page</span>
                <code className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {seo.robotsIndex ? "index" : "noindex"}
                </code>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.robotsFollow}
                  onChange={(e) => update({ robotsFollow: e.target.checked })}
                  className="rounded border-border accent-primary"
                />
                <span className="text-sm">Follow links on this page</span>
                <code className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {seo.robotsFollow ? "follow" : "nofollow"}
                </code>
              </label>
            </div>
            <div className="mt-1 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
              robots:{" "}
              <span className="text-foreground">
                {[
                  seo.robotsIndex ? "index" : "noindex",
                  seo.robotsFollow ? "follow" : "nofollow",
                ].join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEMA TAB ── */}
      {tab === "schema" && (
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Schema Type</label>
            <select
              value={seo.schemaType}
              onChange={(e) => update({ schemaType: e.target.value })}
              className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {SCHEMA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Helps search engines understand the content type
            </p>
          </div>

          <div className="p-3 border border-border rounded bg-muted/30 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">JSON-LD Preview</p>
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
              {JSON.stringify(
                {
                  "@context": "https://schema.org",
                  "@type": seo.schemaType,
                  name: pageTitle,
                  url: `${siteUrl}/${pageSlug}`,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* ── SOCIAL TAB ── */}
      {tab === "social" && (
        <div className="p-4 space-y-5">
          {/* Open Graph */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open Graph (Facebook / LinkedIn)
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">OG Title</label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) => update({ ogTitle: e.target.value })}
                placeholder={serpTitle}
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">OG Description</label>
              <textarea
                value={seo.ogDescription}
                onChange={(e) => update({ ogDescription: e.target.value })}
                placeholder={seo.metaDescription || "Social share description…"}
                rows={2}
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">OG Image URL</label>
              <input
                type="url"
                value={seo.ogImage}
                onChange={(e) => update({ ogImage: e.target.value })}
                placeholder="https://…/image.jpg"
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            {/* OG Preview card */}
            {(seo.ogTitle || seo.ogDescription || seo.ogImage) && (
              <div className="border border-border rounded overflow-hidden">
                {seo.ogImage && (
                  <img
                    src={seo.ogImage}
                    alt="OG preview"
                    className="w-full h-28 object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div className="p-2 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase font-mono">
                    {siteUrl}
                  </p>
                  <p className="text-sm font-semibold line-clamp-1">
                    {seo.ogTitle || serpTitle}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {seo.ogDescription || seo.metaDescription}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Twitter */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Twitter / X Card
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Twitter Title</label>
              <input
                type="text"
                value={seo.twitterTitle}
                onChange={(e) => update({ twitterTitle: e.target.value })}
                placeholder={seo.ogTitle || serpTitle}
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Twitter Description</label>
              <textarea
                value={seo.twitterDescription}
                onChange={(e) => update({ twitterDescription: e.target.value })}
                placeholder={seo.ogDescription || seo.metaDescription || "Twitter card description…"}
                rows={2}
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Twitter Image URL</label>
              <input
                type="url"
                value={seo.twitterImage}
                onChange={(e) => update({ twitterImage: e.target.value })}
                placeholder={seo.ogImage || "https://…/image.jpg"}
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}