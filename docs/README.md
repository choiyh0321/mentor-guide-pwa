# 🎯 SK 멘토 가이드

2025년 1월 SK그룹 신입구성원과정 멘토를 위한 모바일 웹앱

## 📱 주요 기능

- **연수원별 맞춤 정보**: 이천, 용인, 인천 연수원별 다른 일정과 정보 제공
- **프로그램별 상세 가이드**: Vision Building, 기념관 Tour, 1:1 면담 등
- **PWA 지원**: 홈 화면 추가, 오프라인 사용 가능
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원
- **실시간 일정**: 연수원별 오늘의 일정 및 멘토 프로그램 표시

## 🚀 빠른 시작

### 1. 파일 다운로드
```bash
git clone https://github.com/your-username/sk-mentor-guide.git
cd sk-mentor-guide
```

### 2. 로컬 서버 실행
```bash
# Python 3.x
python -m http.server 8000

# Node.js가 있는 경우
npx serve .

# VS Code Live Server 확장 사용 권장
```

### 3. 브라우저에서 접속
```
http://localhost:8000
```

## 📁 프로젝트 구조

```
sk-mentor-guide/
├── 📄 index.html                    # 메인 대시보드
├── 📄 setup.html                    # 연수원 선택 화면
├── 📄 manifest.json                 # PWA 매니페스트
├── 📄 sw.js                        # 서비스 워커
│
├── 📁 data/
│   └── 📄 config.json              # 연수원별 설정 데이터
│
├── 📁 guides/                      # 프로그램별 가이드
│   ├── 📄 vision-building.html     # Vision Building 가이드
│   ├── 📄 memorial-tour.html       # 기념관 Tour 가이드
│   ├── 📄 daily-opening.html       # Daily Opening 가이드
│   ├── 📄 interview.html           # 1:1 면담 가이드
│   ├── 📄 growth-roadmap.html      # 성장 Roadmap 가이드
│   └── 📄 play-skms.html          # Play SKMS 가이드
│
├── 📁 assets/
│   ├── 📁 js/
│   │   ├── 📄 app.js              # 메인 앱 로직
│   │   ├── 📄 storage.js          # 로컬 스토리지 관리
│   │   └── 📄 utils.js            # 유틸리티 함수
│   │
│   ├── 📁 css/
│   │   ├── 📄 main.css            # 공통 스타일
│   │   └── 📄 guide.css           # 가이드 페이지 스타일
│   │
│   └── 📁 images/
│       ├── 📄 icon-192.png        # PWA 아이콘
│       └── 📄 icon-512.png        # PWA 아이콘
│
└── 📁 docs/                       # 문서
    ├── 📄 README.md               # 이 파일
    ├── 📄 DEPLOYMENT.md           # 배포 가이드
    └── 📄 API.md                  # 데이터 구조 설명
```

## 🎨 주요 컴포넌트

### 1. 연수원 선택 (setup.html)
- 3개 연수원 중 선택: 이천, 용인, 인천
- 선택된 연수원에 따라 맞춤형 정보 제공
- 선택 정보는 localStorage에 저장

### 2. 메인 대시보드 (index.html)
- 오늘의 일정 표시
- 오늘의 멘토 프로그램 하이라이트
- 프로그램별 빠른 접근 카드
- 멘토 핵심 원칙
- 담당자 연락처

### 3. 프로그램 가이드 (guides/*.html)
- **Vision Building**: 자기소개 & 팀빌딩 가이드
- **기념관 Tour**: 스토리텔링 스크립트 & 핵심 포인트
- **Daily Opening**: Biz. Manner 포함 진행법
- **1:1 면담**: 질문 예시 & 상황별 대응법
- **성장 Roadmap**: 강점 기반 로드맵 작성법
- **Play SKMS**: 게임 관찰 포인트 & 피드백 방법

## 💾 데이터 구조

### config.json
```json
{
  "trainingCenters": {
    "icheon": {
      "name": "이천 FMI인재개발원",
      "todaySchedule": [...],
      "todayMentorProgram": {...},
      "facilities": {...}
    }
  }
}
```

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PWA**: Service Worker, Web App Manifest
- **Storage**: localStorage (오프라인 지원)
- **Design**: 반응형 CSS Grid/Flexbox
- **Icons**: Emoji + Custom SVG

## 📱 PWA 기능

- ✅ 홈 화면에 추가 가능
- ✅ 오프라인 사용 지원
- ✅ 푸시 알림 준비 (향후 확장)
- ✅ 백그라운드 동기화
- ✅ 앱 업데이트 알림

## 🚀 배포 방법

### Netlify (권장)
1. GitHub에 코드 푸시
2. Netlify에서 저장소 연결
3. 자동 배포 설정

### Vercel
1. GitHub에 코드 푸시
2. Vercel에서 Import
3. 자동 배포

### GitHub Pages
1. Settings > Pages
2. Source: Deploy from a branch
3. Branch: main / root

## 🔒 보안 고려사항

- HTTPS 필수 (PWA 요구사항)
- CSP (Content Security Policy) 적용 권장
- 민감한 정보는 클라이언트에 저장하지 않음

## 📊 분석 & 모니터링

### Google Analytics 연동 (선택사항)
```html
<!-- index.html에 추가 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 문제 해결

### 서비스 워커 업데이트 안됨
```javascript
// 개발자 도구 > Application > Service Workers
// "Update on reload" 체크
// 또는 캐시 강제 삭제
app.clearCache();
```

### 로컬 스토리지 초기화
```javascript
// 브라우저 개발자 도구에서 실행
localStorage.clear();
location.reload();
```

## 🎯 향후 개선 계획

- [ ] 다크 모드 지원
- [ ] 음성 안내 기능
- [ ] 체크리스트 진행률 추적
- [ ] 멘토 간 소통 채널


## 📝 라이선스

이 프로젝트는 SK그룹 내부 교육용으로 제작되었습니다.

## 👥 기여자

- **개발**: SK아카데미 최유현 RF
- **기획**: SK아카데미 '25년 신입구성원과정 TF
- **디자인**: SK 브랜드 가이드라인 기반

## 📞 문의

- **기술 문의**: SK아카데미 최유현 RF
- **내용 문의**: SK아카데미 멘토양성과정 운영팀

---

Made with ❤️ for SK Mentors