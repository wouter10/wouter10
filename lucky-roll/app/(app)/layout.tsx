import { BottomNav } from "@/components/ui/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
