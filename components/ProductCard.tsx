'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Image as ImageIcon } from 'lucide-react';

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

export default function ProductCard({ product }: { product: Product }) {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6287821093233';
  const waNumber = rawNumber.replace(/[^0-9]/g, '').replace(/^0/, '62');

  const isSoldOut = product.stock <= 0 || product.status === 'SOLD';
  
  // Link dinamis produk
  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/koleksi/${product.slug}`
    : `/koleksi/${product.slug}`;

  // Format Pesan WhatsApp Seragam & Clean
  const waMessage = encodeURIComponent(
    `Halo 0xdiecast, saya tertarik untuk membeli produk berikut:\n\n*Nama Produk:* ${product.name}\n*Kode SKU:* ${product.sku}\n*Harga:* Rp ${product.price.toLocaleString('id-ID')}\n*Kategori:* ${product.category}\n\nApakah produk ini masih tersedia dan bisa dikirim? Terima kasih!`
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-lg">
      <Link href={`/koleksi/${product.slug}`} className="block relative aspect-square bg-zinc-950 overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
            <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
            <span className="text-[10px] font-bold uppercase">No Image</span>
          </div>
        )}

        {/* Badge Category & Condition */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span className="bg-red-950/90 text-red-400 border border-red-800/80 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md backdrop-blur-md">
            {product.category}
          </span>
        </div>

        {/* BADGE STOK (POJOK KANAN ATAS FOTO) */}
        {!isSoldOut && (
          <div className="absolute top-3 right-3 z-10">
            {product.stock === 1 ? (
              <span className="bg-amber-950/90 text-amber-400 border border-amber-700/80 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md backdrop-blur-md shadow-md">
                Sisa 1 Unit
              </span>
            ) : (
              <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md backdrop-blur-md shadow-md">
                Stok: {product.stock}
              </span>
            )}
          </div>
        )}

        {/* Overlay SOLD OUT */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-xl border border-red-500 shadow-xl">
              SOLD OUT
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
            SKU: {product.sku}
          </span>
          <Link href={`/koleksi/${product.slug}`}>
            <h3 className="font-bold text-sm text-white hover:text-red-500 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] text-zinc-500 uppercase font-bold block">Harga</span>
            <span className="text-base font-black text-emerald-400">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
          </div>

          {isSoldOut ? (
            <button
              disabled
              className="bg-zinc-800 text-zinc-500 font-bold px-3 py-2 rounded-xl text-[10px] uppercase cursor-not-allowed"
            >
              LAKU
            </button>
          ) : (
            <a
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-3.5 py-2 rounded-xl text-[11px] flex items-center gap-1.5 uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-zinc-950" /> Beli
            </a>
          )}
        </div>
      </div>
    </div>
  );
}