// Add this to your Cms.tsx alongside the Page type

export interface Post {
  id: any;
  title: string;
  slug: string;
  content: string;
  status: string;           // "DRAFT" | "PUBLISHED"
  excerpt?: string;
  format?: string;          // "standard" | "aside" | "audio" etc
  featuredImage?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: string[];   // used by editor
  tagIds?: string[];        // used by editor
  categories?: { id: string; name: string }[];  // returned by API
  tags?: { id: string; name: string }[];        // returned by API
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}