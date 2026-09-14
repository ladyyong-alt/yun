import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://glfyhhwdrttcoldzwfxq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZnloaHdkcnR0Y29sZHp3ZnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjkwODQsImV4cCI6MjEwNDk0NTA4NH0.Mm2KKI2fWDCRV_FXy5wj1PWc65cJjtJ_qHsfGIFh0f8';

// Vercel / Vite 환경변수 탐색 (설정된 환경변수 우선, 없을 시 기본 프로젝트로 안전 연결)
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const TABLE_NAME = 'fractal_saves';
export const LOCAL_STORAGE_KEY = 'mathclay_saved_fractals';

/**
 * 학생별 프랙탈 작품 목록 불러오기 (Supabase Cloud + LocalStorage 안전 병합)
 */
export async function getFractals() {
  // 1. LocalStorage 데이터 우선 읽기
  let localWorks = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      localWorks = JSON.parse(raw).map((item) => ({
        ...item,
        source: item.source || 'local',
      }));
    }
  } catch (err) {
    console.error('LocalStorage read error:', err);
  }

  // 2. Supabase 클라우드 데이터 읽기
  let cloudWorks = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        cloudWorks = data.map((item) => {
          // title에 [학생이름]이 포함되어 있는 경우 자동 분리
          let studentName = item.student_name || item.studentName || '';
          let title = item.title || '프랙탈 나무';
          if (!studentName && title.startsWith('[')) {
            const match = title.match(/^\[(.*?)\]\s*(.*)$/);
            if (match) {
              studentName = match[1];
              title = match[2] || title;
            }
          }

          return {
            id: item.id,
            title,
            studentName: studentName || '익명 학생',
            comment: item.comment || '',
            likes: Number(item.likes || 0),
            angle: Number(item.angle),
            depth: Number(item.depth),
            branchRatio: Number(item.branch_ratio || item.branchRatio || 0.72),
            colorTheme: item.color_theme || item.colorTheme || 'summer',
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
          };
        });
      } else if (error) {
        console.warn('Supabase fetch failed, will use LocalStorage fallback:', error.message);
      }
    } catch (err) {
      console.error('Supabase query exception:', err);
    }
  }

  // 3. Cloud + Local 상호 병합 (id 기준 중복 제거, 데이터 유실 방지)
  const workMap = new Map();
  // 먼저 로컬 항목 추가
  localWorks.forEach((w) => workMap.set(w.id, w));
  // 클라우드 항목 덮어쓰기 (클라우드가 우선)
  cloudWorks.forEach((w) => workMap.set(w.id, w));

  const merged = Array.from(workMap.values());
  // 최신순 정렬
  merged.sort((a, b) => String(b.id || '').localeCompare(String(a.id || '')));

  return merged;
}

/**
 * 학생 프랙탈 작품 저장하기 (Supabase 우선 ➔ LocalStorage 백업 동시 저장)
 */
export async function saveFractalToDb(fractal) {
  let savedToSupabase = false;

  const finalStudentName = fractal.studentName || '익명 학생';
  const finalTitle = fractal.title || '프랙탈 나무';
  const createdAt = new Date().toISOString();
  const id = fractal.id || 'fractal_' + Date.now();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1차 시도: 모든 확장 컬럼 포함
      const fullPayload = {
        id,
        title: finalTitle,
        student_name: finalStudentName,
        comment: fractal.comment || '',
        likes: fractal.likes || 0,
        angle: Number(fractal.angle),
        depth: Number(fractal.depth),
        branch_ratio: Number(fractal.branchRatio),
        color_theme: fractal.colorTheme || 'summer',
        thumbnail: fractal.thumbnail || null,
        created_at: createdAt,
      };

      let { error } = await supabase.from(TABLE_NAME).insert([fullPayload]);

      // 만약 student_name 컬럼이 없는 기존 테이블일 경우, 기본 스키마로 재시도
      if (error && (error.message.includes('student_name') || error.message.includes('column') || error.code === '42703')) {
        console.warn('Supabase column not found, falling back to base schema with title tag...');
        const basicPayload = {
          id,
          title: `[${finalStudentName}] ${finalTitle}`,
          angle: Number(fractal.angle),
          depth: Number(fractal.depth),
          branch_ratio: Number(fractal.branchRatio),
          color_theme: fractal.colorTheme || 'summer',
          thumbnail: fractal.thumbnail || null,
          created_at: createdAt,
        };
        const retry = await supabase.from(TABLE_NAME).insert([basicPayload]);
        if (!retry.error) {
          savedToSupabase = true;
        } else {
          console.warn('Retry insert failed:', retry.error.message);
        }
      } else if (!error) {
        savedToSupabase = true;
      } else {
        console.warn('Supabase insert failed:', error.message);
      }
    } catch (err) {
      console.error('Supabase insert exception:', err);
    }
  }

  // 2. 항상 LocalStorage에 즉시 영구 저장 (오프라인/클라우드 실패 방어)
  const normalizedItem = {
    ...fractal,
    id,
    studentName: finalStudentName,
    title: finalTitle,
    source: savedToSupabase ? 'supabase' : 'local',
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [
      normalizedItem,
      ...existing.filter((item) => item.id !== id),
    ].slice(0, 100);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  // 3. 브라우저 내 다른 컴포넌트(StudentGallery)에 즉각 실시간 반영 이벤트 트리거!
  try {
    window.dispatchEvent(
      new CustomEvent('mathclay_work_saved', { detail: normalizedItem })
    );
  } catch (e) {
    console.error('Event dispatch error', e);
  }

  return { success: true, isCloud: savedToSupabase, item: normalizedItem };
}

/**
 * 작품 응원하기 (좋아요 증가)
 */
export async function likeFractalInDb(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from(TABLE_NAME).select('likes').eq('id', id).single();
      const newLikes = (data?.likes || 0) + 1;
      await supabase.from(TABLE_NAME).update({ likes: newLikes }).eq('id', id);
    } catch (err) {
      console.warn('Supabase like failed, will store locally:', err);
    }
  }

  // LocalStorage 동기화
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const existing = JSON.parse(raw);
      const updated = existing.map((item) => 
        item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('LocalStorage like warning:', err);
  }

  return true;
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

  // 삭제 이벤트 발송
  window.dispatchEvent(new CustomEvent('mathclay_work_deleted', { detail: { id } }));

  return true;
}
