"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MediaGrid } from "./MediaGrid";
// import { UploadZone } from "./UploadZone";
// import { MediaToolbar } from "./MediaToolbar";
// import { MediaPreview } from "./MediaPreview";
// import { DeleteConfirm } from "./DeleteConfirm";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/src/ui/button";
import { UploadZone } from "./UploadZone";
import { MediaToolbar } from "./MediaToolbar";
import { MediaPreview } from "./MediaPreview";
import { DeleteConfirm } from "./DeleteConfirm";
// import UploadZone from "./UploadZone";
// import MediaToolbar from "./MediaToolbar";
// import MediaPreview from "./MediaPreview";
// import DeleteConfirm from "./DeleteConfirm";

export interface MediaItem {
  id: number;
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export type ViewMode = "grid" | "list";

export function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

async function fetchMedia() {
    const res = await fetch(
      `/api/media?page=${page}&search=${searchQuery}`
    );

    const data = await res.json();

    setMedia(data.data.items);
  }

  useEffect(() => {
    fetchMedia();
  }, [page]);


  useEffect(() => {
    setPage(1);
    setMedia([]);
    fetchMedia();
  }, [searchQuery]);

//   useEffect(() => {
//     fetchMedia();
//   }, [page]);

  const handleUploadComplete = () => {
    setPage(1);
    fetchMedia();
  };


  const handleDelete = async () => {
    if (!deleteItem) return;
    
    try {
      const response = await fetch(`/api/media/${deleteItem.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error();
      
      toast.success("Media deleted");
      setMedia(prev => prev.filter(m => m.id !== deleteItem.id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(deleteItem.id);
        return next;
      });
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeleteItem(null);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id => 
        fetch(`/api/media/${id}`, { method: "DELETE" })
      ));
      
      toast.success(`${ids.length} items deleted`);
      setMedia(prev => prev.filter(m => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to delete some items");
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UploadZone onUploadComplete={handleUploadComplete} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MediaToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedIds.size}
          onBulkDelete={handleBulkDelete}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <MediaGrid
          items={media}
          loading={loading}
          selectedIds={selectedIds}
          onSelect={(id) => {
            setSelectedIds(prev => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
          onPreview={setPreviewItem}
          onDelete={setDeleteItem}
          viewMode={viewMode}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
      
      <MediaPreview
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDelete={(item) => {
          setPreviewItem(null);
          setDeleteItem(item);
        }}
      />
      
      <DeleteConfirm
        open={!!deleteItem}
        item={deleteItem}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}