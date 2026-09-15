'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MessageCircle, ChevronLeft, ChevronRight, PackageX, Image as ImageIcon } from 'lucide-react';

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

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      setProduct(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="text-zinc-500 font-bold animate-pulse text-sm">Memuat detail produk...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <PackageX className="w-16 h-16 text-zinc-700 mb-4" />
        <h1 className="text-2xl font-black uppercase">Produk Tidak Ditemukan</h1>
        <p className="text-zinc-500 text-sm mt-1 mb-6">Item yang kamu cari mungkin sudah dihapus atau slug tidak sesuai.</p>
        <Link
          href="/koleksi"
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6287821093233';
  const waNumber = rawNumber.replace(/[^0-9]/g, '').replace(/^0/, '62');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const waMessage = encodeURIComponent(
    `Halo 0xdiecast, saya tertarik untuk membeli produk berikut:\n\n*Nama Produk:* ${product.name}\n*Kode SKU:* ${product.sku}\n*Harga:* Rp ${product.price.toLocaleString('id-ID')}\n*Kategori:* ${product.category}\n\nApakah produk ini masih tersedia dan bisa dikirim? Terima kasih!`
  );

  const images = product.images && product.images.length > 0 ? product.images : [];
  const isSoldOut = product.stock <= 0 || product.status === 'SOLD';

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 lg:p-12 selection:bg-red-600 selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Tombol Kembali */}
        <Link
          href="/koleksi"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10">
          
          {/* GALERI FOTO PRODUK (LEFT COLUMN) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Display Foto Utama */}
            <div className="relative aspect-square w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 group">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={`${product.name} - Foto ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-40" />
                  <span className="text-xs font-bold uppercase tracking-wider">Tanpa Foto</span>
                </div>
              )}

              {/* Badge Sold Out jika Stok Habis */}
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <span className="bg-red-600 text-white font-black text-sm uppercase tracking-widest px-5 py-2 rounded-2xl shadow-2xl border border-red-500">
                    SOLD OUT / TERJUAL
                  </span>
                </div>
              )}

              {/* Tombol Panah Prev / Next (Jika foto lebih dari 1) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-xl border border-white/10 backdrop-blur-md transition-all opacity-80 hover:opacity-100 cursor-pointer"
                    title="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-xl border border-white/10 backdrop-blur-md transition-all opacity-80 hover:opacity-100 cursor-pointer"
                    title="Foto Berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Indicator Counter Foto */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-zinc-300 px-2.5 py-1 rounded-lg">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Foto (Bisa Diklik untuk Geser/Ganti Foto Utama) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-red-600 scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMASI DETAIL PRODUK (RIGHT COLUMN) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-red-950/80 text-red-400 border border-red-800/60 text-[10px] font-black uppercase px-3 py-1 rounded-lg">
                  {product.category}
                </span>
                <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase px-3 py-1 rounded-lg">
                  {product.condition}
                </span>
              </div>

              {/* Judul & SKU */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                  SKU: {product.sku}
                </p>
              </div>

              {/* Blok Harga */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                  Harga Koleksi
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-0.5 block">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Status Stok */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-zinc-400">STATUS STOK:</span>
                {isSoldOut ? (
                  <span className="text-red-500 font-black uppercase">STOK HABIS (SOLD OUT)</span>
                ) : (
                  <span className="text-emerald-400 font-black uppercase">Tersedia ({product.stock} unit)</span>
                )}
              </div>

              {/* Deskripsi Produk */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Deskripsi</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi tambahan untuk produk ini.'}
                </p>
              </div>
            </div>

            {/* Tombol WhatsApp */}
            <div className="pt-4 border-t border-zinc-800/80">
              {isSoldOut ? (
                <button
                  disabled
                  className="w-full bg-zinc-800 text-zinc-500 font-bold py-4 rounded-2xl text-xs uppercase tracking-wider cursor-not-allowed text-center"
                >
                  PRODUK SUDAH TERJUAL (SOLD OUT)
                </button>
              ) : (
                <a
                  href={`https://wa.me/${waNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-zinc-950" /> BELI VIA WHATSAPP
                </a>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}