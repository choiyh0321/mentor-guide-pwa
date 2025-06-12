// Firebase 메시징 서비스 워커
// 파일명: firebase-messaging-sw.js (웹사이트 루트에 저장)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDubt0Ool50-nQGYOCk1nNm8Xu4mDij3PY",
    authDomain: "sk-mentor-guide.firebaseapp.com",
    projectId: "sk-mentor-guide",
    storageBucket: "sk-mentor-guide.firebasestorage.app",
    messagingSenderId: "474747639627",
    appId: "1:474747639627:web:9d7e6f4f7a37395a39bace",
    measurementId: "G-0CSMF3K8BK"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// 메시징 인스턴스 가져오기
const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

    const notificationTitle = payload.notification?.title || 'SK 멘토 가이드';
    const notificationOptions = {
        body: payload.notification?.body || '새로운 알림이 있습니다.',
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/icon-192.png',
        tag: 'sk-mentor-notification',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: {
            url: payload.data?.url || '/',
            clickAction: payload.data?.clickAction || 'default',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: '확인하기',
                icon: '/assets/images/icon-192.png'
            },
            {
                action: 'close',
                title: '닫기'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] 알림 클릭:', event);
    
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // 앱 열기
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function(clientList) {
            // 이미 열린 SK 멘토 가이드 탭이 있으면 포커스
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

// 서비스 워커 설치
self.addEventListener('install', function(event) {
    console.log('[firebase-messaging-sw.js] 서비스 워커 설치');
    self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', function(event) {
    console.log('[firebase-messaging-sw.js] 서비스 워커 활성화');
    event.waitUntil(self.clients.claim());
});

console.log('[firebase-messaging-sw.js] Firebase 메시징 서비스 워커 로드 완료');