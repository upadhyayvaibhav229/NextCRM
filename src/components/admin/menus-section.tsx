"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  X,
  Link as LinkIcon,
  FileText,
  Code,
  Loader2,
  GripVertical,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { Page } from "./Cms";
import { useMenus } from "@/src/hooks/useMenus";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: number;
  label: string;
  type: "page" | "custom";
  slug?: string | null;
  url?: string | null;
  parentId?: number | null;
  order?: number;
  children?: MenuItem[];
  
}

// ── Tree helpers ───────────────────────────────────────────────────────────────

function buildTree(items: MenuItem[]): MenuItem[] {
  const map = new Map<number, MenuItem>();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));

  const roots: MenuItem[] = [];
  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/** Flatten tree back to a list preserving depth-first order */
function flattenTree(
  nodes: MenuItem[],
  parentId: number | null = null,
  depth = 0,
): Array<MenuItem & { parentId: number | null; depth: number }> {
  const result: Array<MenuItem & { parentId: number | null; depth: number }> =
    [];
  nodes.forEach((node) => {
    result.push({ ...node, parentId, depth });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, node.id, depth + 1));
    }
  });
  return result;
}

// ── Sortable Item ──────────────────────────────────────────────────────────────

interface SortableMenuItemProps {
  item: MenuItem & { depth: number };
  isOver: boolean;
  isDragActive: boolean;
  onRemove: (id: number) => void;
}

function SortableMenuItem({
  item,
  isOver,
  isDragActive,
  onRemove,
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // hide source row; DragOverlay renders the ghost
    opacity: isDragging ? 0 : 1,
  };

  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drop-onto highlight ring */}
      {isOver && isDragActive && !isDragging && (
        <div className="absolute inset-0 border-2 border-primary/60 bg-primary/5 pointer-events-none z-10" />
      )}

      <div
        className={`flex items-center gap-2 p-3 border-b border-border transition-colors ${
          isDragging ? "" : "hover:bg-muted/30"
        }`}
        style={{ paddingLeft: `${item.depth * 28 + 12}px` }}
      >
        {/* Indent connector */}
        {item.depth > 0 && (
          <span className="text-muted-foreground/40 text-xs select-none mr-0.5">
            └
          </span>
        )}

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors touch-none flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={15} />
        </button>

        {/* Child indicator */}
        {hasChildren ? (
          <ChevronDownIcon
            size={13}
            className="text-muted-foreground flex-shrink-0"
          />
        ) : (
          <span className="w-[13px] flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <span className="font-medium text-foreground text-sm">
            {item.label}
          </span>
          <span className="ml-2 text-xs font-mono text-muted-foreground truncate">
            {item.type === "page" ? `/${item.slug || ""}` : item.url}
          </span>
        </div>

        <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground flex-shrink-0">
          {item.type}
        </span>

        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/** Ghost card shown under the pointer while dragging */
function DragGhost({ item }: { item: MenuItem & { depth: number } }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-primary shadow-xl opacity-95 rounded-sm">
      <GripVertical size={15} className="text-primary flex-shrink-0" />
      <span className="font-medium text-foreground text-sm">{item.label}</span>
      <span className="ml-1 text-xs font-mono text-muted-foreground">
        {item.type === "page" ? `/${item.slug || ""}` : item.url}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface MenusSectionProps {
  pages: Page[];
}

export function MenusSection({ pages }: MenusSectionProps) {
  const {
    menus,
    loading,
    error,
    createMenu,
    updateMenu,
    deleteMenu,
    addMenuItem,
    deleteMenuItem,
    reorderMenuItems,
  } = useMenus();

  // ── UI state ───────────────────────────────────────────
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemType, setNewItemType] = useState<"page" | "custom">("page");
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemPageSlug, setNewItemPageSlug] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [editingMenuName, setEditingMenuName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ── Create menu form state ─────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuLocation, setNewMenuLocation] = useState<"header" | "footer">(
    "header",
  );

  // ── DnD state ─────────────────────────────────────────
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const dragStartX = useRef<number>(0);
  const dragCurrentX = useRef<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // ── Derived ────────────────────────────────────────────
  const selectedMenu =
    menus.find((m) => m.id === selectedMenuId) ?? menus[0] ?? null;

  const flatItems = selectedMenu
    ? flattenTree(buildTree(selectedMenu.items))
    : [];

  const activeItem = flatItems.find((i) => i.id === activeId) ?? null;

  // ── DnD handlers ──────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
    const e = event.activatorEvent as PointerEvent;
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? (event.over.id as number) : null);
    // dnd-kit doesn't expose live pointer in DragOverEvent; track via window
  };

  // Track live pointer X globally during drag
  const handlePointerMove = (e: PointerEvent) => {
    dragCurrentX.current = e.clientX;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!selectedMenu || !over || active.id === over.id) return;

    const draggedId = active.id as number;
    const targetId = over.id as number;

    const draggedIdx = flatItems.findIndex((i) => i.id === draggedId);
    const targetIdx = flatItems.findIndex((i) => i.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const dragged = flatItems[draggedIdx];
    const target = flatItems[targetIdx];

    const deltaX = dragCurrentX.current - dragStartX.current;

    /** Prevent nesting dragged under one of its own descendants */
    const isDescendantOf = (
      ancestorId: number,
      candidateId: number,
    ): boolean => {
      const candidate = flatItems.find((i) => i.id === candidateId);
      if (!candidate || candidate.parentId == null) return false;
      if (candidate.parentId === ancestorId) return true;
      return isDescendantOf(ancestorId, candidate.parentId);
    };

    const nestIntent = deltaX > 30;
    const unNestIntent = deltaX < -30 && dragged.parentId != null;
    const canNest =
      nestIntent &&
      target.id !== dragged.parentId &&
      !isDescendantOf(draggedId, targetId);

    // Build updated flat items list
    let updatedItems = [...selectedMenu.items];

    if (canNest) {
      const withoutDragged = updatedItems.filter(
        (item) => item.id !== draggedId,
      );

      const targetIndex = withoutDragged.findIndex(
        (item) => item.id === target.id,
      );

      const draggedUpdated = {
        ...dragged,
        parentId: target.id,
      };

      withoutDragged.splice(targetIndex + 1, 0, draggedUpdated);

      updatedItems = withoutDragged;
    } else {
      // ── REORDER (and optionally un-nest) ──────────────
      const fromIdx = updatedItems.findIndex((i) => i.id === draggedId);
      const toIdx = updatedItems.findIndex((i) => i.id === targetId);
      updatedItems = arrayMove(updatedItems, fromIdx, toIdx);

      if (unNestIntent) {
        updatedItems = updatedItems.map((item) =>
          item.id === draggedId ? { ...item, parentId: null } : item,
        );
      }
    }

    try {
      await reorderMenuItems(
        selectedMenu.id,
        updatedItems.map((item, i) => ({
          id: item.id,
          order: i,
          parentId: item.parentId ?? null,
        })),
      );
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // ── Menu CRUD handlers ────────────────────────────────

  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) {
      setActionError("Menu name is required");
      return;
    }
    try {
      setSaving(true);
      setActionError(null);
      const menu = await createMenu({
        name: newMenuName.trim(),
        location: newMenuLocation,
      });
      setSelectedMenuId(menu.id);
      setShowCreateForm(false);
      setNewMenuName("");
      setNewMenuLocation("header");
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMenu = async (updates: object) => {
    if (!selectedMenu) return;
    try {
      setSaving(true);
      setActionError(null);
      await updateMenu(selectedMenu.id, updates);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    try {
      await deleteMenu(id);
      setSelectedMenuId(null);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleAddItem = async () => {
    if (!selectedMenu) return;
    try {
      setSaving(true);
      setActionError(null);
      await addMenuItem(selectedMenu.id, {
        label:
          newItemLabel ||
          (newItemType === "page"
            ? pages.find((p) => p.slug === newItemPageSlug)?.title || "Item"
            : "Link"),
        type: newItemType,
        slug: newItemType === "page" ? newItemPageSlug : null,
        url: newItemType === "custom" ? newItemUrl : null,
      });
      setAddingItem(false);
      setNewItemLabel("");
      setNewItemPageSlug("");
      setNewItemUrl("");
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedMenu) return;
    try {
      await deleteMenuItem(selectedMenu.id, itemId);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const generateNextJsCode = () => {
    if (!selectedMenu) return "";
    const itemsCode = selectedMenu.items
      .map((item) => {
        const href = item.type === "page" ? `/${item.slug || ""}` : item.url;
        return `    { label: "${item.label}", href: "${href}" },`;
      })
      .join("\n");
    const varName = selectedMenu.name.replace(/\s+/g, "");
    return `// layout.tsx - ${selectedMenu.location === "header" ? "Header" : "Footer"} Navigation
const ${varName}Items = [
${itemsCode}
];

<nav className="${selectedMenu.location === "header" ? "header-nav" : "footer-nav"}">
  {${varName}Items.map((item) => (
    <Link key={item.href} href={item.href}>{item.label}</Link>
  ))}
</nav>`;
  };

  // ── Render ────────────────────────────────────────────

  if (loading)
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading menus...
      </div>
    );

  if (error)
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        {error}
      </div>
    );

  return (
    <>
      {actionError && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-center justify-between">
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-2">
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex h-full">
        {/* ── Sidebar ─────────────────────────────────────── */}
        <div className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans font-bold text-foreground">Menus</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="p-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              app/admin/menus/page.tsx
            </p>
          </div>

          {showCreateForm && (
            <div className="p-3 border-b border-border bg-muted/20">
              <input
                type="text"
                placeholder="Menu name"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateMenu()}
                className="w-full p-2 mb-2 text-sm bg-input text-foreground border border-border outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex gap-1 mb-3">
                {(["header", "footer"] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setNewMenuLocation(loc)}
                    className={`flex-1 py-1.5 text-xs font-medium transition-all ${
                      newMenuLocation === loc
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {loc === "header" ? "Header" : "Footer"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateMenu}
                  disabled={saving}
                  className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {saving && <Loader2 size={10} className="animate-spin" />}
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewMenuName("");
                    setNewMenuLocation("header");
                  }}
                  className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="p-2 flex-1 overflow-auto">
            {menus.length === 0 && !showCreateForm ? (
              <p className="p-3 text-xs text-muted-foreground text-center">
                No menus yet. Click + to create one.
              </p>
            ) : (
              menus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedMenuId(menu.id)}
                  className={`w-full text-left px-3 py-2 mb-1 transition-all ${
                    selectedMenu?.id === menu.id
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="text-sm font-medium">{menu.name}</span>
                  <span className="block text-xs font-mono text-muted-foreground/60">
                    {menu.location}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Main Editor ───────────────────────────────────── */}
        {selectedMenu ? (
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-3xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                {editingMenuName ? (
                  <input
                    type="text"
                    value={selectedMenu.name}
                    onChange={(e) => handleUpdateMenu({ name: e.target.value })}
                    onBlur={() => setEditingMenuName(false)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setEditingMenuName(false)
                    }
                    className="bg-transparent text-2xl font-bold text-foreground border-b border-primary outline-none"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setEditingMenuName(true)}
                    className="font-sans text-2xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    {selectedMenu.name}
                  </h1>
                )}
                <button
                  onClick={() => handleDeleteMenu(selectedMenu.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Location */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Assign to Location
                </label>
                <div className="flex gap-2">
                  {(["header", "footer"] as const).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleUpdateMenu({ location: loc })}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        selectedMenu.location === loc
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {loc === "header" ? "Header Nav" : "Footer Nav"}
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Hint */}
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <ChevronRight size={12} className="text-primary" />
                Drag <strong>right</strong> over an item to nest it as a submenu
                · Drag <strong>left</strong> to un-nest
              </p>

              {/* Menu Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Menu Items
                  </label>
                  <button
                    onClick={() => setAddingItem(true)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div className="bg-card border border-border">
                  {flatItems.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No items yet. Add your first menu item.
                    </p>
                  ) : (
                    // Attach global pointermove so we can track X during drag
                    <div
                      onPointerMove={(e) => {
                        dragCurrentX.current = e.clientX;
                      }}
                    >
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={flatItems.map((i) => i.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {flatItems.map((item) => (
                            <SortableMenuItem
                              key={item.id}
                              item={item}
                              isOver={overId === item.id}
                              isDragActive={activeId !== null}
                              onRemove={handleRemoveItem}
                            />
                          ))}
                        </SortableContext>

                        <DragOverlay>
                          {activeItem ? <DragGhost item={activeItem} /> : null}
                        </DragOverlay>
                      </DndContext>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Item Form */}
              {addingItem && (
                <div className="mb-6 p-4 bg-card border border-border">
                  <h3 className="font-medium text-foreground mb-4">
                    Add Menu Item
                  </h3>
                  <div className="flex gap-2 mb-4">
                    {(["page", "custom"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewItemType(type)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-all ${
                          newItemType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {type === "page" ? (
                          <FileText size={14} />
                        ) : (
                          <LinkIcon size={14} />
                        )}
                        {type === "page" ? "Page" : "Custom Link"}
                      </button>
                    ))}
                  </div>

                  {newItemType === "page" ? (
                    <select
                      value={newItemPageSlug}
                      onChange={(e) => setNewItemPageSlug(e.target.value)}
                      className="w-full p-2 mb-3 bg-input text-foreground border border-border outline-none focus:border-primary"
                    >
                      <option value="">Select a page...</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.slug}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Label"
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        className="w-full p-2 mb-3 bg-input text-foreground border border-border outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="URL (e.g., /page or https://...)"
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                        className="w-full p-2 mb-3 bg-input text-foreground border border-border outline-none focus:border-primary"
                      />
                    </>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddItem}
                      disabled={saving}
                      className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 size={12} className="animate-spin" />}
                      Add
                    </button>
                    <button
                      onClick={() => setAddingItem(false)}
                      className="px-4 py-1.5 bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Code Preview */}
              {/* {selectedMenu.location !== "none" &&
                selectedMenu.items.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code size={16} className="text-primary" />
                      <label className="text-sm font-medium text-muted-foreground">
                        Next.js Component Preview
                      </label>
                    </div>
                    <pre className="p-4 bg-code-bg border border-border overflow-x-auto">
                      <code className="font-mono text-sm text-foreground">
                        {generateNextJsCode()}
                      </code>
                    </pre>
                  </div>
                )} */}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or create a menu
          </div>
        )}
      </div>
    </>
  );
}
