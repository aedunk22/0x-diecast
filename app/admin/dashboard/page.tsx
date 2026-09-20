'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, LogOut, Upload, X, Sparkles, Store, Search } from 'lucide-react';
import Link from 'next/link';

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('HOT WHEELS');
  const [condition, setCondition] = useState('Carded (Segel)');
  const [stock, setStock] = useState('1');
  const [status, setStatus] = useState('AVAILABLE');
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');
  
  // Image States & AI Loading State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchProducts();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
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
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // ✅ FUNGSI PEMBUAT SKU OTOMATIS (OPSI A)
  const generateAutoSKU = (selectedCategory: string) => {
    const prefixMap: Record<string, string> = {
      'HOT WHEELS': 'HW',
      'PREMIUM': 'PRM',
      'CAR CULTURE': 'CC',
      'LOOSE CONDITION': 'LSE',
      'RLC & CONVENTION': 'RLC'
    };
    const prefix = prefixMap[selectedCategory] || '0XD';
    // Ambil 6 digit angka acak dari waktu saat ini
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const openAddModal = () => {
    const defaultCategory = 'HOT WHEELS';
    setEditingProduct(null);
    setCategory(defaultCategory);
    setSku(generateAutoSKU(defaultCategory)); // ✅ Generate SKU saat buka modal
    setName('');
    setPrice('');
    setCondition('Carded (Segel)');
    setStock('1');
    setStatus('AVAILABLE');
    setFeatured(false);
    setDescription('');
    setImageFiles([]);
    setExistingImages([]);
    setNewImagePreviews([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSku(product.sku);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setCondition(product.condition);
    setStock(product.stock.toString());
    setStatus(product.status || (product.stock > 0 ? 'AVAILABLE' : 'SOLD'));
    setFeatured(product.featured || false);
    setDescription(product.description || '');
    setImageFiles([]);
    setExistingImages(product.images || []);
    setNewImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!name.trim()) {
      alert('Isi "NAMA PRODUK" terlebih dahulu sebelum membuat deskripsi otomatis!');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          condition,
        }),
      });

      const data = await res.json();

      if (res.ok && data.description) {
        setDescription(data.description);
      } else {
        alert(data.error || 'Gagal menghasilkan deskripsi AI.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memanggil AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const updatedFiles = [...imageFiles, ...selectedFiles];
      setImageFiles(updatedFiles);

      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    e.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImages: string[] = [...existingImages];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(filePath);
            finalImages.push(publicUrlData.publicUrl);
          } else {
            const base64 = await convertFileToBase64(file);
            finalImages.push(base64);
          }
        }
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const parsedStock = parseInt(stock) || 0;
      const finalStatus = status === 'SOLD' || parsedStock <= 0 ? 'SOLD' : 'AVAILABLE';

      const payload = {
        sku,
        name,
        slug,
        description,
        price: parseFloat(price) || 0,
        category,
        condition,
        stock: parsedStock,
        status: finalStatus,
        featured,
        images: finalImages,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert('Gagal menyimpan produk: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah kamu yakin ingin menghapus produk ini secara permanen?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        fetchProducts();
      } else {
        alert('Gagal menghapus produk');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Dashboard Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-950 text-red-500 border border-red-800/50 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                Admin Area
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight mt-1">DASHBOARD ADMIN</h1>
            <p className="text-zinc-400 text-sm mt-0.5">
              Kelola katalog dan ketersediaan stok koleksi toko <span className="text-white font-bold">0xdiecast</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider transition-all"
            >
              <Store className="w-4 h-4 text-zinc-400" /> Lihat Toko
            </Link>
            <button
              onClick={openAddModal}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-600/20"
            >
              <Plus className="w-4 h-4" /> Tambah Produk
            </button>
            <button
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 p-2.5 rounded-xl transition-all cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Kolom Pencarian */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama produk, SKU, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>

        {/* Tabel Produk */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 text-[10px] font-black uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Foto Utama</th>
                  <th className="p-4">Jml Foto</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-zinc-500 font-bold animate-pulse">
                      Memuat katalog produk 0xdiecast...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-zinc-500">
                      {searchQuery ? 'Produk yang dicari tidak ditemukan.' : 'Belum ada produk. Klik tombol + Tambah Produk untuk memasukkan data baru.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isSoldOut = product.stock <= 0 || product.status === 'SOLD';
                    return (
                      <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[9px]">No Image</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-zinc-400">
                          {product.images ? product.images.length : 0} foto
                        </td>
                        <td className="p-4 font-mono text-xs text-zinc-400">{product.sku}</td>
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          {product.name}
                          {product.featured && (
                            <span className="bg-amber-950 text-amber-400 border border-amber-800/50 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1" title="Dipajang di Hero">
                              <Sparkles className="w-2.5 h-2.5" /> HERO
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-zinc-400 text-xs">{product.category}</td>
                        <td className="p-4 font-bold text-emerald-400">Rp {product.price.toLocaleString('id-ID')}</td>
                        <td className="p-4 font-semibold">{product.stock}</td>
                        <td className="p-4">
                          {isSoldOut ? (
                            <span className="bg-red-950 text-red-400 border border-red-800/50 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                              SOLD OUT
                            </span>
                          ) : (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                              AVAILABLE
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Edit Produk"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah / Edit Produk */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 md:p-8 relative shadow-2xl my-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black uppercase tracking-tight mb-6">
                {editingProduct ? 'EDIT PRODUK' : 'TAMBAH PRODUK BARU'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">
                    SKU Produk (Otomatis)
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Hot Wheels Honda Civic Si"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="90000"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Stok Unit</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStock(val);
                        if (parseInt(val) <= 0) {
                          setStatus('SOLD');
                        } else if (status === 'SOLD' && parseInt(val) > 0) {
                          setStatus('AVAILABLE');
                        }
                      }}
                      placeholder="1"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Kategori</label>
                    <select
                      value={category}
                      // ✅ Ganti Kategori akan otomatis update awalan SKU jika Tambah Produk Baru
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setCategory(newCategory);
                        if (!editingProduct) {
                          setSku(generateAutoSKU(newCategory));
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="HOT WHEELS">Hot Wheels</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="CAR CULTURE">Car Culture</option>
                      <option value="LOOSE CONDITION">Loose Condition</option>
                      <option value="RLC & CONVENTION">RLC & Convention</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Kondisi</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="Carded (Segel)">Carded (Segel)</option>
                      <option value="Loose (Mulus)">Loose (Mulus)</option>
                      <option value="Junk / Custom">Junk / Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Status Barang</label>
                    <select
                      value={status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setStatus(newStatus);
                        if (newStatus === 'SOLD') {
                          setStock('0');
                        } else if (newStatus === 'AVAILABLE' && parseInt(stock) <= 0) {
                          setStock('1');
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 font-bold"
                    >
                      <option value="AVAILABLE" className="text-emerald-400">AVAILABLE (Tersedia)</option>
                      <option value="SOLD" className="text-red-400">SOLD OUT (Laku)</option>
                    </select>
                  </div>
                </div>

                {/* FEATURED / HERO CHECKBOX */}
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl my-2 hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-zinc-300 cursor-pointer select-none flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Tampilkan di Hero melayang halaman depan (Featured Item)
                  </label>
                </div>

                {/* Upload Foto */}
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">
                    Foto Produk (Bisa Pilih Banyak Foto Sekaligus)
                  </label>
                  <label className="flex items-center justify-center gap-2 bg-zinc-950 border border-dashed border-zinc-700 hover:border-red-600 rounded-xl p-4 cursor-pointer transition-colors text-xs text-zinc-400">
                    <Upload className="w-4 h-4 text-red-500" />
                    <span>Pilih Foto dari Perangkat (Bisa bertahap)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* List Preview Foto */}
                  {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">
                        Total Foto Terpilih: {existingImages.length + newImagePreviews.length}
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {existingImages.map((src, idx) => (
                          <div key={`existing-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 group">
                            <img src={src} alt="Existing" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 transition-colors"
                              title="Hapus foto ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/70 text-[8px] text-zinc-300 px-1 rounded">Foto {idx + 1}</span>
                          </div>
                        ))}

                        {newImagePreviews.map((src, idx) => (
                          <div key={`new-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-red-600/50 flex-shrink-0 group">
                            <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 transition-colors"
                              title="Hapus foto ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-red-950 text-[8px] text-red-400 px-1 rounded">Baru</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AREA DESKRIPSI DENGAN TOMBOL AI GENERATOR */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase text-zinc-400">Deskripsi</label>
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg hover:bg-amber-900/80 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGenerating ? 'animate-spin' : 'animate-pulse'}`} />
                      {isGenerating ? 'Menyusun Deskripsi...' : '✨ Buat Otomatis (AI)'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tulis kondisi kemasan, kelebihan item, atau klik tombol AI di atas..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold uppercase text-zinc-400 hover:text-white transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                  >
                    {isSubmitting ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}