'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Flame, ShieldCheck, Clock, Layers } from 'lucide-react';

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('GARASI_UTAMA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // AUTO-SCROLL OTOMATIS SAAT USER NGETIK DI SEARCH BAR
  useEffect(() => {
    if (searchQuery.trim() !== '' && catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery]);

  const handleExploreClick = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
      
      // HERO MELAYANG: Hanya ambil produk featured yang STOKNYA MASIH ADA (> 0)
      const featuredReady = data.filter((p: Product) => p.featured === true && p.stock > 0);
      setHeroProducts(featuredReady.slice(0, 2));
    }
    setLoading(false);
  };

  const categories = [
    'Hot Wheels',
    'Premium',
    'Car Culture',
    'Loose Condition',
    'RLC & Convention',
  ];

  // LOGIKA FILTER: BERANDA KHUSUS MENAMPILKAN PRODUK READY STOCK (stock > 0)
  const filteredProducts = products.filter((product) => {
    // Abaikan produk yang sudah Sold Out (stok 0) dari etalase Beranda
    if (product.stock <= 0) return false;

    const query = searchQuery.toLowerCase().trim();
    
    if (query !== '') {
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    }

    if (selectedCategory === 'GARASI_UTAMA') {
      return true;
    }

    return (
      product.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(product.category.toLowerCase())
    );
  });

  // HILANGKAN PRODUK YANG SUDAH TAMPIL DI HERO MELAYANG (AMBIL MAKSIMAL 4 READY STOCK)
  const mainGarasiProducts = filteredProducts
    .filter((p) => !heroProducts.some((hp) => hp.id === p.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* NAVBAR ATAS */}
        <Navbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onExploreClick={handleExploreClick} 
        />

        {/* HERO SECTION */}
        <section className="relative pt-8 pb-16 md:py-24 overflow-hidden border-b border-zinc-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* KOLOM KIRI TEKS */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 px-3.5 py-1.5 rounded-full text-xs text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Garasi koleksi diecast & Hot Wheels rare
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1]">
                  Buru diecast impianmu, <br />
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    checkout tanpa ribet
                  </span>
                </h1>

                <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
                  Katalog pribadi terlengkap: Mainline, Car Culture, Boulevard, hingga RLC. Pilih unitnya, cek detail fotonya, dan langsung transaksi via WhatsApp.
                </p>

                {/* TRUST BAR */}
                <div className="pt-2 pb-4 grid grid-cols-3 gap-4 border-y border-zinc-900 max-w-lg">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white block">100+</span>
                    <span className="text-[10px] sm:text-xs text-zinc-500 uppercase font-medium block mt-0.5">Ready Stock</span>
                  </div>
                  <div className="border-l border-zinc-900 pl-4">
                    <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1">
                      100% <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500 uppercase font-medium block mt-0.5">Item Original</span>
                  </div>
                  <div className="border-l border-zinc-900 pl-4">
                    <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1">
                      &lt;15m <Clock className="w-4 h-4 text-amber-400 inline" />
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500 uppercase font-medium block mt-0.5">Respon WA</span>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: KARTU MELAYANG */}
              <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end mt-6 lg:mt-0 min-h-[250px] lg:min-h-[320px]">
                {heroProducts.length > 0 ? (
                  <div className="relative w-full max-w-md space-y-4 lg:space-y-0 lg:h-[320px] flex flex-col justify-between">
                    <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-3xl blur-2xl opacity-40 -z-10" />

                    {heroProducts[0] && (
                      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md transform -rotate-3 hover:rotate-0 transition-all duration-300 flex items-center gap-4 lg:absolute lg:top-0 lg:-left-6 lg:w-80 z-10">
                        <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0 relative">
                          {heroProducts[0]?.images?.[0] ? (
                            <img src={heroProducts[0].images[0]} alt={heroProducts[0].name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[9px] font-bold font-mono">0xdiecast</div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <span className="text-[9px] font-black uppercase text-red-500 tracking-wider block truncate">
                            {heroProducts[0]?.category || 'HOT WHEELS'}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{heroProducts[0]?.name}</h4>
                          <p className="text-xs font-black text-emerald-400 mt-1">
                            Rp {heroProducts[0]?.price ? heroProducts[0].price.toLocaleString('id-ID') : '0'}
                          </p>
                          <span className="inline-block mt-1 bg-emerald-950 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded">
                            Ready Stock
                          </span>
                        </div>
                      </div>
                    )}

                    {heroProducts[1] && (
                      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md transform rotate-3 hover:rotate-0 transition-all duration-300 flex items-center gap-4 lg:absolute lg:bottom-0 lg:-right-4 lg:w-80">
                        <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0 relative">
                          {heroProducts[1]?.images?.[0] ? (
                            <img src={heroProducts[1].images[0]} alt={heroProducts[1].name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[9px] font-bold font-mono">0xdiecast</div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider block truncate">
                            {heroProducts[1]?.category || 'PREMIUM'}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{heroProducts[1]?.name}</h4>
                          <p className="text-xs font-black text-emerald-400 mt-1">
                            Rp {heroProducts[1]?.price ? heroProducts[1].price.toLocaleString('id-ID') : '0'}
                          </p>
                          <span className="inline-block mt-1 bg-emerald-950 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded">
                            Ready Stock
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-zinc-500 text-xs font-semibold">
                    Centang "Featured Item" pada produk yang Ready Stock di Admin.
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* SECTION KATEGORI POPULER */}
        <section id="katalog" ref={catalogRef} className="py-8 bg-zinc-950/80 border-b border-zinc-900 scroll-mt-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Kategori Populer</h3>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedCategory('GARASI_UTAMA');
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'GARASI_UTAMA' && !searchQuery
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                Garasi Utama
              </button>

              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat && !searchQuery
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION KATALOG PRODUK */}
        <section className="py-10 sm:py-14 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-red-500 tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-red-500" /> 
                {searchQuery ? 'Pencarian Katalog' : 'Pilihan Terbaik'}
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight mt-1 text-white">
                {searchQuery ? (
                  <span>
                    Hasil pencarian untuk <span className="text-red-500 font-black">"{searchQuery}"</span>
                  </span>
                ) : selectedCategory === 'GARASI_UTAMA' ? (
                  'Garasi Utama'
                ) : (
                  `Koleksi ${selectedCategory}`
                )}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-zinc-600 text-sm font-bold animate-pulse">
              Memuat koleksi terbaru 0xdiecast...
            </div>
          ) : mainGarasiProducts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 border border-zinc-900 rounded-3xl p-8">
              <p className="text-zinc-500 text-sm font-bold">
                {searchQuery ? `Tidak ada produk ready stock yang cocok dengan kata kunci "${searchQuery}"` : 'Belum ada unit ready stock untuk kategori ini.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('GARASI_UTAMA');
                  setSearchQuery('');
                }}
                className="mt-4 text-xs font-bold uppercase text-red-500 hover:underline cursor-pointer"
              >
                Reset Pencarian & Kategori
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {mainGarasiProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}