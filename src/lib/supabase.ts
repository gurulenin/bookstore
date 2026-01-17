import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  isbn?: string;
  sku?: string;
  genre?: string;
  cover_image_url: string;
  publisher: string;
  published_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BookFormat {
  id: string;
  book_id: string;
  format_type: 'physical' | 'ebook' | 'audiobook';
  price: number;
  file_url?: string;
  file_format?: string;
  file_size?: number;
  stock_quantity?: number;
  is_available: boolean;
  license_info?: string;
  created_at: string;
}

export interface BookWithFormats extends Book {
  formats: BookFormat[];
}
