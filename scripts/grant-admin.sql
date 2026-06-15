-- Supabase SQL Editor에서 실행
-- gujeong@hjcustoms.co.kr 계정에 DB admin 플래그 부여 (선택)
-- ※ 앱은 lib/admin.js 내장 목록으로도 admin 인식합니다.

update users
set is_ceo = true
where lower(email) = lower('gujeong@hjcustoms.co.kr');

-- 등록되어 있지 않으면 먼저 앱에서 소속 정보 등록 후 위 SQL 실행
