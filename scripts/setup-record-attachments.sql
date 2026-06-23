-- ============================================
-- 실적 첨부파일 (본인·평가자만 API로 접근)
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 첨부파일 메타데이터 테이블
create table if not exists record_attachments (
  id           uuid primary key default gen_random_uuid(),
  record_id    uuid not null references records(id) on delete cascade,
  owner_email  text not null,
  file_name    text not null,
  storage_path text not null unique,
  mime_type    text,
  size_bytes   int,
  created_at   timestamptz default now()
);

create index if not exists record_attachments_record_id_idx
  on record_attachments(record_id);

-- 2. RLS: anon 키로는 직접 접근 불가 (API + service role만 사용)
alter table record_attachments enable row level security;

-- 3. 비공개 Storage 버킷
insert into storage.buckets (id, name, public)
values ('record-attachments', 'record-attachments', false)
on conflict (id) do update set public = false;
