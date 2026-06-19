"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import type { Category } from "@/types";

const ICONS = ["🎬","🍕","🎮","🍝","🏖️","🍺","🎲","❤️","📚","🎵","🏃","✈️","🛍️","🍜","🎭","🌿","🏋️","🎨","🍣","🎯"];

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add sheet
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addIcon, setAddIcon] = useState("🎲");
  const [addLoading, setAddLoading] = useState(false);

  // Edit sheet
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => { setCategories(data); setLoading(false); });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addName, icon: addIcon }),
    });
    const created: Category = await res.json();
    setCategories((prev) => [...prev, created]);
    setAddName(""); setAddIcon("🎲"); setAddOpen(false); setAddLoading(false);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat); setEditName(cat.name); setEditIcon(cat.icon);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    setEditLoading(true);
    const res = await fetch(`/api/categories/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, icon: editIcon }),
    });
    const updated: Category = await res.json();
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    setEditTarget(null); setEditLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null); setDeleteLoading(false);
  }

  return (
    <div className="px-6 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mijn lijsten</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">{categories.length} categorieën</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ Nieuw</Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-3xl bg-[var(--card)] animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-2">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <Card
                  interactive
                  padding="none"
                  className="flex items-center gap-4 px-4 py-3.5"
                  onClick={() => router.push(`/categories/${cat.id}`)}
                >
                  <span className="text-2xl shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cat.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {cat.item_count ?? 0} {cat.item_count === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(cat)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-colors"
                      aria-label="Bewerken"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      aria-label="Verwijderen"
                    >
                      🗑️
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📂</p>
          <p className="font-medium">Nog geen categorieën</p>
          <p className="text-[var(--muted)] text-sm mt-1">Maak je eerste lijst aan</p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>Categorie toevoegen</Button>
        </div>
      )}

      {/* Add Sheet */}
      <Sheet open={addOpen} onClose={() => { setAddOpen(false); setAddName(""); setAddIcon("🎲"); }} title="Nieuwe categorie">
        <form onSubmit={handleAdd} className="space-y-5 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5">Naam</label>
            <input
              autoFocus
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="bijv. Series"
              className="w-full h-11 px-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icoon</label>
            <div className="grid grid-cols-10 gap-1.5">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setAddIcon(icon)}
                  className={[
                    "h-9 w-full flex items-center justify-center rounded-xl text-lg transition-all",
                    addIcon === icon
                      ? "bg-brand-500/20 ring-2 ring-brand-500 scale-110"
                      : "bg-[var(--background)] hover:bg-[var(--card-border)]",
                  ].join(" ")}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" fullWidth size="lg" loading={addLoading} disabled={!addName.trim()}>
            Toevoegen
          </Button>
        </form>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Categorie bewerken">
        <form onSubmit={handleEdit} className="space-y-5 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5">Naam</label>
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icoon</label>
            <div className="grid grid-cols-10 gap-1.5">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setEditIcon(icon)}
                  className={[
                    "h-9 w-full flex items-center justify-center rounded-xl text-lg transition-all",
                    editIcon === icon
                      ? "bg-brand-500/20 ring-2 ring-brand-500 scale-110"
                      : "bg-[var(--background)] hover:bg-[var(--card-border)]",
                  ].join(" ")}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" fullWidth size="lg" loading={editLoading} disabled={!editName.trim()}>
            Opslaan
          </Button>
        </form>
      </Sheet>

      {/* Delete confirm Sheet */}
      <Sheet open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Categorie verwijderen">
        <div className="pt-2 space-y-4">
          <p className="text-[var(--muted)]">
            Weet je zeker dat je <strong className="text-[var(--foreground)]">{deleteTarget?.name}</strong> wilt verwijderen?
            Alle items in deze categorie worden ook verwijderd.
          </p>
          <Button variant="danger" fullWidth size="lg" loading={deleteLoading} onClick={handleDelete}>
            Ja, verwijderen
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setDeleteTarget(null)}>
            Annuleren
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
