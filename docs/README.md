🎯 SK 멘토 가이드
2025년 SK그룹 신입구성원과정 멘토를 위한 Full-Stack PWA 모바일 웹앱

주요 기술: PWA | Google Sheets API | Firebase FCM | Service Worker

[![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen)](https://web.dev/progressive-web-apps/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-API-4285f4)](https://developers.google.com/sheets/api)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-ff9800)](https://firebase.google.com/products/cloud-messaging)
[![Service Worker](https://img.shields.io/badge/Service%20Worker-v1.1.0-blue)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

🌟 주요 특징

🏢 연수원별 맞춤 정보: 이천, 용인, 인천 연수원별 실시간 일정 제공
📋 프로그램별 상세 가이드: Vision Building, 기념관 Tour, 1:1 면담 등 6개 프로그램
📱 완전한 PWA: 앱 설치, 오프라인 동작, 백그라운드 동기화
🔔 Firebase 푸시 알림: 실시간 업무 알림, 일정 리마인더
📊 Google Sheets 연동: Apps Script를 통한 실시간 데이터 동기화
🔄 3단계 Fallback: 온라인 → 캐시 → 오프라인 순서로 안정적 서비스
📲 모바일 최적화: 터치 친화적 UI, 삼성 인터넷 호환

🚀 빠른 시작
1. 프로젝트 클론 및 설정
bashgit clone https://github.com/your-username/sk-mentor-guide.git
cd sk-mentor-guide
2. 로컬 개발 서버 실행
bash# Python 3.x (간단한 테스트용)
python -m http.server 8000

# Node.js (권장 - HTTPS 지원)
npx serve . --ssl-cert cert.pem --ssl-key key.pem

# VS Code Live Server 확장 (권장)
# HTTPS 모드로 실행 (PWA 테스트 필수)
3. 브라우저에서 접속
https://localhost:8000  # HTTPS 필수 (PWA, Push 알림)
4. PWA 설치 및 테스트

브라우저에서 "홈 화면에 추가" 또는 "앱 설치"
알림 권한 허용
오프라인 모드 테스트

📁 완전한 프로젝트 구조
sk-mentor-guide/
├── 📄 index.html                           # 메인 대시보드
├── 📄 setup.html                           # 연수원 선택 화면
├── 📄 manifest.json                        # PWA 매니페스트 (shortcuts 포함)
├── 📄 sw.js                               # 메인 서비스 워커 (캐시, 알림)
├── 📄 firebase-messaging-sw.js             # Firebase 전용 서비스 워커
│
├── 📁 assets/
│   ├── 📁 js/
│   │   ├── 📄 app.js                      # 메인 앱 로직 (Google Sheets 연동)
│   │   ├── 📄 utils.js                    # 유틸리티 함수 (날짜, 애니메이션 등)
│   │   ├── 📄 config-manager.js           # 하이브리드 설정 관리 시스템
│   │   └── 📄 push-notification.js        # Firebase FCM 푸시 알림 관리
│   │
│   ├── 📁 css/
│   │   ├── 📄 main-v2.1.css              # 메인 스타일시트 (알림 UI 포함)
│   │   └── 📄 guide.css                  # 가이드 페이지 전용 스타일
│   │
│   └── 📁 images/                         # PWA 아이콘 (다중 해상도)
│       ├── 📄 icon-72.png                # 72x72 (최소)
│       ├── 📄 icon-96.png                # 96x96
│       ├── 📄 icon-128.png               # 128x128
│       ├── 📄 icon-144.png               # 144x144
│       ├── 📄 icon-152.png               # 152x152 (iOS)
│       ├── 📄 icon-192.png               # 192x192 (표준)
│       ├── 📄 icon-384.png               # 384x384
│       ├── 📄 icon-512.png               # 512x512 (최대)
│       └── 📄 screenshot-mobile.png      # PWA 스크린샷
│
├── 📁 guides/                             # 프로그램별 상세 가이드
│   ├── 📄 vision-building.html            # Vision Building (자기소개)
│   ├── 📄 memorial-tour.html              # 기념관 Tour (스토리텔링)
│   ├── 📄 daily-opening.html              # Daily Opening (비즈매너)
│   ├── 📄 interview.html                  # 1:1 면담 (질문 리스트)
│   ├── 📄 growth-roadmap.html             # 성장 Roadmap (커리어)
│   └── 📄 play-skms.html                 # Play SKMS (게임 피드백)
│
├── 📁 data/
│   └── 📄 config.json                    # 기본 설정 (오프라인 백업)
│
└── 📁 docs/                              # 프로젝트 문서
    ├── 📄 README.md                       # 이 파일
    ├── 📄 DEPLOYMENT.md                   # 배포 가이드
    └── 📄 API.md                          # 데이터 구조 설명
🔧 기술 스택 상세
📱 Frontend Core

HTML5: 시맨틱 마크업, PWA 메타태그, Web App Manifest
CSS3: CSS Grid, Flexbox, CSS Variables, 복잡한 애니메이션
JavaScript (ES6+): Modules, Classes, Async/Await, Dynamic Imports

🌐 Backend Integration

Google Sheets API: Apps Script 웹앱을 통한 실시간 CRUD
Google Apps Script: 서버리스 백엔드, CORS 처리
Firebase Cloud Messaging: 크로스 플랫폼 푸시 알림

📲 PWA 기술 스택
javascript// Service Worker 아키텍처
├── sw.js                    // 메인 SW (캐시, 백그라운드 동기화)
├── firebase-messaging-sw.js // FCM 전용 SW (백그라운드 알림)
└── assets/js/
    ├── push-notification.js // 포그라운드 알림, 권한 관리
    └── config-manager.js    // 하이브리드 설정 로딩
💾 데이터 관리 아키텍처
🔄 3단계 Fallback System:
1️⃣ Google Sheets (실시간) ───► Apps Script API
    ↓ 실패시
2️⃣ localStorage 캐시 ────► 5분 TTL, 24시간 백업
    ↓ 실패시  
3️⃣ config.json (정적) ───► 기본값, 오프라인 백업
🔔 Firebase 푸시 알림 시스템
📋 구현 파일
파일역할설명push-notification.jsFCM 초기화 & 토큰 관리권한 요청, 포그라운드 알림firebase-messaging-sw.js백그라운드 알림 처리앱이 닫혀도 알림 수신sw.jsPWA 네이티브 알림Firebase 없이도 로컬 알림index.htmlUI 통합알림 배너, 상태 표시
🔑 Firebase 설정 (실제 프로젝트 정보)
javascriptconst firebaseConfig = {
  apiKey: "AIzaSyDubt0Ool50-nQGYOCk1nNm8Xu4mDij3PY",
  authDomain: "sk-mentor-guide.firebaseapp.com",
  projectId: "sk-mentor-guide",
  storageBucket: "sk-mentor-guide.firebasestorage.app",
  messagingSenderId: "474747639627",
  appId: "1:474747639627:web:9d7e6f4f7a37395a39bace"
};
📲 알림 플로우
mermaidgraph LR
A[사용자 접속] --> B[권한 요청]
B --> C[FCM 토큰 생성]
C --> D[서버에 토큰 저장]
D --> E[Google Sheets 업데이트]
E --> F[자동 알림 트리거]
F --> G[Firebase FCM]
G --> H[디바이스 알림 표시]
📊 Google Sheets 연동 상세
🔗 Apps Script API
javascript// 실제 배포된 웹앱 URL
const scriptUrl = 'https://script.google.com/macros/s/AKfycbyvkEufshC8wwQwMqO5nJsdhhUC6EvBqKkeXVR5YF5cQnnPLUG3oo5d0eObTVkjN55Y/exec';

// 지원 액션
├── getSchedule     // 일정 데이터 조회
├── getConfig      // 설정 데이터 조회  
├── updateStatus   // 출석/면담 상태 업데이트
└── sendNotification // 푸시 알림 전송
📈 데이터 캐시 전략
javascript// config-manager.js의 하이브리드 로딩
class ConfigManager {
  async loadConfig() {
    try {
      return await this.loadOnlineConfig();    // 1차: 온라인
    } catch {
      return this.loadCachedConfig() ||        // 2차: 캐시
             this.loadBaseConfig();            // 3차: 정적
    }
  }
}
🎨 주요 컴포넌트 상세
🏠 메인 대시보드 (index.html)
html<!-- 핵심 섹션들 -->
├── 🔔 알림 권한 배너          # Firebase FCM 설정
├── 📊 오늘의 할 일           # 출석체크, 면담 상태
├── 📅 실시간 일정            # Google Sheets 연동
├── 🚀 프로그램 가이드 카드    # 6개 프로그램 바로가기  
├── 💡 멘토 핵심 원칙         # 접을 수 있는 가이드라인
└── 📞 연수원별 연락처        # 응급상황 대응
⚙️ 연수원 선택 (setup.html)

🎨 애니메이션 배경: CSS 그라디언트 + 플로팅 요소
🏢 3개 연수원: 이천, 용인, 인천 카드 선택
💾 영구 저장: localStorage + 세션 유지
🔄 자동 리다이렉트: 선택 완료 시 메인으로 이동

📖 프로그램 가이드 시리즈
가이드HTML 파일주요 내용특별 기능Vision Buildingvision-building.html자기소개, 팀빌딩, 아이스브레이킹체크리스트, 질문 예시기념관 Tourmemorial-tour.htmlSK 히스토리, 스토리텔링 스크립트핵심 포인트, 시간 관리Daily Openingdaily-opening.html비즈니스 매너, 에너지 충전진행법, 주의사항1:1 면담interview.html개별 멘토링, 질문 기법상황별 대응, 기록 양식성장 Roadmapgrowth-roadmap.html커리어 가이던스, 강점 분석로드맵 템플릿Play SKMSplay-skms.html게임 관찰, 피드백 기법관찰 포인트, 점수 기준
📱 PWA 기능 완전 가이드
✅ 구현된 PWA 기능
기능상태파일설명🏠 설치 가능✅manifest.json홈 화면 추가, 앱 아이콘🔌 오프라인 지원✅sw.js캐시 전략, 네트워크 fallback🔔 푸시 알림✅firebase-messaging-sw.jsFirebase FCM🔄 백그라운드 동기화✅sw.js자동 데이터 업데이트⚡ 빠른 로딩✅sw.js리소스 프리캐싱🎯 앱 바로가기✅manifest.json출석체크, 면담 바로가기
📋 PWA 매니페스트 상세
json{
  "name": "슬기로운 멘토생활",
  "short_name": "SK 멘토",
  "start_url": "/?v=2",
  "display": "standalone",
  "theme_color": "#1976d2",
  "icons": [
    { "src": "/assets/images/icon-72.png", "sizes": "72x72" },
    { "src": "/assets/images/icon-192.png", "sizes": "192x192" },
    { "src": "/assets/images/icon-512.png", "sizes": "512x512" }
  ],
  "shortcuts": [
    { "name": "출석체크", "url": "/guides/attendance.html" },
    { "name": "1:1 면담", "url": "/guides/interview.html" }
  ]
}
📱 플랫폼별 설치 가이드
bash# Android Chrome
메뉴 → "홈 화면에 추가" → "설치"

# iOS Safari  
공유 버튼 → "홈 화면에 추가"

# Desktop Chrome
주소창 오른쪽 설치 아이콘 클릭

# Samsung Internet
메뉴 → "페이지를 추가" → "앱으로 추가"
🚀 배포 및 운영 가이드
🌟 Netlify (권장) - PWA 최적화
yaml# netlify.toml
[build]
  publish = "."
  
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"
    
[[headers]]
  for = "/firebase-messaging-sw.js"  
  [headers.values]
    Cache-Control = "no-cache"
    
[[headers]]
  for = "/*.html"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
⚡ Vercel - Edge Functions 지원
json{
  "functions": {
    "api/notifications.js": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
📄 GitHub Pages - 정적 호스팅
bash# GitHub Actions 워크플로우
name: Deploy PWA
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
🔐 환경 설정 상세
🔑 Firebase 프로젝트 설정

Firebase Console에서 새 프로젝트 생성
Authentication > Sign-in method > Anonymous 활성화
Cloud Messaging > Web configuration 설정
VAPID 키 생성 및 복사
도메인 승인 (프로덕션 도메인 추가)

📊 Google Sheets + Apps Script 설정
javascript// Apps Script doGet 함수 예제
function doGet(e) {
  const action = e.parameter.action;
  
  switch(action) {
    case 'getSchedule':
      return getScheduleData();
    case 'getConfig':
      return getConfigData();  
    case 'updateStatus':
      return updateStatusData(e.parameter);
    default:
      return ContentService.createTextOutput('Invalid action');
  }
}
🌐 CORS 및 보안 설정
javascript// sw.js에서 CORS 처리
self.addEventListener('fetch', event => {
  if (event.request.url.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request, {
        mode: 'cors',
        credentials: 'omit'
      })
    );
  }
});
🛠️ 개발 가이드
📝 코드 스타일 가이드
javascript// ES6+ 모듈 구조
class AppComponent {
  constructor() {
    this.init();
  }
  
  async init() {
    try {
      await this.loadData();
      this.render();
    } catch (error) {
      this.handleError(error);
    }
  }
}

// 에러 핸들링 필수
const handleApiError = (error) => {
  console.error('[API Error]:', error);
  showToast('데이터를 불러올 수 없습니다.', 'error');
};
🔧 커스터마이징 가이드
javascript// 1. 새 연수원 추가
const centerMap = {
  'icheon': '이천',
  'yongin': '용인', 
  'incheon': '인천',
  'busan': '부산'  // 새 연수원 추가
};

// 2. 새 프로그램 가이드 추가
// guides/new-program.html 생성
// index.html의 프로그램 카드 섹션에 추가

// 3. 푸시 알림 커스터마이징
const notificationSchedule = {
  '08:50': '오전 출석체크 10분 전',
  '12:50': '오후 출석체크 10분 전',
  '17:30': '면담 결과 입력 알림'
};
🐛 디버깅 도구
javascript// 개발자 도구에서 실행 가능한 유틸리티
window.debugUtils = {
  clearCache: () => {
    localStorage.clear();
    caches.delete('sk-mentor-guide-v1.1.0');
    location.reload();
  },
  
  testNotification: () => {
    new Notification('테스트 알림', {
      body: '푸시 알림이 정상 작동합니다.',
      icon: '/assets/images/icon-192.png'
    });
  },
  
  getStorageInfo: () => {
    console.table({
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
      indexedDB: 'Check Application tab'
    });
  }
};
📊 성능 최적화
⚡ 로딩 성능

Critical CSS: 인라인 스타일로 초기 렌더링 최적화
Resource Hints: preload, prefetch 적극 활용
Image Optimization: WebP 포맷, 다중 해상도 지원
Service Worker: 적극적 캐싱 + 네트워크 fallback

📱 모바일 성능
css/* Touch-friendly 디자인 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* 부드러운 스크롤 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* 배터리 최적화 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
🔋 배터리 최적화

알림 주기: 사용자 활동 패턴 기반 스마트 전송
캐시 전략: 불필요한 네트워크 요청 최소화
애니메이션: prefers-reduced-motion 지원

🎯 향후 개발 로드맵
🚧 v2.0 계획 (2025 Q2)

 🌙 다크 모드: 시스템 설정 연동
 🎤 음성 안내: Web Speech API 활용
 📊 실시간 대시보드: WebSocket 연결
 💬 멘토 채팅: Firebase Realtime Database
 📈 분석 시스템: Google Analytics 4 연동

🚀 v3.0 비전 (2025 Q4)

 🤖 AI 멘토 어시스턴트: GPT API 연동
 🎮 게임화: 포인트, 배지 시스템
 📱 네이티브 앱: React Native 포팅
 🌍 다국어 지원: i18n 국제화
 🔐 SSO 연동: 기업 계정 통합

🤝 기여 가이드
🛠️ 개발 참여 프로세스

Fork 이 저장소
Feature 브랜치 생성: git checkout -b feature/push-notification-v2
코드 작성 + 테스트 완료
커밋: git commit -m "feat: Add advanced push notification scheduling"
푸시: git push origin feature/push-notification-v2
Pull Request 생성 + 코드 리뷰

📋 코드 리뷰 체크리스트

 ✅ PWA 호환성: Lighthouse 점수 90+ 유지
 🔔 알림 테스트: 다양한 브라우저에서 동작 확인
 📱 모바일 최적화: Touch target 44px+ 준수
 🔧 에러 핸들링: Try-catch 블록 + 사용자 피드백
 📊 성능 검증: Core Web Vitals 기준 통과

🐛 버그 리포트 템플릿
markdown## 🐛 버그 설명
간단한 버그 설명

## 🔄 재현 단계
1. '...' 페이지로 이동
2. '...' 버튼 클릭
3. 오류 발생

## 📱 환경 정보
- 브라우저: Chrome 119
- OS: Android 14
- 디바이스: Galaxy S23
- PWA 설치: Yes/No

## 📋 기대 결과
정상적으로 동작해야 할 내용

## 📸 스크린샷
(선택사항)
📝 라이선스 및 저작권
이 프로젝트는 SK그룹 내부 교육용으로 제작되었습니다.

코드: MIT License (오픈소스 기여 환영)
디자인: SK 브랜드 가이드라인 기반
컨텐츠: SK아카데미 저작권

👥 개발팀 및 기여자
🏗️ 핵심 개발팀

🔧 풀스택 개발: SK아카데미 최유현 RF

Google Sheets API 연동
Firebase FCM 푸시 알림
PWA 아키텍처 설계


📋 콘텐츠 제작: SK아카데미 '25년 신입구성원과정 TF

멘토 프로그램 설계
교육 콘텐츠 작성


🕹️ 사용자 경험 기획: SK아카데미 최유현 RF

사용자 경험 기획
모바일 UX 최적화
웹 기반 접속 이원화 반영


🎨 UI/UX 디자인: SK 브랜드 가이드라인 기반

모바일 최적화 디자인
접근성 고려 인터페이스
SK 브랜드 컬러 시스템


📞 문의 및 지원
💻 기술 관련 문의

이메일: eunoia@sk.com
GitHub Issues: 문제 신고

📚 교육 내용 문의

담당팀: SK아카데미 멘토양성과정 운영팀
담당자: SK아카데미 최유현 RF
이메일: eunoia@sk.com
