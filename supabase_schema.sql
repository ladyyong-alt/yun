-- ==============================================================================
-- Supabase SQL Schema for MathClay Fractal Storage (안전 재실행 스크립트)
-- Supabase 대시보드 > SQL Editor에서 실행하시면 됩니다.
-- 이미 정책이 존재하는 경우에도 에러 없이 덮어씌워집니다.
-- ==============================================================================

-- 1. 테이블 생성 (이미 존재하는 경우 유지)
create table if not exists fractal_saves (
  id text primary key,
  title text not null,
  angle numeric not null,
  depth integer not null,
  branch_ratio numeric not null,
  color_theme text default 'summer',
  thumbnail text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. RLS(Row Level Security) 활성화
alter table fractal_saves enable row level security;

-- 3. 기존 정책이 있을 경우 중복 에러 방지를 위해 먼저 삭제 (Idempotent)
drop policy if exists "Allow public select" on fractal_saves;
drop policy if exists "Allow public insert" on fractal_saves;
drop policy if exists "Allow public delete" on fractal_saves;
drop policy if exists "Allow public select access on fractal_saves" on fractal_saves;
drop policy if exists "Allow public insert access on fractal_saves" on fractal_saves;
drop policy if exists "Allow public delete access on fractal_saves" on fractal_saves;

-- 4. 정책 재등록 (익명 및 인증 사용자 모두 읽기/쓰기/삭제 허용)
create policy "Allow public select" 
  on fractal_saves for select 
  to anon, authenticated 
  using (true);

create policy "Allow public insert" 
  on fractal_saves for insert 
  to anon, authenticated 
  with check (true);

create policy "Allow public delete" 
  on fractal_saves for delete 
  to anon, authenticated 
  using (true);
