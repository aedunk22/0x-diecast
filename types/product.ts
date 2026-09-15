export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: 'Hot Wheels' | 'Premium' | 'Loose' | 'Koleksi Lain';
  condition: 'New' | 'Blister Card Mint' | 'Loose Smooth' | 'Custom';
  stock: number;
  status: 'available' | 'sold_out';
  featured: boolean;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type SortOption = 'newest' | 'price-low' | 'price-high';