"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Post } from "./Post.type";
import { postService } from "@/src/services/PostServices";
import { Column, DataTable } from "@/src/ui/data-table";
import { Button } from "@/src/ui/button";
import { PostEditor } from "./PostEditor";
// import { Post } from "../Cms";
// import { postService } from "@/src/services/PostServices";
// import { PostEditor } from "./post-editor/PostEditor";
// import { DataTable, Column } from "@/components/ui/data-table";
// import { Button } from "@/components/ui/button";

export function PostsSection() {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await postService.getAll();
      setPosts(res.data ?? res);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ─── Handlers ───────────────────────────────────────────

  const handleNew = () => {
    const tempPost: Post = {
      id: `temp-${Date.now()}`,
      title: "Untitled Post",
      slug: "untitled-post",
      content: "",
      status: "DRAFT",
      excerpt: "",
      format: "standard",
      categoryIds: [],
      tagIds: [],
      featuredImage: null,

      seoData: {
        metaTitle: "",
        metaDescription: "",
      },

      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPost(tempPost);
    setIsNewPost(true);
  };

  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const res = await postService.getById(id);
      const full = res.data?.data ?? res.data ?? res;
      // Map relation arrays to ID arrays for the editor
      setEditingPost({
        ...full,
        categoryIds: full.categories?.map((c: any) => c.id) ?? [],
        tagIds: full.tags?.map((t: any) => t.id) ?? [],
      });
      setIsNewPost(false);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPost) return;
    try {
      setLoading(true);

      // Strip temp id and frontend-only fields before sending
      const { categoryIds, tagIds, categories, tags, ...rest } =
        editingPost as any;
      const payload = {
        ...rest,
        categoryIds: categoryIds ?? [],
        tagIds: tagIds ?? [],
      };

      let saved: any;
      if (isNewPost) {
        // Remove the temp id — backend will generate real one
        const { id, ...createPayload } = payload;
        const res = await postService.create(createPayload);
        saved = res.data?.data ?? res.data ?? res;
        setPosts((prev) => [saved, ...prev]);
      } else {
        const res = await postService.update(editingPost.id, payload);
        saved = res.data?.data ?? res.data ?? res;
        setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      }

      setEditingPost(null);
      setIsNewPost(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await postService.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      setLoading(true);
      const res =
        post.status === "PUBLISHED"
          ? await postService.unpublish(post.id)
          : await postService.publish(post.id);
      const updated = res.data?.data ?? res.data ?? res;
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Columns ─────────────────────────────────────────────

  const columns: Column<Post>[] = [
    {
      key: "title",
      header: "Title",
      // sortable: true,
      filterable: false,
      cell: (row) => (
        <span className="font-medium text-foreground">{row.title}</span>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      filterable: false,
      cell: (row) => (
        <button
          onClick={() => {
            window.open(`/posts/${row.slug}`, "_blank");
          }}
          className="font-mono text-xs text-primary hover:underline cursor-pointer"
        >
          /posts/{row.slug}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      // sortable: true,
      filterable: true,
      filterValue: (row) => row.status,
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === "PUBLISHED"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.status === "PUBLISHED" ? "bg-primary" : "bg-muted-foreground"
            }`}
          />
          {row.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "categories",
      header: "Categories",
      // sortable: false,
      filterable: false,
      cell: (row) => {
        const cats = (row as any).categories ?? [];
        return cats.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {cats.map((c: any) => (
              <span
                key={c.id}
                className="px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded"
              >
                {c.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "publishedAt",
      header: "Published",
      // sortable: true,
      filterable: false,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.publishedAt
            ? new Date(row.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Modified",
      // sortable: true,
      filterable: false,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      // sortable: false,
      filterable: false,
      className: "text-right",
      cell: (row) =>
        deleteConfirm === row.id ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">Delete?</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2 text-xs"
              onClick={() => handleDelete(row.id)}
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
            <button
              onClick={() => handleTogglePublish(row)}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title={row.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            >
              {row.status === "PUBLISHED" ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
            </button>
            <button
              onClick={() => handleEdit(row.id)}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setDeleteConfirm(row.id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
    },
  ];

  // ─── Render editor ───────────────────────────────────────

  if (editingPost) {
    return (
      <PostEditor
        post={editingPost}
        onChange={setEditingPost}
        onSave={handleSave}
        onCancel={() => {
          setEditingPost(null);
          setIsNewPost(false);
        }}
      />
    );
  }

  // ─── Render list ─────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Posts</h1>
          <p className="text-sm font-mono text-muted-foreground">
            {posts.length} post{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <DataTable
        data={posts}
        columns={columns}
        searchPlaceholder="Search posts..."
        searchKeys={["title", "slug"] as any}
        pageSize={10}
        emptyMessage="No posts yet. Create your first post to get started."
        toolbarActions={
          <Button
            onClick={handleNew}
            disabled={loading}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={15} />
            New Post
          </Button>
        }
      />
    </div>
  );
}
