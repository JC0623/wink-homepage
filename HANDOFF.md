# Wink 홈페이지 — Claude Code 인계 메모

Claude Design 캔버스의 "2안-C — 화이트 + 반짝임" 시안을 일반 HTML로 옮긴 파일이다.
디자인(색, 서체, 문구, 배치, 애니메이션)은 확정된 상태이므로 바꾸지 말 것.

## 파일
- `index.html` — 한 페이지 사이트. 스타일은 `<head>`의 `<style>`에 있음.
- `images/` — 배우 프로필 3장, 공연 사진 6장 (PPT에서 추출, 약 500px 저해상도).

## 디자인 기준 (유지)
- 포인트 컬러 `#C8102E` (CSS 변수 `--ink`), 배경 흰색, 본문 흑백.
- 서체: Yellowtail(영문 필기체), Noto Serif KR, Noto Sans KR — Google Fonts.
- 첫 화면 연출: 모자 착지 → W 그리기 → 문구 등장 → 모자 들어 인사 → 로고와 Wink 동시 반짝임(2.35초). `prefers-reduced-motion`에서는 정지.
- 모바일 기준: 첫 화면 `100svh`, 입력칸 16px, 탭 하이라이트 제거, hover는 `(hover:hover) and (pointer:fine)`에서만.

## 남은 작업
1. ~~문의 폼 실제 전송 연결~~ → Google 시트 "Wink 문의 접수"로 연결함 (`apps-script/Code.gs`, 완료 토스트 포함). 남은 일: Apps Script 웹 앱 배포 후 `index.html`의 `CONTACT_ENDPOINT`에 `…/exec` URL 넣기.
2. ~~개인정보 처리방침 페이지 추가~~ → `privacy.html` (폼 "보기"는 `#consent`, 하단에도 링크). 보유 기간 1년·보호책임자 양경원은 확인 필요.
3. 하단 사업자등록번호 `[000-00-00000]` 채우기.
4. 배우·공연 사진 고해상도 원본으로 교체 (파일명 유지하면 HTML 수정 불필요).
5. 1440 / 768 / 390px 세 폭에서 스크린샷으로 확인, 특히 768px(태블릿) 구간 점검.
6. 실제 휴대폰과 카카오톡 인앱 브라우저에서 첫 화면 애니메이션 확인.
7. ~~GitHub Pages 배포~~ → https://jc0623.github.io/wink-homepage/ (이 폴더가 저장소). 이전 1·2·3안은 `legacy/`.
