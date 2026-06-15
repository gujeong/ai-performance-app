-- Supabase SQL Editor에서 실행 — deleted_at 컬럼 존재 여부 확인

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'records'
order by ordinal_position;

-- deleted_at, deleted_by 가 보이면 DB에는 컬럼이 있음
-- 앱에서仍 오류면: notify pgrst, 'reload schema'; 또는 Settings → General → Restart project
-- Vercel NEXT_PUBLIC_SUPABASE_URL 의 프로젝트 ID와 이 Supabase 프로젝트가 같은지 확인

notify pgrst, 'reload schema';
