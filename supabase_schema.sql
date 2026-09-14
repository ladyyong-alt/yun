-- ==============================================================================
-- Supabase SQL Schema for MathClay Fractal Storage
-- Supabase 대시보드 > SQL Editor에서 실행하여 테이블을 생성할 수 있습니다.
-- ==============================================================================

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

-- 공개 읽기 및 쓰기 권한 설정 (RLS)
alter table fractal_saves enable row level security;

create policy "Allow public select access on fractal_saves" 
  on fractal_saves for select 
  to anon, authenticated
  using (true);

create policy "Allow public insert access on fractal_saves" 
  on fractal_saves for insert 
  to anon, authenticated
  with check (true);

create policy "Allow public delete access on fractal_saves" 
  on fractal_saves for delete 
  to anon, authenticated
  using (true);
