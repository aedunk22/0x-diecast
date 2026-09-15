import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, category, condition } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nama produk wajib diisi terlebih dahulu' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dipasang di .env.local' },
        { status: 500 }
      );
    }

    const prompt = `Kamu adalah penulisan deskripsi e-commerce profesional khusus untuk toko diecast bernama "0xdiecast".
Buatkan deskripsi produk yang menarik, informatif, estetik, dan menjual untuk item diecast berikut:
- Nama Produk: ${name}
- Kategori: ${category || 'Hot Wheels'}
- Kondisi: ${condition || 'Carded (Segel)'}

Instruksi:
1. Sertakan fakta singkat/keunikan mobil asli atau keistimewaan edisi diecast ini jika ada (misal livery ikonik, bodykit, RLC, JDM, dsb).
2. Sebutkan kondisi fisik barang sesuai data (${condition}).
3. Akhiri dengan catatan singkat bahwa item aman dikemas menggunakan bubble wrap dan dus tebal.
4. Gunakan bahasa Indonesia yang santai tapi profesional.
5. Panjang deskripsi sekitar 2-4 kalimat ringkas (maksimal 80 kata). Jangan gunakan format markdown judul (seperti # atau **). Langsung berikan teks deskripsinya saja.`;

    // MENGGUNAKAN MODEL GEMINI 3.6 FLASH SESUAI ANJURAN GOOGLE API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Gagal terhubung ke Gemini API' },
        { status: 500 }
      );
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ description: generatedText.trim() });
  } catch (error: any) {
    console.error('Error generating description:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}