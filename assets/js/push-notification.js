// 푸시 알림 관리 모듈
// 파일명: assets/js/push-notification.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

class PushNotificationManager {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('푸시 알림이 지원되지 않는 브라우저입니다.');
      return;
    }

    try {
      // Firebase 설정 (Firebase 콘솔에서 복사)
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
      const app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(app);

      // 포그라운드 메시지 처리
      onMessage(this.messaging, (payload) => {
        console.log('포그라운드 메시지 수신:', payload);
        this.showForegroundNotification(payload);
      });

      // 저장된 토큰 확인
      const savedToken = localStorage.getItem('fcm-token');
      if (savedToken) {
        this.token = savedToken;
        console.log('저장된 FCM 토큰:', this.token);
      }

    } catch (error) {
      console.error('Firebase 초기화 실패:', error);
    }
  }

  // 알림 권한 요청 및 토큰 획득
  async requestPermission() {
    if (!this.isSupported || !this.messaging) {
      throw new Error('푸시 알림이 지원되지 않습니다.');
    }

    try {
      // 알림 권한 요청
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('알림 권한이 거부되었습니다.');
      }

      // FCM 토큰 획득
      const token = await getToken(this.messaging, {
        vapidKey: 'BApyOxrl4CLNL2LwaGBE9oIddaWP1s70TzOCpadIDt9FN3mWa4ZxYzlMy8U5RCITCV34DKafqNd2SpDRmo-TNnI' // Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징에서 생성
      });

      if (token) {
        this.token = token;
        localStorage.setItem('fcm-token', token);
        console.log('FCM 토큰 획득:', token);
        
        // 서버에 토큰 전송 (실제 구현시)
        await this.sendTokenToServer(token);
        
        return token;
      } else {
        throw new Error('FCM 토큰을 가져올 수 없습니다.');
      }

    } catch (error) {
      console.error('푸시 알림 권한 요청 실패:', error);
      throw error;
    }
  }

  // 서버에 토큰 전송 (실제 구현시 서버 API 호출)
  async sendTokenToServer(token) {
    try {
          // 🆕 연수원 정보 가져오기 (3줄 추가)
      const selectedCenter = localStorage.getItem('selectedCenter');
      const config = await configManager.loadConfig();
      const centerInfo = config.trainingCenters[selectedCenter];
      
      // 실제 구현시에는 서버 API로 토큰 전송
      console.log('서버에 토큰 전송:', token);
    
    // 🆕 기존 코드에 연수원 정보만 추가
    const tokenData = {
      token: token,
      campus: selectedCenter,           // 🆕 연수원 ID
      topic: centerInfo?.pushTopic,     // 🆕 푸시 토픽
      userId: this.getCurrentUserId(),
      deviceInfo: this.getDeviceInfo()
    };
    
    console.log('전송할 데이터:', tokenData);
    
      // 예시:
      // const response = await fetch('/api/register-token', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     token: token,
      //     userId: this.getCurrentUserId(), // 현재 사용자 ID
      //     deviceInfo: this.getDeviceInfo()
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('토큰 등록 실패');
      // }
      
    } catch (error) {
      console.error('토큰 서버 전송 실패:', error);
    }
  }

  // 포그라운드 알림 표시
  showForegroundNotification(payload) {
    const { notification, data } = payload;
    
    // 커스텀 알림 UI 표시 (앱이 열려있을 때)
    this.showCustomNotification({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/assets/images/icon-192.png',
      data: data
    });
  }

  // 커스텀 알림 UI
  showCustomNotification({ title, body, icon, data }) {
    // 기존 알림이 있으면 제거
    const existingNotification = document.getElementById('custom-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // 알림 컨테이너 생성
    const notification = document.createElement('div');
    notification.id = 'custom-notification';
    notification.className = 'custom-notification show';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <img src="${icon}" alt="알림">
        </div>
        <div class="notification-text">
          <div class="notification-title">${title}</div>
          <div class="notification-body">${body}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    // 클릭 이벤트
    notification.addEventListener('click', (e) => {
      if (!e.target.closest('.notification-close')) {
        if (data && data.url) {
          window.location.href = data.url;
        }
        notification.remove();
      }
    });

    // 페이지에 추가
    document.body.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // 알림 상태 확인
  getNotificationStatus() {
    if (!this.isSupported) {
      return 'not-supported';
    }
    return Notification.permission;
  }

  // 토큰 새로고침
  async refreshToken() {
    if (!this.messaging) return null;

    try {
      const newToken = await getToken(this.messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });
      
      if (newToken && newToken !== this.token) {
        this.token = newToken;
        localStorage.setItem('fcm-token', newToken);
        await this.sendTokenToServer(newToken);
        console.log('토큰 새로고침:', newToken);
      }
      
      return newToken;
    } catch (error) {
      console.error('토큰 새로고침 실패:', error);
      return null;
    }
  }

  // 현재 사용자 ID 가져오기 (실제 구현에 맞게 수정)
  getCurrentUserId() {
    // 실제로는 로그인된 사용자 정보에서 가져오기
    return localStorage.getItem('userId') || 'anonymous';
  }

  // 디바이스 정보 가져오기
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString()
    };
  }
}

// CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
  .custom-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    border: 1px solid rgba(0,0,0,0.08);
    max-width: 400px;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .custom-notification.show {
    transform: translateX(0);
  }

  .notification-content {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
    cursor: pointer;
  }

  .notification-icon img {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .notification-text {
    flex: 1;
    min-width: 0;
  }

  .notification-title {
    font-weight: 600;
    font-size: 14px;
    color: #1a1a1a;
    margin-bottom: 4px;
    line-height: 1.3;
  }

  .notification-body {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
    word-break: break-word;
  }

  .notification-close {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .notification-close:hover {
    background: #f5f5f5;
    color: #666;
  }

  @media (max-width: 480px) {
    .custom-notification {
      left: 16px;
      right: 16px;
      max-width: none;
      top: 16px;
    }
  }
`;
document.head.appendChild(style);

// 전역 객체로 내보내기
window.PushNotificationManager = PushNotificationManager;