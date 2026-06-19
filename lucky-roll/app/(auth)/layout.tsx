export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎲</div>
          <h1 className="text-2xl font-bold tracking-tight">Lucky Roll</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Laat het lot beslissen
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
