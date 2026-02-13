# MarieCard 출시 실행계획 (MVP)

## 0. 목표
- 사용자에게 `MarieCard.io/invitation/{publicId}` 형태의 공유 링크를 제공한다.
- 로그인 사용자만 관리자 편집/미리보기 가능하게 한다.
- 내보내기 후에도 계속 수정 가능한 운영 흐름을 완성한다.

## 1. 기술 스택(확정)
- Frontend/App Server: Next.js 14 (App Router)
- Auth/DB/Storage: Supabase
- 배포: Vercel
- 모니터링: Sentry (2차)

## 2. 핵심 도메인
- User: Google 로그인 계정
- Invitation: 사용자 소유 청첩장 엔티티
- Draft Content: 편집 중 내용(JSON)
- Published Content: 공개 링크에 반영된 버전
- Preview Token: 비공유 미리보기용 단기 토큰

## 3. 일정(권장)
1. Week 1
- Supabase 프로젝트 생성
- Google OAuth 연결
- DB 스키마/정책 배포
- Next.js 서버-DB 연결

2. Week 2
- 인증 기반 라우팅 구축
- 관리자 저장 로직을 DB 기반으로 전환
- 미리보기 링크(토큰) 구현

3. Week 3
- 내보내기/공개 링크 구현
- 회색 placeholder 기반 빈 템플릿 적용
- QA/버그 수정

4. Week 4
- Vercel 프로덕션 배포
- 도메인 연결(MarieCard.io)
- 오픈 베타

## 4. 기능 완료 기준
- 로그인: Google 로그인 성공 후 `/dashboard` 진입
- 관리자: 사용자 소유 청첩장만 편집 가능
- 미리보기: 본인만 접근, 외부 공유 불가
- 내보내기: 공개 링크 생성/재내보내기 가능

## 5. 리스크 및 대응
1. publicId 중복
- DB unique + 재시도 로직으로 해결

2. 미리보기 링크 유출
- 단기 만료 토큰 + 사용자 세션/소유권 검증

3. 대용량 미디어 업로드
- 용량 제한, MIME 검증, CDN 캐시 적용

4. 데이터 손실
- DB 자동 백업 + 버전 테이블 유지

## 6. 즉시 실행 태스크
1. Supabase 프로젝트/환경변수 준비
2. SQL 마이그레이션 적용 (`db/migrations/001_platform_init.sql`)
3. Next.js에 Supabase 클라이언트 연결
4. Google 로그인 화면(`/auth/login`) 구현 시작

## 7. 실행 전 점검 페이지
- 경로: `/setup/status`
- 용도:
  - 핵심 환경변수 존재 여부 확인
  - SQL 적용 파일 경로 확인
  - OAuth Redirect URL 확인
