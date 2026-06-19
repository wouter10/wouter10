"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import type { Category, Item } from "@/types";

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Add
  const [addOpen, setAddOpen] = useState(false);
  const [addText, setAddText] = useState("");
  const [addBulk, setAddBulk] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Edit
  const [editTarget, setEditTarget] = useState<Item | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/items?category_id=${id}`).then((r) => r.json()),
    ]).then(([cats, itemData]: [Category[], Item[]]) => {
      setCategory(cats.find((c) => c.id === id) ?? null);
      setItems(itemData);
      setLoading(false);
    });
  }, [id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addText.trim()) return;
    setAddLoading(true);

    if (addBulk) {
      const titles = addText.split("\n").map((t) => t.trim()).filter(Boolean);
      const results = await Promise.all(
        titles.map((title) =>
          fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: id, title }),
          }).then((r) => r.json())
        )
      );
      setItems((prev) => [...prev, ...results]);
    } else {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: id, title: addText }),
      });
      const created: Item = await res.json();
      setItems((prev) => [...prev, created]);
    }

    setAddText(""); setAddOpen(false); setAddLoading(false);
  }

  async function toggleFavorite(item: Item) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !item.favorite }),
    });
    const updated: Item = await res.json();
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, favorite: updated.favorite } : i)));
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !editTitle.trim()) return;
    setEditLoading(true);
    const res = await fetch(`/api/items/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    });
    const updated: Item = await res.json();
    setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, title: updated.title } : i)));
    setEditTarget(null); setEditLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await fetch(`/api/items/${deleteTarget.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null); setDeleteLoading(false);
  }

  const favorites = items.filter((i) => i.favorite);
  const rest = items.filter((i) => !i.favorite);

  return (
    <div className="px-6 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Terug"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {category ? `${category.icon} ${category.name}` : "…"}
          </h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">{items.length} items</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ Item</Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-[var(--card)] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Favorites section */}
          {favorites.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-widest mb-2">
                Favorieten
              </p>
              <ItemList
                items={favorites}
                onFavorite={toggleFavorite}
                onEdit={(item) => { setEditTarget(item); setEditTitle(item.title); }}
                onDelete={setDeleteTarget}
              />
            </div>
          )}

          {/* All items */}
          {rest.length > 0 && (
            <div>
              {favorites.length > 0 && (
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-widest mb-2 mt-4">
                  Alle items
                </p>
              )}
              <ItemList
                items={rest}
                onFavorite={toggleFavorite}
                onEdit={(item) => { setEditTarget(item); setEditTitle(item.title); }}
                onDelete={setDeleteTarget}
              />
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">Nog geen items</p>
              <p className="text-[var(--muted)] text-sm mt-1">Voeg iets toe om te beginnen met rollen</p>
              <Button className="mt-4" onClick={() => setAddOpen(true)}>Item toevoegen</Button>
            </div>
          )}
        </>
      )}

      {/* Add Sheet */}
      <Sheet open={addOpen} onClose={() => { setAddOpen(false); setAddText(""); setAddBulk(false); }} title="Item toevoegen">
        <form onSubmit={handleAdd} className="space-y-4 pt-2">
          <div className="flex gap-2 p-1 bg-[var(--background)] rounded-2xl border border-[var(--card-border)]">
            <button
              type="button"
              onClick={() => setAddBulk(false)}
              className={[
                "flex-1 py-2 rounded-xl text-sm font-medium transition-colors",
                !addBulk ? "bg-brand-500 text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              Één item
            </button>
            <button
              type="button"
              onClick={() => setAddBulk(true)}
              className={[
                "flex-1 py-2 rounded-xl text-sm font-medium transition-colors",
                addBulk ? "bg-brand-500 text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              Meerdere
            </button>
          </div>

          {addBulk ? (
            <textarea
              autoFocus
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              placeholder={"Inception\nThe Dark Knight\nInterstellar"}
              rows={6}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow resize-none"
            />
          ) : (
            <input
              autoFocus
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              placeholder="Naam van het item"
              className="w-full h-11 px-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          )}

          {addBulk && addText && (
            <p className="text-xs text-[var(--muted)]">
              {addText.split("\n").filter((t) => t.trim()).length} items
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={addLoading} disabled={!addText.trim()}>
            Toevoegen
          </Button>
        </form>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Item bewerken">
        <form onSubmit={handleEdit} className="space-y-4 pt-2">
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
          <Button type="submit" fullWidth size="lg" loading={editLoading} disabled={!editTitle.trim()}>
            Opslaan
          </Button>
        </form>
      </Sheet>

      {/* Delete confirm Sheet */}
      <Sheet open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Item verwijderen">
        <div className="pt-2 space-y-4">
          <p className="text-[var(--muted)]">
            Weet je zeker dat je <strong className="text-[var(--foreground)]">{deleteTarget?.title}</strong> wilt verwijderen?
          </p>
          <Button variant="danger" fullWidth size="lg" loading={deleteLoading} onClick={handleDelete}>
            Verwijderen
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setDeleteTarget(null)}>
            Annuleren
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function ItemList({
  items,
  onFavorite,
  onEdit,
  onDelete,
}: {
  items: Item[];
  onFavorite: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            layout
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--card-border)]">
              <button
                onClick={() => onFavorite(item)}
                className="shrink-0 text-xl leading-none transition-transform active:scale-125"
                aria-label={item.favorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
              >
                {item.favorite ? "⭐" : "☆"}
              </button>
              <p className="flex-1 min-w-0 font-medium truncate">{item.title}</p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-colors"
                  aria-label="Bewerken"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Verwijderen"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
