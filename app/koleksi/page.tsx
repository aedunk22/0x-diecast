'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RefreshCw, PackageX, Search, ArrowUpDown, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  stock: number;
  status: string;
  featured: boolean;
  images: string[];
}

export default function KoleksiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState<'latest' | 'price-asc' | 'price-desc'>('latest');
  const [showSoldOut, setShowSoldOut] = useState(true);

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset ke halaman 1 setiap kali filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, sortBy, showSoldOut]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const categories = [
    'Semua',
    'Hot Wheels',
    'Premium',
    'Car Culture',
    'Loose Condition',
    'RLC & Convention',
  ];

  // 1. FILTER & SORTIR DATA
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Semua' ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(p.category.toLowerCase());

      const matchesStock = showSoldOut ? true : p.stock > 0 && p.status !== 'SOLD';

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  // 2. LOGIKA PAGINATION (SLICING 20 ITEM)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas otomatis saat pindah halaman
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* NAVBAR ATAS */}
      <Navbar searchQuery={search} setSearchQuery={setSearch} />

      {/* KONTEN UTAMA KATALOG KOLEKSI */}
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Katalog Koleksi</h1>
            <p className="text-zinc-400 text-sm mt-1">Temukan item diecast & Hot Wheels favoritmu</p>
          </div>

          {/* SEARCH BAR & KATEGORI */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Cari nama mobil atau SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TOOLBAR FILTER TAMBAHAN (SORTING & TOGGLE SOLD OUT) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
            <div className="text-xs text-zinc-400 font-medium">
              Menampilkan <span className="text-white font-bold">{filteredProducts.length}</span> unit koleksi
              {totalPages > 1 && (
                <span className="text-zinc-500 ml-1">
                  (Halaman {currentPage} dari {totalPages})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* TOGGLE SOLD OUT */}
              <button
                onClick={() => setShowSoldOut(!showSoldOut)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                  showSoldOut
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    : 'bg-red-950/40 border-red-800/60 text-red-400'
                }`}
              >
                {showSoldOut ? (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Sembunyikan Sold Out
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-red-400" /> Tampilkan Sold Out
                  </>
                )}
              </button>

              {/* DROPDOWN SORTIR HARGA */}
              <div className="relative flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 text-zinc-500 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'price-asc' | 'price-desc')}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-zinc-300 uppercase focus:outline-none focus:border-red-600 cursor-pointer appearance-none"
                >
                  <option value="latest">Terbaru</option>
                  <option value="price-asc">Harga: Terendah</option>
                  <option value="price-desc">Harga: Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <div className="p-16 text-center text-zinc-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Memuat data...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-900 rounded-3xl p-12 text-center text-zinc-500">
              <PackageX className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-zinc-300">Tidak ada produk yang cocok dengan filter kamu.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('Semua');
                  setShowSoldOut(true);
                  setSortBy('latest');
                }}
                className="mt-4 text-xs font-bold uppercase text-red-500 hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* TOMBOL NAVIGASI PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* FOOTER BAWAH */}
      <Footer />
    </div>
  );
}