-- ==============================================================================
-- Supabase SQL Schema for MathClay Student Fractal Gallery (학생 작품 모음방)
-- Supabase 대시보드 > SQL Editor에서 실행하시면 테이블 및 학생별 컬럼이 구성됩니다.
-- ==============================================================================

-- 1. 테이블 생성 (이미 존재하는 경우 유지)
create table if not exists fractal_saves (
  id text primary key,
  title text not null,
  student_name text default '익명 학생',
  comment text default '',
  likes integer default 0,
  angle numeric not null,
  depth integer not null,
  branch_ratio numeric not null,
  color_theme text default 'summer',
  thumbnail text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 기존 테이블이 이미 있는 경우 학생 관련 컬럼 추가 (무중단 안전 마이그레이션)
alter table fractal_saves add column if not exists student_name text default '익명 학생';
alter table fractal_saves add column if not exists comment text default '';
alter table fractal_saves add column if not exists likes integer default 0;

-- 3. RLS(Row Level Security) 활성화
alter table fractal_saves enable row level security;

-- 4. 기존 정책이 있을 경우 중복 에러 방지를 위해 먼저 삭제 (Idempotent)
drop policy if exists "Allow public select" on fractal_saves;
drop policy if exists "Allow public insert" on fractal_saves;
drop policy if exists "Allow public update" on fractal_saves;
drop policy if exists "Allow public delete" on fractal_saves;
drop policy if exists "Allow public select access on fractal_saves" on fractal_saves;
drop policy if exists "Allow public insert access on fractal_saves" on fractal_saves;
drop policy if exists "Allow public delete access on fractal_saves" on fractal_saves;

-- 5. 권한 부여 (익명 및 인증 사용자 모두 읽기/쓰기/응원/삭제 허용)
create policy "Allow public select" 
  on fractal_saves for select 
  to anon, authenticated 
  using (true);

create policy "Allow public insert" 
  on fractal_saves for insert 
  to anon, authenticated 
  with check (true);

create policy "Allow public update" 
  on fractal_saves for update 
  to anon, authenticated 
  using (true);

create policy "Allow public delete" 
  on fractal_saves for delete 
  to anon, authenticated 
  using (true);
