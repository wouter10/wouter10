import { BottomNav } from "@/components/ui/BottomNav";

export default function HomePage() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-3xl font-bold mb-2">Lucky Roll</h1>
          <p className="text-[var(--muted)]">Roll screen komt in Stap 5</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
