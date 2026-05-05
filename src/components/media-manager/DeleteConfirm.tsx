"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/ui/dialog";
import { Button } from "@/src/ui/button";
import { MediaItem } from "./MediaManager";

interface DeleteConfirmProps {
  open: boolean;
  item: MediaItem | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ open, item, onConfirm, onCancel }: DeleteConfirmProps) {
  if (!item) return null;
  
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle>Delete Media</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <span className="font-medium text-foreground">{item.originalName}</span>?
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}