# 운영 DB(기존 Supabase)와 동일하게 연결하기

직원들이 이미 쓰는 **배포된 앱**과 **같은 데이터**를 쓰려면, 로컬·새 배포 모두 **Vercel에 등록된 Supabase**만 사용해야 합니다.

**새 Supabase 프로젝트를 만들면 안 됩니다.** (사용자·실적 데이터가 비어 있습니다.)

---

## 1. Vercel에서 운영 값 복사

1. https://vercel.com 로그인
2. **ai-performance-app** (또는 배포한 프로젝트) 선택
3. **Settings** → **Environment Variables**
4. 아래 두 항목의 값을 **복사** (눈 아이콘으로 보기)

| 이름 | 복사할 내용 |
|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://??????.supabase.co` (**/rest/v1 없음**) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` 로 시작하는 긴 키 |

> Production / Preview / Development 모두 **같은 값**인지 확인하세요.

---

## 2. `.env.local`에 붙여넣기

프로젝트 폴더의 `.env.local` 파일:

```env
NEXT_PUBLIC_SUPABASE_URL=여기에_Vercel과_동일한_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_Vercel과_동일한_anon_키
```

저장 후 터미널에서:

```powershell
npm run dev
```

브라우저 **새로고침(Ctrl+F5)** 후 로그인합니다.

---

## 3. 연결이 맞는지 확인

```powershell
npm run check:db
```

- **등록 사용자 N명** → 운영 DB와 연결된 것 (N > 0 이어야 정상)
- **0명** → 아직 다른(빈) Supabase에 연결된 상태 → 1~2단계 다시 확인

---

## 4. Vercel 배포도 같은 값 유지

코드만 GitHub에 올리고, **Vercel 환경 변수는 건드리지 않으면** 직원 앱은 계속 기존 DB를 씁니다.

로컬에서 테스트할 때만 `.env.local`을 Vercel과 **완전히 동일**하게 맞추면 됩니다.

---

## 자주 하는 실수

| 실수 | 결과 |
|------|------|
| Supabase에서 **New project** 새로 만듦 | 사용자 0명, 전원 재가입 화면 |
| URL 끝에 `/rest/v1` 붙임 | `Invalid path` 오류 |
| 로컬 `.env.local`만 바꾸고 Vercel은 예전 값 | 배포 앱과 로컬이 **다른 DB** |
