// 서비스 워커 버전
const CACHE_NAME = 'sk-mentor-guide-v1.0.4';
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
  '/assets/js/push-notification.js', // 새로 추가
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
      .catch((error) => {
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
});

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

// 백그라운드 동기화
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] 백그라운드 동기화 실행');
    event.waitUntil(
      syncOfflineData()
    );
  }
});

// 오프라인 데이터 동기화 함수
async function syncOfflineData() {
  try {
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

  // 푸시 알림 토큰 등록
  if (event.data && event.data.type === 'REGISTER_PUSH_TOKEN') {
    const { token, userId } = event.data;
    console.log('[SW] 푸시 토큰 등록:', token);
    
    // 실제 구현시에는 서버에 토큰 저장
    // registerPushToken(token, userId);
  }
});

// 푸시 토큰 등록 함수 (향후 서버 연동용)
async function registerPushToken(token, userId) {
  try {
    // 서버에 토큰 등록
    // const response = await fetch('/api/register-push-token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     token: token,
    //     userId: userId,
    //     timestamp: new Date().toISOString()
    //   })
    // });
    
    console.log('[SW] 푸시 토큰이 서버에 등록되었습니다.');
  } catch (error) {
    console.error('[SW] 푸시 토큰 등록 실패:', error);
  }
}

// 알림 표시 헬퍼 함수
function showNotification(title, options = {}) {
  const defaultOptions = {
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/icon-192.png',
    tag: 'sk-mentor-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: '확인하기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  return self.registration.showNotification(title, finalOptions);
}

// 클라이언트에게 메시지 전송
function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

// 알림 스케줄링 (예: 교육 시작 30분 전 알림)
function scheduleNotification(title, body, triggerTime, data = {}) {
  const now = Date.now();
  const delay = triggerTime - now;
  
  if (delay > 0) {
    setTimeout(() => {
      showNotification(title, {
        body: body,
        data: data
      });
    }, delay);
    
    console.log(`[SW] 알림 예약됨: ${new Date(triggerTime).toLocaleString()}`);
  }
}

// 교육 일정 알림 설정 (예시)
function setupEducationAlerts() {
  // 실제 구현시에는 교육 일정 데이터를 기반으로 알림 설정
  const alerts = [
    {
      title: 'SK 멘토 가이드',
      body: '오늘의 Vision Building 세션이 30분 후 시작됩니다.',
      time: new Date().getTime() + (30 * 60 * 1000), // 30분 후
      data: { url: '/guides/vision-building.html' }
    }
  ];
  
  alerts.forEach(alert => {
    scheduleNotification(alert.title, alert.body, alert.time, alert.data);
  });
}

console.log('[SW] 서비스 워커 로드 완료 - 푸시 알림 지원');

// Firebase 메시징이 있는지 확인하고 없으면 기본 푸시 처리
if (!self.firebase) {
  // Firebase 없이 기본 푸시 처리
  self.addEventListener('push', event => {
    if (!event.data) return;

    try {
      const data = event.data.json();
      const title = data.title || 'SK 멘토 가이드';
      const options = {
        body: data.body || '새로운 알림이 있습니다.',
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/icon-192.png',
        tag: 'sk-mentor-notification',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: [
          {
            action: 'open',
            title: '확인하기'
          },
          {
            action: 'close',
            title: '닫기'
          }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (error) {
      console.error('[SW] 푸시 데이터 파싱 실패:', error);
    }
  });

  // 알림 클릭 처리
  self.addEventListener('notificationclick', event => {
    console.log('[SW] 알림 클릭:', event);
    event.notification.close();

    if (event.action === 'close') {
      return;
    }

    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(clientList => {
        // 이미 열린 창이 있으면 포커스
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });
}
