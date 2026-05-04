"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Page } from "../Cms";
import { pageService } from "@/src/services/PageServices";
import { PageEditor } from "./page-editor";
import { Button } from "@/src/ui/button";
import { Column, DataTable } from "@/src/ui/data-table";

export function PagesSection() {
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewPage, setIsNewPage] = useState(false);

  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const res = await pageService.getById(id as any);
      const fullPage = res.data?.data || res.data;
      setEditingPage(fullPage);
      setIsNewPage(false);
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

  const savePage = async (pageToSave?: Page) => {
    const finalPage = pageToSave || editingPage;
    if (!finalPage) return;

    try {
      setLoading(true);
      const updatedPage = {
        ...finalPage,
      };

      let savedPage;

      if (isNewPage) {
        const res = await pageService.create(updatedPage);
        savedPage = res.data?.data || res.data;
        setPages([...pages, savedPage]);
      } else {
        const res = await pageService.update(finalPage.id as any, updatedPage);
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
      await pageService.delete(id as any);
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
    const tempPage: Page = {
      id: `temp-${Date.now()}`,
      title: "New Page",
      slug: "new-page",
      html: "",
      css: "",
      js: "",
      status: "draft",
      modified: new Date().toISOString().split("T")[0],
    };
    setEditingPage(tempPage);
    setIsNewPage(true);
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns: Column<Page>[] = [
    {
      key: "title",
      header: "Title",
      filterable: false,
      cell: (page) => (
        <span className="font-medium text-foreground">{page.title}</span>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      filterable: false,
      cell: (page) => (
        <code className="font-mono text-xs text-muted-foreground">
          /{page.slug}
        </code>
      ),
    },
    {
      key: "status",
      header: "Status",
      filterable: true,
      filterValue: (page) => page.status,
      cell: (page) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            page.status === "published"
              ? "bg-success/20 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              page.status === "published"
                ? "bg-success"
                : "bg-muted-foreground"
            }`}
          />
          {page.status === "published" ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      filterable: false,
      cell: (page) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate((page as any).createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Modified",
      filterable: false,
      cell: (page) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate((page as any).updatedAt || page.modified)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      filterable: false,
      className: "text-right",
      cell: (page) =>
        deleteConfirm === page.id ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">Delete?</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2 text-xs"
              onClick={() => deletePage(page.id)}
              disabled={loading}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => setDeleteConfirm(null)}
              disabled={loading}
            >
              No
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(page.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title="Edit page"
            >
              <Pencil size={15} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirm(page.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              title="Delete page"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        ),
    },
  ];

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
            {pages.length} page{pages.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/20 text-destructive text-sm rounded">
          {error}
        </div>
      )}

      <DataTable
        data={pages}
        columns={columns}
        searchPlaceholder="Search pages..."
        searchKeys={["title", "slug"]}
        pageSize={10}
        emptyMessage="No pages found. Create your first page to get started."
        toolbarActions={
          <Button
            onClick={handleNewPage}
            disabled={loading}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={15} />
            New Page
          </Button>
        }
      />
    </div>
  );
}
