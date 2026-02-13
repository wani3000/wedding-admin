# 관리자 페이지 순차 작업 현황

## 단계별 상태
1. 정책 확정: 완료
- 문서: `docs/admin-policy.md`

2. 데이터 모델 고정: 완료
- 타입: `lib/content/types.ts`
- 정규화/검증: `lib/content/validate.ts`
- 저장소: `lib/content/store.ts`

3. 관리자 API 고정: 완료
- 콘텐츠 조회/저장: `app/api/admin/content/route.ts`
- 업로드: `app/api/admin/upload/route.ts`
- 백업 목록: `app/api/admin/backups/route.ts`
- 백업 복원: `app/api/admin/backups/[name]/restore/route.ts`

4. 관리자 UI 고정: 완료
- 페이지: `app/admin/page.tsx`
- 기능: 편집/추가/삭제/순서변경/업로드/검증오류표시/백업복원

5. 메인 연동 고정: 완료
- 메인: `app/page.tsx`
- 갤러리: `app/gallery/page.tsx`
- 라이트박스: `app/lightbox/page.tsx`
- 섹션 컴포넌트: `components/sections/*`

6. 검수 및 인수: 진행 중
- 린트: 통과
- 빌드: 네트워크 제한(fonts.googleapis.com 차단)으로 로컬 환경에서 미완료

## 운영 설정
- 선택적 관리자 인증키
  - 서버 환경변수: `ADMIN_ACCESS_KEY`
  - 설정 시 관리자 API 호출 헤더 `x-admin-key` 필수
- 업로드 제한
  - 최대 50MB
  - 이미지/비디오 허용 MIME + 확장자만 저장

## 복구 방법
1. `/admin` 접속
2. `백업/복구` 섹션에서 백업 파일 선택
3. `복원` 실행
4. 메인 페이지에서 반영 확인
