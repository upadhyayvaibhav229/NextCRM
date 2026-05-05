"use client";

import React from "react";
import { Search, Trash2, Grid3x3, List, X } from "lucide-react";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import { Badge } from "@/src/ui/badge";
import { ViewMode } from "./MediaManager";

interface MediaToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function MediaToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onBulkDelete,
  viewMode,
  onViewModeChange,
}: MediaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            {selectedCount} selected
            <button onClick={onBulkDelete} className="ml-1 hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </button>
          </Badge>
        )}
        
        <div className="flex rounded-lg border">
          <button
            className={cn(
              "p-2 px-3 rounded-l-lg transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "p-2 px-3 rounded-r-lg transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => onViewModeChange("list")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}