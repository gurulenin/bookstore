import { supabase } from './supabase';

interface Genre {
  name_en: string;
  name_ta: string;
}

let genreCache: Genre[] = [];

export async function loadGenres() {
  const { data } = await supabase.from('genres').select('*').order('name_en');
  if (data) {
    genreCache = data;
  }
  return genreCache;
}

export function translateGenre(genreNameEn: string, language: 'en' | 'ta'): string {
  if (language === 'en' || !genreNameEn) return genreNameEn;

  const genre = genreCache.find(g => g.name_en === genreNameEn);
  return genre ? genre.name_ta : genreNameEn;
}

export function getGenres() {
  return genreCache;
}
