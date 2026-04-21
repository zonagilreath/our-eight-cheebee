import { Link, Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="flex flex-col h-full bg-8cb-gray">
      {/* Header */}
      <header className="bg-8cb-red px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl font-bold tracking-tight">8-C-B</span>
          <span className="text-white/80 text-sm">Shared List</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/search"
            className="text-white p-1"
            aria-label="Search products"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
