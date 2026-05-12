"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { Page } from "../Cms";
import { pageService } from "@/src/services/PageServices";
import { PageEditor } from "./page-editor";
import { Button } from "@/src/ui/button";
import { Column, DataTable } from "@/src/ui/data-table";
import { useBulkDelete } from "@/src/hooks/use-bulkdelete";
import { toast } from "@/src/hooks/use-toast";

export function PagesSection() {
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewPage, setIsNewPage] = useState(false);
  // const [selectedPages, setSelectedPages] = useState<Page[]>([]);
  const {
    selectedItems: selectedPages,
    setSelectedItems: setSelectedPages,
    deleteSelected,
    bulkDeleteLoading,
  } = useBulkDelete({
    setItems: setPages,
    bulkDeleteFn: pageService.bulkDelete,
  });
  const handleTogglePublish = async (page: Page) => {
    try {
      setLoading(true);
      const res =
        page.status === "published"
          ? await pageService.unpublish(Number(page.id))
          : await pageService.publish(Number(page.id));
      const updated = res.data?.data ?? res.data ?? res;
      setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast({
        title:
          page.status === "published" ? "Page unpublished" : "Page published",
        description:
          page.status === "published" ? "Page unpublished" : "Page published",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      setError(null);

      let pageForValidation = finalPage;
      let createdPage: Page | null = null;

      if (isNewPage) {
        const createData = {
          title: finalPage.title,
          slug: finalPage.slug,
          html: finalPage.html,
          css: finalPage.css,
          js: finalPage.js,
          status: finalPage.status,
        };

        const createRes = await pageService.create(createData);
        createdPage = createRes.data?.data || createRes.data;
        pageForValidation = createdPage;
      }

      // ── Step 1: Validate + convert HTML → JSX ──
      const validateRes = await fetch(
        `/api/pages/${pageForValidation.id}/convert-jsx`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: pageForValidation.html || "",
            save: false, // validate only first
          }),
        },
      );

      const validateData = await validateRes.json();

      // ── Block if errors ──
      // ── Block if validation fails ──

      if (!validateData.success) {
        const errorMessages = [
          ...(validateData.data.errors || []),

          ...(validateData.data.warnings || [])
            .filter((w: any) => w.type === "critical")
            .map((w: any) => w.message),
        ];

        setError(
          `Cannot save — fix these issues first:\n\n${errorMessages.join("\n")}`,
        );

        setLoading(false);

        return;
      }
      // ── Step 2: Save page with jsxCode ──
      const pageWithJsx = {
        id: pageForValidation.id,

        title: pageForValidation.title,

        slug: pageForValidation.slug,

        html: pageForValidation.html,

        css: pageForValidation.css,

        js: pageForValidation.js,

        status: pageForValidation.status,

        seoData: pageForValidation.seoData,

        jsxCode: validateData.data.jsxCode,

        pageType: "jsx",
      };
      let savedPage!: Page;

      if (isNewPage && createdPage) {
        const updateRes = await pageService.update(
          createdPage.id as any,
          pageWithJsx,
        );
        savedPage = updateRes.data?.data || updateRes.data;
        setPages((prev) => [...prev, savedPage]);
        toast({
          title: "Page created",

          description:
            validateData.data.warnings?.length > 0
              ? `Page created with ${validateData.data.warnings.length} warning${validateData.data.warnings.length > 1 ? "s" : ""}.`
              : "Page created and JSX converted successfully.",
        });
      } else {
        const res = await pageService.update(finalPage.id as any, pageWithJsx);
        savedPage = res.data?.data || res.data;
        setPages((prev) =>
          prev.map((p) => (p.id === finalPage.id ? savedPage : p)),
        );
        toast({
          title: "Page updated",

          description:
            validateData.data.warnings?.length > 0
              ? `Page updated with ${validateData.data.warnings.length} warning${validateData.data.warnings.length > 1 ? "s" : ""}.`
              : "Page updated and JSX converted successfully.",
        });
      }

      setEditingPage({
        ...savedPage,
        message: validateData.message,

        warnings: validateData.data.warnings || [],

        errors: validateData.data.errors || [],
      } as any);
      setIsNewPage(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to save page:", err);
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
        <button
          onClick={() => {
            window.open(`/${page.slug}`, "_blank");
          }}
          className="text-xs font-mono text-primary hover:underline cursor-pointer"
        >
          /{page.slug}
        </button>
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
              page.status === "published" ? "bg-success" : "bg-muted-foreground"
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
              onClick={() => handleTogglePublish(page)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title={page.status === "published" ? "Unpublish" : "Publish"}
            >
              {page.status === "published" ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
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
      {selectedPages.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={deleteSelected}
          disabled={bulkDeleteLoading}
        >
          Delete All ({selectedPages.length})
        </Button>
      )}

      <DataTable
        data={pages}
        columns={columns}
        searchPlaceholder="Search pages..."
        enableRowSelection={true}
        searchKeys={["title", "slug"]}
        pageSize={10}
        emptyMessage="No pages found. Create your first page to get started."
        onSelectedRowsChange={setSelectedPages}
        selectedRows={selectedPages}
        toolbarActions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleNewPage}
              disabled={loading}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus size={15} />
              New Page
            </Button>
          </div>
        }
      />
    </div>
  );
}
