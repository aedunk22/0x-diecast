'use client';

import Link from 'next/link';
import { Search, X, Home, Grid } from 'lucide-react';

interface NavbarProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onExploreClick?: () => void;
}

export default function Navbar({ searchQuery = '', setSearchQuery }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* LOGO BRAND (KIRI) */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group">
          <img 
            src="/logo.jpg" 
            alt="0xdiecast Logo" 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-zinc-800 group-hover:border-red-600 transition-colors"
          />
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base text-white tracking-tight leading-none">
              0xdiecast
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
              OFFICIAL STORE
            </span>
          </div>
        </Link>

        {/* SEARCH BAR (TENGAH) */}
        {setSearchQuery && (
          <div className="flex-1 max-w-xs xl:max-w-md relative hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mobil impianmu... (Civic, Supra)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* NAVIGASI BERANDA & KATALOG (POJOK KANAN) */}
        <nav className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
          >
            <Home className="w-3.5 h-3.5 text-red-500" />
            <span>Beranda</span>
          </Link>
          <Link
            href="/koleksi"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
          >
            <Grid className="w-3.5 h-3.5 text-amber-500" />
            <span>Katalog Lengkap</span>
          </Link>
        </nav>

      </div>

      {/* SEARCH BAR MOBILE (TAMPIL DI HP) */}
      {setSearchQuery && (
        <div className="px-4 pb-3 block md:hidden border-t border-zinc-900/50 pt-2 bg-zinc-950">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mobil impianmu..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}