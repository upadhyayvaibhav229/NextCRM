"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Page } from "./Cms";
import { pageService } from "@/src/services/PageServices";
import { PageEditor } from "./page-editor";

export function PagesSection() {
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);

      const res = await pageService.getById(id);

      // normalize response (important)
      const fullPage = res.data?.data || res.data;

      setEditingPage(fullPage);
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
      // Ensure pages have unique IDs
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

  const createNewPage = async () => {
    try {
      const newPage = await pageService.create({
        title: "New Page",
        slug: "new-page",
        html: "",
        css: "",
        js: "",
        status: "draft",
      });
      return newPage;
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to create page:", error);
      return null;
    }
  };

  const savePage = async () => {
    if (!editingPage) return;

    try {
      setLoading(true);
      const existingIndex = pages.findIndex((p) => p.id === editingPage.id);
      const updatedPage = {
        ...editingPage,
        // modified: new Date().toISOString().split("T")[0],
      };

      console.log("editingPage.id", editingPage.id);
      console.log("pages", pages);
      let savedPage;
      if (existingIndex >= 0) {
        // Update existing page
        const res = await pageService.update(editingPage.id, updatedPage);

        // ✅ extract actual page
        const pageData = res.data;

        const newPages = [...pages];
        newPages[existingIndex] = pageData;

        setPages(newPages);
      } else {
        // Create new page (though createNewPage should have already done this)
        const res = await pageService.create(updatedPage);

        // ✅ extract actual page object
        const pageData = res.data;

        setPages([...pages, pageData]);
      }

      setEditingPage(null);
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

  const handleNewPage = async () => {
    const newPage = await createNewPage();
    if (newPage) {
      setEditingPage(newPage);
    }
  };

  if (editingPage) {
    return (
      <PageEditor
        page={editingPage}
        pages={pages}
        onChange={setEditingPage}
        onSave={savePage}
        onCancel={() => setEditingPage(null)}
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
              {["Title", "Slug", "Status", "Modified", "Actions"].map((h) => (
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
                      {page.modified}
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
