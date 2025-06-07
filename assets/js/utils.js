/**
 * SK 멘토 가이드 - 유틸리티 함수들
 * @version 1.0.0
 */

/**
 * 날짜 관련 유틸리티
 */
const DateUtils = {
  /**
   * 한국어 날짜 포맷팅
   */
  formatKoreanDate(date = new Date()) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return date.toLocaleDateString('ko-KR', options);
  },

  /**
   * 상대적 시간 표시 (예: 2시간 전)
   */
  getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return this.formatKoreanDate(date);
  },

  /**
   * 교육과정 날짜 확인
   */
  isTrainingDay(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 2025년 1월 2일~15일 (주말 제외)
    if (year === 2025 && month === 1 && day >= 2 && day <= 15) {
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6; // 일요일(0), 토요일(6) 제외
    }
    
    return false;
  },

  /**
   * 교육과정 진행 상태
   */
  getTrainingProgress(date = new Date()) {
    const startDate = new Date(2025, 0, 2); // 1월 2일
    const endDate = new Date(2025, 0, 15); // 1월 15일
    
    if (date < startDate) return { status: 'before', message: '교육 시작 전' };
    if (date > endDate) return { status: 'after', message: '교육 완료' };
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const passedDays = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24));
    const progress = Math.round((passedDays / totalDays) * 100);
    
    return { 
      status: 'ongoing', 
      message: '교육 진행 중',
      progress,
      day: passedDays,
      totalDays
    };
  }
};

/**
 * 문자열 관련 유틸리티
 */
const StringUtils = {
  /**
   * 텍스트 줄바꿈 처리
   */
  nl2br(text) {
    return text.replace(/\n/g, '<br>');
  },

  /**
   * HTML 태그 제거
   */
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  /**
   * 텍스트 길이 제한
   */
  truncate(text, maxLength = 100, suffix = '...') {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
  },

  /**
   * 검색어 하이라이트
   */
  highlight(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * 전화번호 포맷팅
   */
  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    return phone;
  }
};

/**
 * DOM 관련 유틸리티
 */
const DOMUtils = {
  /**
   * 요소가 뷰포트에 보이는지 확인
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * 부드러운 스크롤
   */
  smoothScrollTo(element, offset = 0) {
    const targetPosition = element.offsetTop - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  },

  /**
   * 요소에 CSS 클래스 토글
   */
  toggleClass(element, className, force) {
    if (force !== undefined) {
      element.classList.toggle(className, force);
    } else {
      element.classList.toggle(className);
    }
  },

  /**
   * 터치 디바이스 감지
   */
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * 모바일 디바이스 감지
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * iOS 디바이스 감지
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
};

/**
 * 배열 관련 유틸리티
 */
const ArrayUtils = {
  /**
   * 배열 섞기 (Fisher-Yates shuffle)
   */
  shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  /**
   * 배열에서 랜덤 요소 선택
   */
  randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * 배열 그룹화
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  /**
   * 중복 제거
   */
  unique(array) {
    return [...new Set(array)];
  },

  /**
   * 배열 청크 (지정된 크기로 나누기)
   */
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};

/**
 * URL 관련 유틸리티
 */
const URLUtils = {
  /**
   * URL 파라미터 파싱
   */
  getParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    
    return params;
  },

  /**
   * URL 파라미터 설정
   */
  setParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  },

  /**
   * 현재 페이지 식별
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (filename.includes('setup')) return 'setup';
    if (filename.includes('guides/')) return 'guide';
    if (filename === 'index.html' || filename === '') return 'dashboard';
    
    return 'unknown';
  }
};

/**
 * 파일 관련 유틸리티
 */
const FileUtils = {
  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 파일 확장자 추출
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * 이미지 파일 여부 확인
   */
  isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
  }
};

/**
 * 애니메이션 관련 유틸리티
 */
const AnimationUtils = {
  /**
   * 페이드 인 애니메이션
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  },

  /**
   * 페이드 아웃 애니메이션
   */
  fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.max(initialOpacity - (progress / duration), 0);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }
    
    requestAnimationFrame(animate);
  },

  /**
   * 슬라이드 업 애니메이션
   */
  slideUp(element, duration = 300) {
    const height = element.offsetHeight;
    element.style.height = height + 'px';
    element.style.overflow = 'hidden';
    
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const currentHeight = Math.max(height - (height * progress / duration), 0);
      
      element.style.height = currentHeight + 'px';
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
      }
    }
    
    requestAnimationFrame(animate);
  }
};

/**
 * 알림 관련 유틸리티
 */
const NotificationUtils = {
  /**
   * 토스트 메시지 표시
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const colors = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3'
    };
    
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  },

  /**
   * 확인 대화상자
   */
  confirm(message, title = '확인') {
    return new Promise((resolve) => {
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  },

  /**
   * 브라우저 알림 권한 요청
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * 브라우저 알림 표시
   */
  showNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/icon-192.png',
        ...options
      });

      // 자동 닫기
      setTimeout(() => {
        notification.close();
      }, options.duration || 5000);

      return notification;
    }
  }
};

/**
 * 디버깅 관련 유틸리티
 */
const DebugUtils = {
  /**
   * 성능 측정 시작
   */
  startPerformance(label) {
    if (console.time) {
      console.time(label);
    }
  },

  /**
   * 성능 측정 종료
   */
  endPerformance(label) {
    if (console.timeEnd) {
      console.timeEnd(label);
    }
  },

  /**
   * 메모리 사용량 확인
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
      };
    }
    return null;
  },

  /**
   * 로그 레벨별 출력
   */
  log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }
};

/**
 * 전역으로 유틸리티 함수들 노출
 */
window.SKMentorUtils = {
  Date: DateUtils,
  String: StringUtils,
  DOM: DOMUtils,
  Array: ArrayUtils,
  URL: URLUtils,
  File: FileUtils,
  Animation: AnimationUtils,
  Notification: NotificationUtils,
  Debug: DebugUtils
};

// 자주 사용되는 함수들은 개별적으로도 노출
window.showToast = NotificationUtils.showToast;
window.formatKoreanDate = DateUtils.formatKoreanDate;
window.isMobile = DOMUtils.isMobile;

// 개발 환경에서 디버깅 헬퍼
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debug = DebugUtils;
  console.log('🛠️ 개발 모드: window.debug 사용 가능');
}