# Naver Mobile Page Snapshot (In-App Friendly Mirror)

이 저장소는 **GitHub Actions + Puppeteer**로
`https://m.site.naver.com/1OsuE` 페이지를 서버 사이드에서 렌더링하고,
무거운 스크립트를 제거/간소화하여 **인앱 브라우저에서도 잘 열리는 경량 스냅샷**을 생성합니다.

## 작동 방식
- 워크플로우가 Puppeteer로 `https://m.site.naver.com/1OsuE` 을 열어 HTML을 **스냅샷**으로 저장합니다.
- 불필요한 `<script>`를 제거하고, 상대 경로를 절대 경로로 바꿉니다.
- 결과는 `/snapshot/index.html` 로 커밋됩니다.
- GitHub Pages로 `/snapshot/`를 서빙하면 **경량 미러 페이지**가 됩니다.

## 배포 (GitHub Pages)
1. 이 저장소를 생성 후 파일 업로드
2. **Settings → Pages**:
   - Source: Deploy from a branch
   - Branch: `main`, Folder: `/ (root)` → Save
3. 배포 주소 예: `https://<username>.github.io/<repo>/snapshot/`

## 실행
- 수동 실행: **Actions → "Build Snapshot" → Run workflow**
- 자동 실행: 매일 새벽 3시 (CRON 변경 가능)

## 주의
- 제3자 페이지의 스냅샷/미러는 사이트 정책을 준수해야 합니다. 필요 시 사용 권한을 확인하세요.
- 일부 인터랙션(로그인/동적 데이터)은 스냅샷에서 동작하지 않을 수 있습니다.
