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

  // 🧪 테스트 모드 감지 메서드
  isTestMode() {
    return localStorage.getItem('testMode') === 'true';
  }

  // 🎯 테스트용 토픽명 생성
  getTestTopicName(centerName) {
    return `test-campus-${centerName}`;
  }

  // 🎯 운영용 토픽명 생성
  getProductionTopicName(centerName) {
    return `campus-${centerName}`;
  }

  // 🎯 현재 모드에 맞는 토픽명 반환
  getTopicName(centerName) {
    return this.isTestMode() 
      ? this.getTestTopicName(centerName)
      : this.getProductionTopicName(centerName);
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
    const selectedCenter = localStorage.getItem('selectedCenter');
    const isTest = this.isTestMode();
    
    // 🧪 모드별 로깅
    if (isTest) {
      console.log('🧪 테스트 모드: 토픽 구독 기능 활성화');
      console.log('📍 선택된 연수원:', selectedCenter);
      console.log('🎯 토픽명:', this.getTopicName(selectedCenter));
    } else {
      console.log('🏢 일반 모드: 기존 방식 유지');
      console.log('📍 선택된 연수원:', selectedCenter);
    }
    
    console.log('📤 서버에 토큰 전송:', token.substring(0, 20) + '...');
    
    // 🧪 테스트 모드에서만 토픽 구독 기능 활성화
    if (isTest && selectedCenter) {
      await this.subscribeToTopic(token, selectedCenter);
    }
    
    // 서버에 전송할 데이터 구성
    const tokenData = {
      token: token,
      campus: selectedCenter,
      testMode: isTest,  // 🧪 테스트 모드 정보 포함
      topicName: this.getTopicName(selectedCenter), // 🎯 토픽명 포함
      userId: this.getCurrentUserId(),
      deviceInfo: this.getDeviceInfo(),
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 전송할 데이터:', {
      ...tokenData,
      token: tokenData.token.substring(0, 20) + '...' // 토큰은 일부만 로깅
    });
    
    // 실제 구현시에는 서버 API로 토큰 전송
    // const response = await fetch('/api/register-token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(tokenData)
    // });
    
    // if (!response.ok) {
    //   throw new Error('토큰 등록 실패');
    // }
    
  } catch (error) {
    console.error('❌ 토큰 서버 전송 실패:', error);
  }
}

// 🎯 토픽 구독 (현재는 시뮬레이션)
async subscribeToTopic(token, centerName) {
  try {
    const topicName = this.getTopicName(centerName);
    
    console.log(`🎯 토픽 구독 시도: ${topicName}`);
    
    // 🧪 현재는 로컬스토리지에 구독 상태만 기록 (시뮬레이션)
    const subscriptions = JSON.parse(localStorage.getItem('topicSubscriptions') || '[]');
    
    if (!subscriptions.includes(topicName)) {
      subscriptions.push(topicName);
      localStorage.setItem('topicSubscriptions', JSON.stringify(subscriptions));
      console.log(`✅ 토픽 구독 완료: ${topicName}`);
      
      // 🧪 테스트 모드에서 추가 정보 표시
      if (this.isTestMode()) {
        console.log('🧪 테스트 모드 - 구독 정보:');
        console.log('  - 토픽명:', topicName);
        console.log('  - 연수원:', centerName);
        console.log('  - 토큰:', token.substring(0, 20) + '...');
        console.log('  - 시간:', new Date().toLocaleString());
      }
    } else {
      console.log(`⚠️ 이미 구독 중인 토픽: ${topicName}`);
    }
    
    // TODO: 실제 서버 API 구현시 사용
    // await fetch('/api/subscribe-topic', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ 
    //       token, 
    //       topic: topicName,
    //       testMode: this.isTestMode()
    //     })
    // });
    
  } catch (error) {
    console.error('❌ 토픽 구독 실패:', error);
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

  // 🔍 현재 푸시 설정 상태 확인
  getCurrentPushStatus() {
    const status = {
      testMode: this.isTestMode(),
      selectedCenter: localStorage.getItem('selectedCenter'),
      setupCompleted: localStorage.getItem('setupCompleted'),
      fcmToken: this.token ? this.token.substring(0, 20) + '...' : null,
      subscriptions: JSON.parse(localStorage.getItem('topicSubscriptions') || '[]'),
      timestamp: new Date().toLocaleString()
    };
    
    return status;
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

// 전역 객체로 내보내기 (ES6 모듈과 호환)
if (typeof window !== 'undefined') {
  window.PushNotificationManager = PushNotificationManager;
  
  // 디버그 로그 추가
  console.log('🔧 PushNotificationManager 클래스 등록:', typeof PushNotificationManager);
  console.log('🔧 window.PushNotificationManager:', typeof window.PushNotificationManager);
  
  // 즉시 테스트
  try {
    const testInstance = new PushNotificationManager();
    console.log('✅ PushNotificationManager 인스턴스 생성 테스트 성공');
  } catch (error) {
    console.error('❌ PushNotificationManager 인스턴스 생성 테스트 실패:', error);
  }
}


// 임시 디버그 코드 - 파일 맨 아래 추가
console.log('🔧 push-notification.js 파일 로드 시작');

// DOMContentLoaded 이벤트 후에 클래스 등록
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 DOM 로드 완료, PushNotificationManager 등록 시도');
  
  if (typeof PushNotificationManager !== 'undefined') {
    window.PushNotificationManager = PushNotificationManager;
    console.log('✅ PushNotificationManager 등록 성공:', typeof window.PushNotificationManager);
    
    // 테스트 인스턴스 생성
    try {
      const testInstance = new PushNotificationManager();
      console.log('✅ 테스트 인스턴스 생성 성공');
      
      // 전역 테스트 함수 등록
      window.debugPushTest = {
        checkStatus() {
          console.log('=== 🧪 푸시 테스트 상태 ===');
          console.log('테스트 모드:', localStorage.getItem('testMode'));
          console.log('선택된 연수원:', localStorage.getItem('selectedCenter'));
          console.log('FCM 토큰:', localStorage.getItem('fcm-token')?.substring(0, 20) + '...');
          console.log('구독 토픽:', JSON.parse(localStorage.getItem('topicSubscriptions') || '[]'));
          console.log('========================');
        },
        
        createInstance() {
          try {
            const instance = new PushNotificationManager();
            console.log('✅ 새 인스턴스 생성:', instance);
            console.log('테스트 모드:', instance.isTestMode());
            return instance;
          } catch (error) {
            console.error('❌ 인스턴스 생성 실패:', error);
          }
        }
      };
      
      console.log('🧪 디버그 도구 등록 완료:');
      console.log('  - debugPushTest.checkStatus() : 상태 확인');
      console.log('  - debugPushTest.createInstance() : 인스턴스 생성');
      
    } catch (error) {
      console.error('❌ 테스트 인스턴스 생성 실패:', error);
    }
  } else {
    console.error('❌ PushNotificationManager 클래스를 찾을 수 없습니다');
  }
});

console.log('🔧 push-notification.js 파일 로드 완료');