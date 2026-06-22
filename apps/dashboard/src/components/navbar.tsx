'use client';

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-slate-800">Project Demo</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* User profile, theme toggle, etc. could go here */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-sm" />
      </div>
    </header>
  );
}
