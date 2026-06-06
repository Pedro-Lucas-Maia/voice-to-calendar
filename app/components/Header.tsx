export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 h-16 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center px-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-lg shadow-sm">
          V
        </div>
        <h1 className="font-semibold text-lg text-zinc-100 tracking-tight">
          Voice2Calendar
        </h1>
      </div>
    </header>
  );
}
