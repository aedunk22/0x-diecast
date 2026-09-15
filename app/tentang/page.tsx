'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* NAVBAR DI PALING ATAS */}
      <Navbar />

      {/* KONTEN UTAMA TENTANG TOKO */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            0xdiecast
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1 uppercase font-bold tracking-wider">
            Official Store & Personal Garage
          </p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-4 text-zinc-300 text-sm md:text-base leading-relaxed backdrop-blur-md shadow-xl">
          <p>
            Selamat datang di <strong className="text-white font-bold">0xdiecast</strong>. Website ini dibentuk sebagai ruang pamer sekaligus toko pribadi untuk melepas koleksi Hot Wheels dan diecast langka (RLC, Premium Car Culture, hingga Loose kondisi mint).
          </p>
          <p>
            Semua produk yang ada di katalog ini 100% foto dan barang nyata milik saya pribadi. Saya memahami pentingnya kondisi card, blister, dan kemulusan unit bagi seorang kolektor. Oleh karena itu, detail transparansi kondisi selalu diutamakan.
          </p>
          <p>
            Transaksi dibuat sangat sederhana: jika kamu tertarik dengan salah satu diecast, tinggal klik tombol order dan pesan akan terhubung langsung ke WhatsApp pribadi saya.
          </p>
        </div>
      </main>

      {/* FOOTER DI PALING BAWAH */}
      <Footer />
    </div>
  );
}