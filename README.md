# AI 활용 성과 관리 앱 — 배포 가이드

## 순서 요약
1. Supabase 프로젝트 생성 → 테이블 생성
2. GitHub에 코드 올리기
3. Vercel에 연결 → 환경변수 입력 → 배포

---

## Step 1. Supabase 설정

1. https://supabase.com 접속 → 회원가입 → New project 생성
2. 좌측 메뉴 **SQL Editor** 클릭
3. `supabase-schema.sql` 파일 내용을 전체 복사 → 붙여넣기 → **Run**
4. 좌측 메뉴 **Project Settings → API** 클릭
5. 아래 두 값을 복사해두세요:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2. GitHub 업로드

```bash
# 이 폴더에서 실행
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_ID/ai-performance-app.git
git push -u origin main
```

---

## Step 3. Vercel 배포

1. https://vercel.com 접속 → GitHub 로그인
2. **Add New Project** → GitHub 저장소 선택
3. **Environment Variables** 탭에서 아래 2개 입력:

| 키 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

4. **Deploy** 클릭 → 2~3분 후 완료
5. 생성된 URL (예: `https://ai-performance-app.vercel.app`) 직원들에게 공유

---

## 핸드폰 앱처럼 사용하는 방법 (PWA)

### iPhone (Safari)
1. 공유 버튼(□↑) → **홈 화면에 추가**

### Android (Chrome)
1. 우측 상단 메뉴(⋮) → **홈 화면에 추가**

홈 화면에 추가하면 앱 아이콘이 생기고, 전체화면으로 실행됩니다.

---

## 첫 실행 시

- 대표님 이메일로 로그인 → 소속 정보 등록 시 **권한: 대표** 선택
- 직원들은 각자 이메일로 첫 로그인 시 자동 등록
