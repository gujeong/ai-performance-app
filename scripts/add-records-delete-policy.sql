-- Supabase SQL Editor에서 실행 (기존 운영 DB)
-- 실적 삭제가 안 될 때 records DELETE 정책 추가

create policy if not exists "records_delete" on records for delete using (true);
