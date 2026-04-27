"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Page } from "../Cms";
import { pageService } from "@/src/services/PageServices";
import { PageEditor } from "./page-editor";

export function PagesSection() {
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewPage, setIsNewPage] = useState(false); // ← Add this state

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const res = await pageService.getById(id);
      const fullPage = res.data?.data || res.data;
      setEditingPage(fullPage);
      setIsNewPage(false); // ← Mark as existing page
    } catch (error) {
      console.error("Failed to fetch page:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await pageService.getAll();
      setPages(res.data);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      console.error(error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // REMOVE this entire function - no more createNewPage()
  // const createNewPage = async () => { ... }

  const savePage = async (pageToSave?: Page) => {
    const finalPage = pageToSave || editingPage;
    if (!finalPage) return;

    try {
      setLoading(true);
      const updatedPage = {
        ...finalPage,
        // modified: new Date().toISOString().split("T")[0],
      };

      let savedPage;

      if (isNewPage) {
        // This is a NEW page - CREATE it in backend
        const res = await pageService.create(updatedPage);
        savedPage = res.data?.data || res.data;
        setPages([...pages, savedPage]);
      } else {
        // This is an EXISTING page - UPDATE it
        const res = await pageService.update(finalPage.id, updatedPage);
        savedPage = res.data?.data || res.data;
        const existingIndex = pages.findIndex((p) => p.id === finalPage.id);
        if (existingIndex >= 0) {
          const newPages = [...pages];
          newPages[existingIndex] = savedPage;
          setPages(newPages);
        }
      }

      setEditingPage(null);
      setIsNewPage(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to save page:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (id: string) => {
    try {
      setLoading(true);
      await pageService.delete(id);
      setPages(pages.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to delete page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPage = () => {
    // Create temporary page object - NO API CALL!
    const tempPage: Page = {
      id: `temp-${Date.now()}`, // Temporary ID
      title: "New Page",
      slug: "new-page",
      html: "",
      css: "",
      js: "",
      status: "draft",
      modified: new Date().toISOString().split("T")[0],
    };
    setEditingPage(tempPage);
    setIsNewPage(true); // ← Mark as new page
  };

  if (editingPage) {
    return (
      <PageEditor
        page={editingPage}
        pages={pages}
        onChange={setEditingPage}
        onSave={savePage}
        onCancel={() => {
          setEditingPage(null);
          setIsNewPage(false);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground mb-1">
            Pages
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            app/admin/pages/page.tsx
          </p>
        </div>
        <button
          onClick={handleNewPage}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus size={16} />
          New Page
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/20 text-destructive text-sm rounded">
          {error}
        </div>
      )}

      <div className="bg-card border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                "Title",
                "Slug",
                "Status",
                "Created at",
                "Updated at",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className={`p-4 text-sm font-medium text-muted-foreground ${
                    h === "Actions" ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No pages found. Create your first page to get started.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground">
                    {page.title}
                  </td>
                  <td className="p-4">
                    <code className="font-mono text-sm text-muted-foreground">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                        page.status === "published"
                          ? "bg-success/20 text-success glow-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-muted-foreground">
                      {page.createdAt}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-muted-foreground">
                      {page.updatedAt}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {deleteConfirm === page.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">
                          Delete?
                        </span>
                        <button
                          onClick={() => deletePage(page.id)}
                          disabled={loading}
                          className="px-2 py-1 text-xs bg-destructive text-destructive-foreground disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={loading}
                          className="px-2 py-1 text-xs bg-muted text-muted-foreground disabled:opacity-50"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(page.id)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(page.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
