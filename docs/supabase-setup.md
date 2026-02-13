# Supabase 세팅 가이드 (MVP)

## 1. 프로젝트 생성
1. Supabase에서 새 프로젝트 생성
2. Region은 한국 사용자 기준 가까운 리전 선택
3. Database password 안전하게 보관

## 2. Auth 설정
1. Authentication > Providers > Google 활성화
2. Google Cloud Console에서 OAuth Client 생성
3. Redirect URL 등록
- 로컬: `http://localhost:3001/auth/callback`
- 운영: `https://MarieCard.io/auth/callback`

## 3. 환경변수
`.env.local`에 아래 값 추가:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET` (필요 시)

## 4. DB 스키마 적용
- `db/migrations/001_platform_init.sql` 실행
- 적용 후 테이블/인덱스/RLS 정책 확인

## 5. Storage 버킷
- 버킷 생성: `invitation-assets`
- 접근 정책
  - 업로드: 소유자만
  - 읽기: 공개 링크 노출 자산은 public 또는 signed URL 정책 선택

## 6. 점검
1. Google 로그인 성공 여부
2. users/invitations 레코드 생성 여부
3. 공개 링크(`/invitation/{publicId}`) 조회 여부
