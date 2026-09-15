import { STORE_CONFIG } from "./config";
import { Product } from "@/types/product";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateWhatsAppUrl(product: Product, intent: 'order' | 'ask' = 'order'): string {
  const cleanPhone = STORE_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
  
  let message = "";
  if (intent === 'order') {
    message = `Halo ${STORE_CONFIG.name}, saya ingin memesan produk berikut:\n\n` +
      `📌 *Nama Produk*: ${product.name}\n` +
      `🏷️ *Kode SKU*: ${product.sku}\n` +
      `💰 *Harga*: ${formatRupiah(product.price)}\n` +
      `📁 *Kategori*: ${product.category}\n\n` +
      `Apakah produk ini masih tersedia dan bisa dikirim? Terima kasih!`;
  } else {
    message = `Halo ${STORE_CONFIG.name}, saya mau bertanya ketersediaan produk *${product.name}* (SKU: ${product.sku}).`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}