/**
 * SK 멘토 가이드 - 로컬 스토리지 관리
 * @version 1.0.0
 */

class SKMentorStorage {
  constructor() {
    this.prefix = 'sk-mentor-';
    this.version = '1.0.0';
    this.init();
  }

  /**
   * 스토리지 초기화
   */
  init() {
    this.checkVersion();
    this.cleanOldData();
  }

  /**
   * 버전 확인 및 마이그레이션
   */
  checkVersion() {
    const currentVersion = this.get('version');
    
    if (!currentVersion || currentVersion !== this.version) {
      console.log('📦 스토리지 버전 업데이트:', currentVersion, '->', this.version);
      this.migrateData(currentVersion, this.version);
      this.set('version', this.version);
    }
  }

  /**
   * 데이터 마이그레이션
   */
  migrateData(fromVersion, toVersion) {
    // 버전별 마이그레이션 로직
    if (!fromVersion) {
      // 첫 설치: 기본 설정
      this.setDefaults();
    }
    
    // 향후 버전 업데이트시 추가 마이그레이션 로직
  }

  /**
   * 기본 설정값 저장
   */
  setDefaults() {
    const defaults = {
      theme: 'light',
      notifications: true,
      autoSave: true,
      language: 'ko'
    };

    Object.keys(defaults).forEach(key => {
      if (!this.get(key)) {
        this.set(key, defaults[key]);
      }
    });
  }

  /**
   * 오래된 데이터 정리
   */
  cleanOldData() {
    const expiredKeys = [];
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30일

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const data = this.getWithTimestamp(key.replace(this.prefix, ''));
        if (data && data.timestamp && (now - data.timestamp) > maxAge) {
          expiredKeys.push(key);
        }
      }
    }

    expiredKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ 만료된 데이터 삭제:', key);
    });
  }

  /**
   * 데이터 저장
   */
  set(key, value, options = {}) {
    try {
      const data = {
        value: value,
        timestamp: Date.now(),
        expires: options.expires || null,
        version: this.version
      };

      const serialized = JSON.stringify(data);
      localStorage.setItem(this.prefix + key, serialized);
      
      // 저장 이벤트 발생
      this.dispatchStorageEvent('set', key, value);
      
      return true;
    } catch (error) {
      console.error('❌ 스토리지 저장 실패:', key, error);
      
      // 용량 부족시 자동 정리
      if (error.name === 'QuotaExceededError') {
        this.clearExpiredData();
        // 재시도
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify({
            value: value,
            timestamp: Date.now(),
            version: this.version
          }));
          return true;
        } catch (retryError) {
          console.error('❌ 재시도 저장 실패:', retryError);
        }
      }
      
      return false;
    }
  }

  /**
   * 데이터 조회
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return defaultValue;

      const data = JSON.parse(item);
      
      // 만료 확인
      if (data.expires && Date.now() > data.expires) {
        this.remove(key);
        return defaultValue;
      }

      return data.value;
    } catch (error) {
      console.error('❌ 스토리지 조회 실패:', key, error);
      return defaultValue;
    }
  }

  /**
   * 타임스탬프와 함께 데이터 조회
   */
  getWithTimestamp(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      return JSON.parse(item);
    } catch (error) {
      console.error('❌ 타임스탬프 조회 실패:', key, error);
      return null;
    }
  }

  /**
   * 데이터 삭제
   */
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      this.dispatchStorageEvent('remove', key, null);
      return true;
    } catch (error) {
      console.error('❌ 스토리지 삭제 실패:', key, error);
      return false;
    }
  }

  /**
   * 특정 패턴의 키들 조회
   */
  getKeys(pattern = '') {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix + pattern)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  /**
   * 만료된 데이터 정리
   */
  clearExpiredData() {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.expires && now > data.expires) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // 잘못된 형식의 데이터도 제거
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('🧹 만료된 데이터 정리 완료:', keysToRemove.length, '개');
  }

  /**
   * 모든 앱 데이터 삭제
   */
  clear() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('🗑️ 모든 앱 데이터 삭제 완료:', keysToRemove.length, '개');
  }

  /**
   * 스토리지 사용량 확인
   */
  getUsage() {
    let totalSize = 0;
    let appSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      
      totalSize += size;
      
      if (key?.startsWith(this.prefix)) {
        appSize += size;
      }
    }

    return {
      total: totalSize,
      app: appSize,
      available: 5 * 1024 * 1024 - totalSize, // 5MB 추정 한도
      percentage: (totalSize / (5 * 1024 * 1024)) * 100
    };
  }

  /**
   * 체크리스트 상태 관리
   */
  saveChecklistState(checklistId, itemId, checked) {
    const key = `checklist_${checklistId}`;
    const checklist = this.get(key, {});
    checklist[itemId] = checked;
    this.set(key, checklist);
    
    console.log('✅ 체크리스트 상태 저장:', checklistId, itemId, checked);
  }

  /**
   * 체크리스트 상태 조회
   */
  getChecklistState(checklistId, itemId = null) {
    const key = `checklist_${checklistId}`;
    const checklist = this.get(key, {});
    
    if (itemId) {
      return checklist[itemId] || false;
    }
    
    return checklist;
  }

  /**
   * 출석 데이터 저장
   */
  saveAttendanceData(date, time, data) {
    const key = `attendance_${date}_${time}`;
    const attendanceData = {
      ...data,
      submittedAt: Date.now(),
      synced: false
    };
    
    this.set(key, attendanceData);
    console.log('📝 출석 데이터 저장:', key, data);
    
    return key;
  }

  /**
   * 출석 데이터 조회
   */
  getAttendanceData(date, time = null) {
    if (time) {
      const key = `attendance_${date}_${time}`;
      return this.get(key, null);
    }
    
    // 해당 날짜의 모든 출석 데이터
    const pattern = `attendance_${date}`;
    const keys = this.getKeys(pattern);
    const attendanceData = {};
    
    keys.forEach(key => {
      const data = this.get(key);
      if (data) {
        const timeKey = key.split('_').pop();
        attendanceData[timeKey] = data;
      }
    });
    
    return attendanceData;
  }

  /**
   * 면담 데이터 저장
   */
  saveInterviewData(menteeId, data) {
    const key = `interview_${menteeId}`;
    const interviewData = {
      ...data,
      menteeId,
      completedAt: Date.now(),
      synced: false
    };
    
    this.set(key, interviewData);
    console.log('💬 면담 데이터 저장:', menteeId, data);
    
    return key;
  }

  /**
   * 면담 데이터 조회
   */
  getInterviewData(menteeId = null) {
    if (menteeId) {
      const key = `interview_${menteeId}`;
      return this.get(key, null);
    }
    
    // 모든 면담 데이터
    const pattern = 'interview_';
    const keys = this.getKeys(pattern);
    const interviews = {};
    
    keys.forEach(key => {
      const data = this.get(key);
      if (data) {
        const menteeKey = key.replace('interview_', '');
        interviews[menteeKey] = data;
      }
    });
    
    return interviews;
  }

  /**
   * 동기화 대기 중인 데이터 조회
   */
  getPendingSyncData() {
    const pendingData = {
      attendance: [],
      interviews: []
    };
    
    // 출석 데이터
    const attendanceKeys = this.getKeys('attendance_');
    attendanceKeys.forEach(key => {
      const data = this.get(key);
      if (data && !data.synced) {
        pendingData.attendance.push({
          key,
          data
        });
      }
    });
    
    // 면담 데이터
    const interviewKeys = this.getKeys('interview_');
    interviewKeys.forEach(key => {
      const data = this.get(key);
      if (data && !data.synced) {
        pendingData.interviews.push({
          key,
          data
        });
      }
    });
    
    return pendingData;
  }

  /**
   * 동기화 완료 표시
   */
  markAsSynced(key) {
    const data = this.get(key);
    if (data) {
      data.synced = true;
      data.syncedAt = Date.now();
      this.set(key, data);
      console.log('🔄 동기화 완료 표시:', key);
    }
  }

  /**
   * 멘티 목록 저장
   */
  saveMenteeList(mentees) {
    this.set('menteeList', mentees);
    console.log('👥 멘티 목록 저장:', mentees.length, '명');
  }

  /**
   * 멘티 목록 조회
   */
  getMenteeList() {
    return this.get('menteeList', []);
  }

  /**
   * 저장 이벤트 발생
   */
  dispatchStorageEvent(action, key, value) {
    const event = new CustomEvent('sk-mentor-storage', {
      detail: {
        action,
        key,
        value,
        timestamp: Date.now()
      }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  /**
   * 데이터 내보내기 (백업용)
   */
  exportData() {
    const exportData = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const cleanKey = key.replace(this.prefix, '');
        exportData[cleanKey] = this.get(cleanKey);
      }
    }
    
    return {
      version: this.version,
      exportedAt: Date.now(),
      data: exportData
    };
  }

  /**
   * 데이터 가져오기 (복원용)
   */
  importData(importData) {
    try {
      if (!importData.data || !importData.version) {
        throw new Error('잘못된 백업 데이터 형식');
      }
      
      // 기존 데이터 백업
      const currentData = this.exportData();
      this.set('backup_before_import', currentData);
      
      // 새 데이터 가져오기
      Object.keys(importData.data).forEach(key => {
        this.set(key, importData.data[key]);
      });
      
      console.log('📥 데이터 가져오기 완료:', Object.keys(importData.data).length, '개');
      return true;
      
    } catch (error) {
      console.error('❌ 데이터 가져오기 실패:', error);
      return false;
    }
  }

  /**
   * 디버그 정보 출력
   */
  debug() {
    console.group('🔍 SKMentorStorage 디버그 정보');
    console.log('버전:', this.version);
    console.log('사용량:', this.getUsage());
    console.log('저장된 키 목록:', this.getKeys());
    console.log('동기화 대기 데이터:', this.getPendingSyncData());
    console.groupEnd();
  }
}

// 전역 인스턴스 생성
const storage = new SKMentorStorage();

// 전역 접근을 위한 내보내기
if (typeof window !== 'undefined') {
  window.skMentorStorage = storage;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SKMentorStorage;
}