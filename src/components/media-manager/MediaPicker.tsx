"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/ui/dialog";

interface MediaItem {
  id: string;
  mimeType: string;
  url: string;
  originalName: string;
}
export function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}) {
  const [media, setMedia] = useState([]);

  async function fetchMedia() {
    const res = await fetch("/api/media");
    const data = await res.json();

    setMedia(data.data.items);
  }

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-h-[70vh] overflow-y-auto">
          {media.map((item: MediaItem) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              className="border rounded-lg overflow-hidden hover:ring-2 hover:ring-primary"
            >
              {item.mimeType.startsWith("image/") ? (
                <img
                  src={item.url}
                  alt={item.originalName}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="h-32 flex items-center justify-center bg-muted">
                  FILE
                </div>
              )}

              <div className="p-2 text-xs truncate">{item.originalName}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
