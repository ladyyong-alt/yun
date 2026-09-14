import { createClient } from '@supabase/supabase-js';

// Vercel / Vite 환경변수 탐색
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const TABLE_NAME = 'fractal_saves';
const LOCAL_STORAGE_KEY = 'mathclay_saved_fractals';

/**
 * 프랙탈 목록 불러오기 (Supabase 우선 ➔ 미설정 시 LocalStorage)
 */
export async function getFractals() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          title: item.title,
          angle: Number(item.angle),
          depth: Number(item.depth),
          branchRatio: Number(item.branch_ratio || item.branchRatio),
          colorTheme: item.color_theme || item.colorTheme,
          thumbnail: item.thumbnail,
          createdAt: item.created_at 
            ? new Date(item.created_at).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          source: 'supabase',
        }));
      }
      console.warn('Supabase fetch error, fallback to LocalStorage:', error?.message);
    } catch (err) {
      console.error('Supabase query exception:', err);
    }
  }

  // Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw).map((item) => ({ ...item, source: 'local' })) : [];
  } catch (err) {
    console.error('LocalStorage read error:', err);
    return [];
  }
}

/**
 * 프랙탈 저장하기 (Supabase 우선 ➔ LocalStorage 백업 동시 저장)
 */
export async function saveFractalToDb(fractal) {
  let savedToSupabase = false;

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: fractal.id || 'fractal_' + Date.now(),
        title: fractal.title,
        angle: fractal.angle,
        depth: fractal.depth,
        branch_ratio: fractal.branchRatio,
        color_theme: fractal.colorTheme,
        thumbnail: fractal.thumbnail || null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([payload])
        .select();

      if (!error) {
        savedToSupabase = true;
      } else {
        console.warn('Supabase insert failed:', error.message);
      }
    } catch (err) {
      console.error('Supabase insert exception:', err);
    }
  }

  // 항상 LocalStorage에도 안전하게 동기화 저장
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [
      { ...fractal, source: savedToSupabase ? 'supabase' : 'local' },
      ...existing.filter((item) => item.id !== fractal.id),
    ].slice(0, 20);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }

  return { success: true, isCloud: savedToSupabase };
}

/**
 * 프랙탈 삭제하기
 */
export async function deleteFractalFromDb(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from(TABLE_NAME).delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const existing = JSON.parse(raw);
      const updated = existing.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('LocalStorage delete warning:', err);
  }

  return true;
}
