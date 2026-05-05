"use client";

import React, { useState } from "react";
import Image from "next/image";
import { File, Check, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/src/ui/button";
import { cn } from "@/src/lib/utils";
import { ViewMode, MediaItem } from "./MediaManager";

interface MediaCardProps {
  item: MediaItem;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onPreview: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  viewMode: ViewMode;
}

export function MediaCard({
  item,
  isSelected,
  onSelect,
  onPreview,
  onDelete,
  viewMode,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const isImage = item.mimeType?.startsWith("image/");
  
  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={() => onSelect(item.id)}
      >
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
          {isImage && !imageError ? (
            <Image
              src={item.url}
              alt={item.originalName}
              width={48}
              height={48}
              className="object-cover rounded"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <File className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{item.originalName}</p>
          <p className="text-xs text-muted-foreground">
            {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
            {formatFileSize(item.size)}
          </p>
        </div>
        
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onPreview(item)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => onSelect(item.id)}
    >
      <div className="absolute top-2 left-2 z-10">
        <div
          className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
            isSelected
              ? "bg-primary border-primary"
              : "bg-background/80 border-muted-foreground/50 backdrop-blur-sm"
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>
      
      <div className="aspect-square bg-muted/30 relative overflow-hidden">
        {isImage && !imageError ? (
          <Image
            src={item.url}
            alt={item.originalName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <File className="w-12 h-12" />
            <span className="text-xs px-2 truncate">
              {item.mimeType?.split("/")[1]?.toUpperCase() || "FILE"}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(item);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-2">
        <p className="text-xs font-medium truncate">{item.originalName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(item.size)}
        </p>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}