// 서비스 워커 버전
const CACHE_NAME = 'sk-mentor-guide-v1.0.3';
const APP_PREFIX = 'sk-mentor-';

// 캐시할 파일들
const urlsToCache = [
  '/',
  '/index.html',
  '/setup.html',
  '/data/config.json',
  '/guides/vision-building.html',
  '/guides/memorial-tour.html',
  '/guides/daily-opening.html',
  '/guides/interview.html',
  '/guides/growth-roadmap.html',
  '/guides/play-skms.html',
  '/assets/css/main.css',
  '/assets/css/guide.css',
  '/assets/js/app.js',
  '/assets/js/storage.js',
  '/assets/js/utils.js',
  // 아이콘들
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  // 폰트 (구글 폰트는 별도 처리)
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap'
];

// 설치 이벤트
self.addEventListener('install', event => {
  console.log('[SW] 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 파일들을 캐시에 저장 중...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] 모든 파일이 캐시되었습니다.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] 캐시 저장 실패:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('[SW] 활성화 중...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 이전 버전의 캐시 삭제
          if (cacheName.startsWith(APP_PREFIX) && cacheName !== CACHE_NAME) {
            console.log('[SW] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] 활성화 완료');
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Chrome extension 요청 무시
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // GET 요청만 처리
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
  fetch(request)
    .then(response => {
      // 네트워크 성공시 캐시 업데이트
      if (response && response.status === 200 && response.type === 'basic') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (shouldCache(request.url)) {
            cache.put(request, responseToCache);
          }
        });
      }
      return response;
    })
    .catch(() => {
      // 네트워크 실패시에만 캐시 사용
      return caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          throw error;
        });
    })
);

// 캐시할 파일인지 확인
function shouldCache(url) {
  const cacheableExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.json'];
  const urlObj = new URL(url);
  
  // 같은 도메인의 파일만 캐시
  if (urlObj.origin !== location.origin) {
    return false;
  }
  
  // 확장자 확인
  return cacheableExtensions.some(ext => urlObj.pathname.endsWith(ext));
}

// 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] 백그라운드 동기화 실행');
    event.waitUntil(
      // 여기서 오프라인 중에 저장된 데이터를 서버로 전송
      syncOfflineData()
    );
  }
});

// 오프라인 데이터 동기화 함수
async function syncOfflineData() {
  try {
    // localStorage에서 오프라인 중에 저장된 데이터 가져오기
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
    
    if (offlineData.length > 0) {
      console.log('[SW] 오프라인 데이터 동기화:', offlineData.length, '건');
      
      // 실제 구현시에는 서버 API로 전송
      // await fetch('/api/sync', {
      //   method: 'POST',
      //   body: JSON.stringify(offlineData)
      // });
      
      // 동기화 완료 후 로컬 데이터 삭제
      localStorage.removeItem('offlineData');
    }
  } catch (error) {
    console.error('[SW] 오프라인 데이터 동기화 실패:', error);
  }
}

// 푸시 알림 (향후 확장용)
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/assets/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/assets/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    // 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 메시지 처리 (앱과 서비스 워커 간 통신)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // 캐시 업데이트 요청
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] 캐시 업데이트 완료');
    });
  }
});

console.log('[SW] 서비스 워커 로드 완료');
