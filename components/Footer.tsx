import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-8 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-black text-sm text-white tracking-tight">0xdiecast</h3>
          <p className="text-zinc-500 mt-1">Platform Katalog & Penjualan Koleksi Diecast Pribadi.</p>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/tentang" className="hover:text-white transition-colors font-medium">
            Tentang Toko
          </Link>
        </div>
      </div>
    </footer>
  );
}