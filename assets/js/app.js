/**
 * SK 멘토 가이드 - Google Sheets 완전 연동 버전
 * @version 2.2.0
 */

// =================================================================
// Google Sheets 서비스 클래스
// =================================================================
class GoogleSheetService {
  constructor() {
    // 실제 Apps Script 웹앱 URL
    this.scriptUrl = 'https://script.google.com/macros/s/AKfycbyvkEufshC8wwQwMqO5nJsdhhUC6EvBqKkeXVR5YF5cQnnPLUG3oo5d0eObTVkjN55Y/exec';
    this.cache = null;
    this.cacheTime = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5분 캐시
  }

  async getScheduleData() {
    // 캐시 확인
    if (this.cache && Date.now() - this.cacheTime < this.cacheTimeout) {
      console.log('📊 캐시된 일정 데이터 사용');
      return this.cache;
    }

    try {
      console.log('📡 구글 시트에서 일정 데이터 가져오는 중...');
      const response = await fetch(this.scriptUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ 구글 시트 데이터 로드 성공:', data.length, '개 일정');
      
      // 캐시 저장
      this.cache = data;
      this.cacheTime = Date.now();
      
      // 백업 저장
      localStorage.setItem('schedule-backup', JSON.stringify(data));
      localStorage.setItem('schedule-backup-time', Date.now().toString());
      
      return data;
    } catch (error) {
      console.error('❌ 구글 시트 데이터 로드 실패:', error);
      return this.getOfflineData();
    }
  }

  getOfflineData() {
    try {
      const backupData = localStorage.getItem('schedule-backup');
      const backupTime = localStorage.getItem('schedule-backup-time');
      
      if (backupData) {
        console.log('💾 오프라인 백업 데이터 사용');
        
        // 24시간 이상 오래된 데이터 경고
        if (backupTime && Date.now() - parseInt(backupTime) > 24 * 60 * 60 * 1000) {
          console.warn('⚠️ 백업 데이터가 24시간 이상 오래됨');
        }
        
        return JSON.parse(backupData);
      }
    } catch (error) {
      console.error('❌ 백업 데이터 로드 실패:', error);
    }
    
    console.log('❌ 사용할 수 있는 일정 데이터 없음');
    return [];
  }

  clearCache() {
    this.cache = null;
    this.cacheTime = null;
    console.log('🔄 캐시 클리어됨');
  }
}

// =================================================================
// 일정 관리 클래스
// =================================================================
class ScheduleManager {
  constructor(googleSheetService) {
    this.googleSheetService = googleSheetService;
    this.selectedCenter = localStorage.getItem('selectedCenter');
    this.centerMap = { 
      'icheon': '이천', 
      'yongin': '용인', 
      'incheon': '무의',
      'sunning': '써닝',
      'sbti': '중소벤처기업',
      'gapyeong': '가평',
      'cheonggang': '청강' 
    };
  }

  // 오늘의 일정 업데이트
  async updateTodaySchedule() {
    const scheduleContent = document.getElementById('schedule-content');
    if (!scheduleContent) return;

    this.showLoading(scheduleContent);

    try {
      const allScheduleData = await this.googleSheetService.getScheduleData();
      
      if (!allScheduleData || allScheduleData.length === 0) {
        this.showNoData(scheduleContent);
        return;
      }

      const todaySchedule = this.filterTodaySchedule(allScheduleData);
      this.renderTodaySchedule(scheduleContent, todaySchedule);
      
    } catch (error) {
      console.error('❌ 일정 업데이트 실패:', error);
      this.showError(scheduleContent, error.message);
    }
  }

  // 오늘 일정 필터링
  filterTodaySchedule(allScheduleData) {
    if (!this.selectedCenter) return [];

    const trainingCenter = this.centerMap[this.selectedCenter];
    const today = new Date();
    const todayStr = today.toLocaleDateString('sv-SE');
    
    console.log('📊 일정 필터링:', { trainingCenter, todayStr, totalData: allScheduleData.length });
    
    const filtered = allScheduleData.filter(item => {
      // 연수원 매칭
      if (item.training_center !== trainingCenter) return false;
      
      // 날짜 매칭
      if (!item.date) return false;
      
      let itemDateStr;
      try {
        const dateObj = new Date(item.date);
        itemDateStr = dateObj.toISOString().split('T')[0];
      } catch {
        return false;
      }
      
      if (itemDateStr !== todayStr) return false;
      
      // 활성 상태 확인
      const isActive = !item.status || item.status === 'active';
      
      return isActive;
    });

    console.log('✅ 필터링된 오늘 일정:', filtered.length, '개');
    return filtered;
  }

  // 오늘 일정 렌더링
  renderTodaySchedule(container, scheduleData) {
    if (scheduleData.length === 0) {
      this.showNoSchedule(container);
      return;
    }

    // 시간순 정렬
    scheduleData.sort((a, b) => {
      const timeA = this.parseExcelTime(a.time_start);
      const timeB = this.parseExcelTime(b.time_start);
      return timeA.localeCompare(timeB);
    });

    container.innerHTML = '';

    scheduleData.forEach(item => {
      const scheduleItem = this.createScheduleItem(item);
      container.appendChild(scheduleItem);
    });

    // 데이터 소스 표시
    this.addDataSourceInfo(container);
  }

  // Excel 시간 형식 파싱
  parseExcelTime(excelTime) {
    if (!excelTime) return '시간미정';
    
    // 이미 텍스트 형식이면 그대로 반환
    if (typeof excelTime === 'string' && excelTime.includes(':')) {
      return excelTime;
    }
    
    try {
      // Excel 날짜/시간 파싱
      const date = new Date(excelTime);
      if (isNaN(date.getTime())) return '시간미정';
      
      // 한국 시간으로 변환
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.warn('시간 파싱 실패:', excelTime, error);
      return '시간미정';
    }
  }

  // 일정 아이템 생성 (기존 스타일 유지)
  createScheduleItem(item) {
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    
    const timeStart = this.parseExcelTime(item.time_start);
    const timeEnd = this.parseExcelTime(item.time_end);
    const displayTime = (timeEnd && timeEnd !== '시간미정') ? `${timeStart}-${timeEnd}` : timeStart;
    
    const programName = item.program_name || '프로그램명 없음';
    const location = item.location || '장소미정';
    const mentorRole = item.mentor_role || '선택참관';
    // 강사 정보는 제거 - 기존 디자인 유지
    
    const badgeClass = this.getBadgeClass(mentorRole);
    
    // 점심/저녁시간 특별 스타일
    const isBreakTime = programName.includes('점심') || programName.includes('저녁') || 
                       programName.includes('식사') || location.includes('식당');
    
    if (isBreakTime) {
      scheduleItem.classList.add('lunch-break');
    }

    const role = mentorRole?.toLowerCase() || '';

    if (role.includes('진행') || role.includes('주도') || role.includes('필수')) {
      scheduleItem.classList.add('mentor-program');
    }
    
    // 기존 디자인과 동일한 구조
    scheduleItem.innerHTML = `
      <div class="schedule-time">${displayTime}</div>
      <div class="schedule-content">
        <div class="schedule-title">${programName}</div>
        <div class="schedule-location">${location}</div>
      </div>
      <div class="schedule-badge ${badgeClass}">${mentorRole}</div>
    `;
    
    return scheduleItem;
  }

  // 배지 클래스 결정
  getBadgeClass(mentorRole) {
    const role = mentorRole?.toLowerCase() || '';
    
    if (role.includes('진행') || role.includes('lead') || role.includes('주도')) {
      return 'badge-lead';
    } else if (role.includes('필수') || role.includes('required') || role.includes('참관')) {
      return 'badge-required';
    } else if (role.includes('선택') || role.includes('optional')) {
      return 'badge-optional';
    } else if (role.includes('휴식') || role.includes('break')) {
      return 'badge-break';
    }
    
    return 'badge-optional';
  }

  // 전체 일정 생성
  async generateFullTimetable() {
    try {
      const allScheduleData = await this.googleSheetService.getScheduleData();
      
      if (!allScheduleData || allScheduleData.length === 0) {
        return '<div class="no-data">일정 데이터를 불러올 수 없습니다.</div>';
      }

      const trainingCenter = this.centerMap[this.selectedCenter];
      const myScheduleData = allScheduleData.filter(item => 
        item.training_center === trainingCenter && 
        (!item.status || item.status === 'active')
      );

      if (myScheduleData.length === 0) {
        return '<div class="no-data">해당 연수원의 일정이 없습니다.</div>';
      }

      return this.generateTimetableHTML(myScheduleData);
      
    } catch (error) {
      console.error('❌ 전체 일정 생성 실패:', error);
      return '<div class="error">전체 일정을 불러올 수 없습니다.</div>';
    }
  }

  // 전체 일정 HTML 생성
  generateTimetableHTML(scheduleData) {
    // 날짜별로 그룹핑
    const groupedByDate = {};
    
    scheduleData.forEach(item => {
      if (!item.date) return;
      
      const dateObj = new Date(item.date);
      const dateKey = dateObj.toISOString().split('T')[0];
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      
      groupedByDate[dateKey].push(item);
    });

    // 날짜순 정렬
    const sortedDates = Object.keys(groupedByDate).sort();
    
    let html = '';
    
    sortedDates.forEach(dateKey => {
      const dateObj = new Date(dateKey);
      const daySchedule = groupedByDate[dateKey];
      
      // 시간순 정렬
      daySchedule.sort((a, b) => {
        const timeA = this.parseExcelTime(a.time_start);
        const timeB = this.parseExcelTime(b.time_start);
        return timeA.localeCompare(timeB);
      });

      const dateString = dateObj.toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      });

      html += `
        <div class="day-schedule" data-date="${dateKey}">
          <div class="day-header">${dateString}</div>
          <div class="day-timeline">
      `;

      daySchedule.forEach(item => {
        const timeStart = this.parseExcelTime(item.time_start);
        const timeEnd = this.parseExcelTime(item.time_end);
        const displayTime = (timeEnd && timeEnd !== '시간미정') ? `${timeStart}-${timeEnd}` : timeStart;
        const programName = item.program_name || '프로그램명 없음';
        const location = item.location || '장소미정';
        const mentorRole = item.mentor_role || '';
        // 강사 정보는 전체 일정에서도 제거
        
        const isMentor = mentorRole.includes('진행') || mentorRole.includes('필수');
        const isBreak = programName.includes('점심') || programName.includes('저녁') || 
                       programName.includes('식사');
        
        const itemClass = isMentor ? 'mentor' : (isBreak ? 'break' : '');
        
        html += `
          <div class="timeline-item ${itemClass}">
            <div class="time">${displayTime}</div>
            <div class="content">
              <div class="title">${programName}</div>
              <div class="location">${location}</div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    return html;
  }

  // 로딩 표시
  showLoading(container) {
    container.innerHTML = `
      <div class="schedule-loading">
        <div class="loading-spinner"></div>
        <p>일정을 불러오는 중...</p>
      </div>
    `;
  }

  // 데이터 없음 표시
  showNoData(container) {
    container.innerHTML = `
      <div class="no-schedule">
        <p>🔌 구글 시트에 연결할 수 없습니다.</p>
        <small>네트워크 연결을 확인해주세요.</small>
      </div>
    `;
  }

  // 일정 없음 표시
  showNoSchedule(container) {
    const trainingCenter = this.centerMap[this.selectedCenter];
    const today = new Date().toLocaleDateString('ko-KR');
    
    container.innerHTML = `
      <div class="no-schedule">
        <p><strong>${trainingCenter} 연수원</strong></p>
        <p>오늘(${today}) 일정이 없습니다.</p>
        <small>일정이 추가되면 자동으로 표시됩니다.</small>
      </div>
    `;
  }

  // 에러 표시
  showError(container, message) {
    container.innerHTML = `
      <div class="schedule-error">
        <p>❌ 오류가 발생했습니다</p>
        <small>${message}</small>
        <button onclick="refreshTodaySchedule()" class="retry-btn">다시 시도</button>
      </div>
    `;
  }

  // 데이터 소스 정보 추가
  addDataSourceInfo(container) {
    const sourceInfo = document.createElement('div');
    sourceInfo.className = 'data-source-info';
    sourceInfo.innerHTML = `
      📊 실시간 데이터 • 마지막 업데이트: ${new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}
    `;
    container.appendChild(sourceInfo);
  }
}

// =================================================================
// 메인 앱 클래스
// =================================================================
class SKMentorApp {
  constructor() {
    this.selectedCenter = localStorage.getItem('selectedCenter');
    this.googleSheetService = new GoogleSheetService();
    this.scheduleManager = new ScheduleManager(this.googleSheetService);
    
   // ✅ 새로 추가
    this.config = null;
    this.configLoaded = false;
    
    this.init();
  }

   async init() {
    console.log('🎯 SK 멘토 가이드 앱 시작');
    
    // ✅ Config 로드를 가장 먼저 실행
    await this.loadConfig();
    
    // 기존 설정 확인
    await this.checkSetup();
    
    // UI 초기화
    this.initializeUI();
    
    console.log('✅ 앱 초기화 완료');
  }

  async checkSetup() {
    const setupCompleted = localStorage.getItem('setupCompleted');
    this.selectedCenter = localStorage.getItem('selectedCenter');
    
    // 설정 페이지에서는 체크하지 않음
    if (window.location.pathname.includes('setup.html')) {
      return;
    }
    
    if (!setupCompleted || !this.selectedCenter) {
      window.location.href = '/setup.html';
      return false;
    }
    
    return true;
  }

  initializeUI() {
    // 현재 페이지 확인
    const currentPage = this.getCurrentPage();
    
    if (currentPage === 'index') {
      this.initializeDashboard();
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('setup.html')) return 'setup';
    if (path.includes('guides/')) return 'guide';
    return 'index';
  }

  initializeDashboard() {
    // 헤더 업데이트
    this.updateHeader();
    
    // 오늘의 일정 업데이트
    this.scheduleManager.updateTodaySchedule();
    
    // 오늘의 멘토 프로그램 업데이트
    this.updateTodayMentorProgram();
  }

  // 오늘의 멘토 프로그램 업데이트 (간단 버전)
  async updateTodayMentorProgram() {
    try {
      const allScheduleData = await this.googleSheetService.getScheduleData();
      
      if (!allScheduleData || allScheduleData.length === 0) {
        this.setDefaultMentorProgram();
        return;
      }

      const mentorPrograms = this.filterTodayMentorPrograms(allScheduleData);
      
      if (mentorPrograms.length > 0) {
        // 가장 중요한 프로그램 1개만 선택 (진행 > 필수참관 순)
        const mainProgram = this.selectMainMentorProgram(mentorPrograms);
        this.updateMentorProgramUI(mainProgram);
      } else {
        this.setNoMentorProgram();
      }
      
    } catch (error) {
      console.error('❌ 멘토 프로그램 업데이트 실패:', error);
      this.setDefaultMentorProgram();
    }
  }

  // 메인 멘토 프로그램 선택 (최대 2개)
  selectMainMentorPrograms(programs) {
    // 우선순위: 진행 > 필수참관
    const leadPrograms = programs.filter(p => 
      p.mentor_role?.includes('진행') || p.mentor_role?.includes('lead')
    );
    
    const requiredPrograms = programs.filter(p => 
      p.mentor_role?.includes('필수') && 
      !(p.mentor_role?.includes('진행') || p.mentor_role?.includes('lead'))
    );
    
    // 진행 프로그램을 우선으로 하고, 최대 2개까지
    const selectedPrograms = [
      ...leadPrograms.slice(0, 2),
      ...requiredPrograms.slice(0, 2 - leadPrograms.slice(0, 2).length)
    ];
    
    return selectedPrograms.slice(0, 2); // 최대 2개
  }

  // 오늘의 멘토 프로그램 업데이트 (1-2개 카드)
  async updateTodayMentorProgram() {
    try {
      const allScheduleData = await this.googleSheetService.getScheduleData();
      
      if (!allScheduleData || allScheduleData.length === 0) {
        this.setDefaultMentorProgram();
        return;
      }

      const mentorPrograms = this.filterTodayMentorPrograms(allScheduleData);
      
      if (mentorPrograms.length > 0) {
        const selectedPrograms = this.selectMainMentorPrograms(mentorPrograms);
        this.updateMentorProgramUI(selectedPrograms);
      } else {
        this.setNoMentorProgram();
      }
      
    } catch (error) {
      console.error('❌ 멘토 프로그램 업데이트 실패:', error);
      this.setDefaultMentorProgram();
    }
  }

  // 멘토 프로그램 UI 업데이트 (1-2개 대응)
  updateMentorProgramUI(programs) {
    const container = document.getElementById('mentor-program-card');
    if (!container) return;

    // 기존 카드 초기화
    container.innerHTML = '';

    if (programs.length === 0) {
      this.setNoMentorProgram();
      return;
    }

    // 프로그램 개수에 따라 처리
    programs.forEach((program, index) => {
      const card = this.createMentorProgramCard(program, index);
      container.appendChild(card);
    });
    
    console.log(`✅ 멘토 프로그램 UI 업데이트: ${programs.length}개`);
  }

  // 멘토 프로그램 카드 생성 (개별)
  createMentorProgramCard(program, index = 0) {
    const card = document.createElement('div');
    card.className = 'mentor-program-card';
    
    // 두 번째 카드는 약간 다른 스타일
    if (index === 1) {
      card.classList.add('secondary-program');
    }

    // 시간 파싱
    const timeStart = this.scheduleManager.parseExcelTime(program.time_start);
    const timeEnd = this.scheduleManager.parseExcelTime(program.time_end);
    const timeDisplay = (timeEnd && timeEnd !== '시간미정') ? `${timeStart}-${timeEnd}` : timeStart;
    
    // 프로그램 정보
    const programName = program.program_name || '멘토 프로그램';
    const location = program.location || '분과장';
    const mentorRole = program.mentor_role || '진행';
    
    // 가이드 링크
    const programId = this.getProgramId(programName);
    
    card.innerHTML = `
      <div class="program-title">${programName}</div>
      <div class="program-time-location">📍 ${location}에서 직접 진행 | ⏰ ${timeDisplay}</div>
      <div class="program-buttons">
        ${programId ? `<a href="guides/${programId}.html" class="btn-guide">진행법 보기</a>` : '<a href="#" class="btn-guide">진행법 보기</a>'}
        <a href="#" class="btn-checklist" onclick="showChecklist('${programId || 'default'}')">준비사항 체크</a>
      </div>
    `;
    
    return card;
  }

  // 멘토 프로그램 없을 때
  setNoMentorProgram() {
    const container = document.getElementById('mentor-program-card');
    if (!container) return;
    
    container.innerHTML = `
      <div class="mentor-program-card no-program">
        <div class="program-title">오늘은 참관 위주</div>
        <div class="program-time-location">📍 멘티 케어 및 강의 참관 | ⏰ 일정 확인</div>
        <div class="program-buttons">
          <a href="guides/daily-opening.html" class="btn-guide">멘토 가이드</a>
          <a href="#" class="btn-checklist" onclick="showChecklist('default')">준비사항 체크</a>
        </div>
      </div>
    `;
  }

  // 기본 멘토 프로그램 (에러 시)
  setDefaultMentorProgram() {
    const container = document.getElementById('mentor-program-card');
    if (!container) return;
    
    container.innerHTML = `
      <div class="mentor-program-card">
        <div class="program-title">Vision Building</div>
        <div class="program-time-location">📍 분과장에서 직접 진행 | ⏰ 14:00-16:00</div>
        <div class="program-buttons">
          <a href="guides/vision-building.html" class="btn-guide">진행법 보기</a>
          <a href="#" class="btn-checklist" onclick="showChecklist('vision-building')">준비사항 체크</a>
        </div>
      </div>
    `;
  }

  // 오늘의 멘토 프로그램 필터링
  filterTodayMentorPrograms(allScheduleData) {
    if (!this.selectedCenter) return [];

    const centerMap = { 
      'icheon': '이천', 
      'yongin': '용인', 
      'incheon': '인천',
      'sunning': '써닝',
      'sbti': '중소',
      'gapyeong': '가평',
      'cheonggang': '청강' 
    };
    const trainingCenter = centerMap[this.selectedCenter];
    const today = new Date();
   const todayStr = today.toLocaleDateString('sv-SE');
    
    console.log('🎯 멘토 프로그램 필터링:', { trainingCenter, todayStr, selectedCenter: this.selectedCenter });
    
    const filtered = allScheduleData.filter(item => {
      // 연수원 매칭
      if (item.training_center !== trainingCenter) return false;
      
      // 날짜 매칭
      if (!item.date) return false;
      let itemDateStr;
      try {
        const dateObj = new Date(item.date);
        itemDateStr = dateObj.toISOString().split('T')[0];
      } catch {
        return false;
      }
      if (itemDateStr !== todayStr) return false;
      
      // 멘토 역할 확인 (진행, 필수참관)
      const mentorRole = item.mentor_role?.toLowerCase() || '';
      const isMentorProgram = mentorRole.includes('진행') || 
                             mentorRole.includes('lead') || 
                             mentorRole.includes('주도');
      
      // 활성 상태 확인
      const isActive = !item.status || item.status === 'active';
      
      console.log('프로그램 체크:', {
        program: item.program_name,
        mentorRole: item.mentor_role,
        isMentorProgram,
        isActive
      });
      
      return isMentorProgram && isActive;
    });
    
    console.log('✅ 필터링된 멘토 프로그램:', filtered.length, '개');
    return filtered;
  }

  // 멘토 프로그램 렌더링
  renderMentorPrograms(container, programs) {
    if (programs.length === 0) {
      this.showNoMentorProgram(container);
      return;
    }

    container.innerHTML = '';

    if (programs.length === 1) {
      // 단일 프로그램
      const programCard = this.createMentorProgramCard(programs[0]);
      container.appendChild(programCard);
    } else {
      // 다중 프로그램
      const multipleContainer = document.createElement('div');
      multipleContainer.className = 'multiple-programs';
      
      programs.forEach(program => {
        const programCard = this.createMentorProgramCard(program);
        multipleContainer.appendChild(programCard);
      });
      
      container.appendChild(multipleContainer);
    }
  }

  // 멘토 프로그램 카드 생성
  createMentorProgramCard(program) {
    const card = document.createElement('div');
    card.className = 'mentor-program-card';
    
    // 시간 파싱을 위해 ScheduleManager의 함수 사용
    const timeStart = this.scheduleManager.parseExcelTime(program.time_start);
    const timeEnd = this.scheduleManager.parseExcelTime(program.time_end);
    const timeDisplay = (timeEnd && timeEnd !== '시간미정') ? `${timeStart}-${timeEnd}` : timeStart;
    
    const programName = program.program_name || '프로그램명 없음';
    const location = program.location || '장소미정';
    const mentorRole = program.mentor_role || '';
    
    // 프로그램 타입에 따른 스타일
    if (mentorRole.includes('진행') || mentorRole.includes('lead')) {
      card.classList.add('lead');
    } else if (mentorRole.includes('필수')) {
      card.classList.add('required');
    }
    
    // 프로그램 ID 추출 (가이드 링크용)
    const programId = this.getProgramId(programName);
    
    card.innerHTML = `
      <div class="program-badge">${mentorRole}</div>
      <div class="program-title">${programName}</div>
      <div class="program-time-location">
        <div class="program-location">📍 ${location}</div>
        <div class="program-time">⏰ ${timeDisplay}</div>
      </div>
      <div class="program-buttons">
        ${programId ? `<a href="guides/${programId}.html" class="btn-guide">📋 진행법 보기</a>` : ''}
        <button class="btn-checklist" onclick="showProgramChecklist('${programId || 'default'}')">✅ 준비사항 체크</button>
      </div>
    `;
    
    return card;
  }

  // 프로그램 ID 추출 (가이드 파일명용)
  getProgramId(programName) {
    const programMap = {
      'Vision Building': 'vision-building',
      'Daily Opening': 'daily-opening',
      'Play SKMS': 'play-skms',
      '기념관 Tour': 'memorial-tour',
      '성장 Roadmap': 'growth-roadmap',
      'Biz. Manner': 'business-manner'
    };
    
    // 프로그램명에서 키워드 찾기
    for (const [key, value] of Object.entries(programMap)) {
      if (programName.includes(key)) {
        return value;
      }
    }
    
    return null;
  }

  // 멘토 프로그램 없음 표시
  showNoMentorProgram(container) {
    container.innerHTML = `
      <div class="no-mentor-program">
        <h3>🤔 오늘은 멘토 직접 진행 프로그램이 없습니다</h3>
        <p>선택참관 프로그램이나 일반 강의가 있는 날입니다.</p>
        <small>멘토 역할: 참관 및 멘티 케어</small>
      </div>
    `;
  }

  // 멘토 프로그램 에러 표시
  showMentorProgramError(container) {
    container.innerHTML = `
      <div class="no-mentor-program">
        <h3>❌ 멘토 프로그램을 불러올 수 없습니다</h3>
        <p>네트워크 연결을 확인해주세요.</p>
        <button onclick="window.app.updateTodayMentorProgram()" style="margin-top: 12px; background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">다시 시도</button>
      </div>
    `;
  }

  updateHeader() {
    // 오늘 날짜 업데이트
    const todayDateElement = document.getElementById('today-date');
    if (todayDateElement) {
      const today = new Date();
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      };
      const dateString = today.toLocaleDateString('ko-KR', options);
      todayDateElement.textContent = `📅 ${dateString}`;
    }

    // 연수원 정보 업데이트
    const subtitle = document.getElementById('headerSubtitle');
    if (subtitle && this.selectedCenter) {
      const centerMap = {
        'icheon': '이천 SKT인재개발원',
        'yongin': '용인 SK아카데미', 
        'incheon': '인천 SK무의연수원',
        'sunning': '써닝 리더십센터',
        'sbti': '중소벤처기업연수원',
        'gapyeong' : '가평 교원비전센터',
        'cheonggang' : '청강문화산업대학교'
      };
      const centerName = centerMap[this.selectedCenter];
      subtitle.textContent = `2026년 7월 SK그룹 신입구성원과정 - ${centerName}`;
    }
  }

    // =================================================================
  // 2. Config 로드 시스템 메서드들 (새로 추가)
  // =================================================================

  /**
   * Config 파일 로드
   */
  async loadConfig() {
    try {
      console.log('📄 Config 파일 로드 시도...');
      
      const response = await fetch('/data/config.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.config = await response.json();
      this.configLoaded = true;
      
      console.log('✅ Config 로드 성공');
      console.log('- 연수원:', Object.keys(this.config.trainingCenters || {}).length, '개');
      console.log('- 체크리스트:', Object.keys(this.config.programChecklists || {}).length, '개');
      console.log('- 기본 일정:', this.config.defaultSchedule?.length || 0, '개');
      
    } catch (error) {
      console.error('❌ Config 로드 실패:', error);
      this.config = this.getEmergencyConfig();
      this.configLoaded = false;
      
      console.warn('🔧 비상 Config 사용 중');
    }
  }

  /**
   * 비상 Config (config.json 로드 실패시 사용)
   */
  getEmergencyConfig() {
    return {
      system: {
        googleScript: {
          url: "https://script.google.com/macros/s/AKfycbyvkEufshC8wwQwMqO5nJsdhhUC6EvBqKkeXVR5YF5cQnnPLUG3oo5d0eObTVkjN55Y/exec",
          endpoints: {
            schedule: "?action=gettimetable",
            contacts: "?action=getTrainingCenters"
          }
        },
        cache: {
          timeout: 300000,
          keys: {
            schedule: "schedule-backup",
            contacts: "contacts-backup"
          }
        }
      },
      trainingCenters: {
        icheon: {
          id: "icheon",
          name: "이천 SKT인재개발원",
          operations: { name: "운영팀", phone: "031-630-8914" },
          mentorSupport: { name: "멘토지원팀", phone: "031-630-8915" },
          emergencyPhone: "031-630-8914"
        },
        yongin: {
          id: "yongin", 
          name: "용인 SK아카데미",
          operations: { name: "운영팀", phone: "031-XXX-XXXX" },
          mentorSupport: { name: "멘토지원팀", phone: "031-XXX-XXXX" },
          emergencyPhone: "031-XXX-XXXX"
        },
        incheon: {
          id: "incheon",
          name: "인천 무의연수원", 
          operations: { name: "운영팀", phone: "031-XXX-XXXX" },
          mentorSupport: { name: "멘토지원팀", phone: "031-XXX-XXXX" },
          emergencyPhone: "031-XXX-XXXX"
        }
      },
      programChecklists: {
        default: ["프로그램 내용 사전 숙지", "필요한 준비물 확인", "멘티 참여도 관찰"]
      },
      defaultSchedule: []
    };
  }

  // =================================================================
  // 3. Config 데이터 접근 메서드들 (새로 추가)
  // =================================================================

  /**
   * 연수원 정보 가져오기
   */
  getTrainingCenter(centerId) {
    if (!this.config || !centerId) return null;
    return this.config.trainingCenters?.[centerId] || null;
  }

  /**
   * 연수원 이름 가져오기 (간단 버전)
   */
  getTrainingCenterName(centerId) {
    const center = this.getTrainingCenter(centerId);
    return center?.name || `${centerId} 연수원`;
  }

  /**
   * 체크리스트 가져오기
   */
  getChecklist(programId) {
    if (!this.config) return [];
    return this.config.programChecklists?.[programId] || 
           this.config.programChecklists?.default || [];
  }

  /**
   * 구글시트 URL 가져오기
   */
  getGoogleScriptURL(action = 'schedule') {
    if (!this.config) return '';
    
    const baseURL = this.config.system?.googleScript?.url || '';
    const endpoint = this.config.system?.googleScript?.endpoints?.[action] || '';
    
    return baseURL + endpoint;
  }

  /**
   * 캐시 설정 가져오기
   */
  getCacheConfig() {
    return this.config?.system?.cache || {
      timeout: 300000,
      keys: { schedule: "schedule-backup", contacts: "contacts-backup" }
    };
  }

  /**
   * 기본 일정 데이터 가져오기
   */
  getDefaultSchedule() {
    return this.config?.defaultSchedule || [];
  }

  // =================================================================
  // 4. 3단계 Fallback 데이터 흐름 (새로 추가)
  // =================================================================

  /**
   * 데이터 가져오기 (3단계 fallback)
   */
  async getData(type = 'schedule') {
    try {
      // 1단계: 구글시트에서 가져오기
      console.log(`📡 구글시트에서 ${type} 데이터 요청...`);
      return await this.getFromGoogleSheets(type);
      
    } catch (error) {
      console.warn(`⚠️ 구글시트 연결 실패, 캐시 확인 중... (${error.message})`);
      
      try {
        // 2단계: 캐시에서 가져오기
        const cachedData = this.getFromCache(type);
        if (cachedData && cachedData.length > 0) {
          console.log(`💾 캐시에서 ${type} 데이터 로드`);
          return cachedData;
        }
        throw new Error('캐시 데이터 없음');
        
      } catch (cacheError) {
        console.warn(`⚠️ 캐시도 실패, config 데이터 사용... (${cacheError.message})`);
        
        // 3단계: config.json에서 가져오기
        return this.getFromConfig(type);
      }
    }
  }

  /**
   * 구글시트에서 데이터 가져오기
   */
  async getFromGoogleSheets(type) {
    const url = this.getGoogleScriptURL(type);
    if (!url) throw new Error('구글시트 URL 없음');
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`구글시트 응답 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 성공시 캐시에 저장
    this.saveToCache(type, data);
    
    return data;
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  getFromCache(type) {
    const cacheConfig = this.getCacheConfig();
    const cacheKey = cacheConfig.keys[type];
    
    if (!cacheKey) throw new Error(`캐시 키 없음: ${type}`);
    
    try {
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}-time`);
      
      if (!cachedData) throw new Error('캐시 데이터 없음');
      
      // 캐시 만료 확인
      if (cacheTime && Date.now() - parseInt(cacheTime) > cacheConfig.timeout) {
        console.warn('⏰ 캐시 데이터 만료됨');
        // 만료되어도 반환 (오프라인 상황에서는 오래된 데이터라도 유용)
      }
      
      return JSON.parse(cachedData);
      
    } catch (error) {
      throw new Error(`캐시 로드 실패: ${error.message}`);
    }
  }

  /**
   * 캐시에 데이터 저장
   */
  saveToCache(type, data) {
    const cacheConfig = this.getCacheConfig();
    const cacheKey = cacheConfig.keys[type];
    
    if (!cacheKey) return;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}-time`, Date.now().toString());
      console.log(`💾 ${type} 데이터 캐시 저장 완료`);
    } catch (error) {
      console.warn(`⚠️ 캐시 저장 실패: ${error.message}`);
    }
  }

  /**
   * config.json에서 데이터 가져오기 (최후 수단)
   */
  getFromConfig(type) {
    switch (type) {
      case 'schedule':
        const defaultSchedule = this.getDefaultSchedule();
        console.log(`📄 config에서 기본 일정 로드: ${defaultSchedule.length}개`);
        return defaultSchedule;
        
      case 'contacts':
        const centers = Object.values(this.config?.trainingCenters || {});
        console.log(`📄 config에서 연수원 정보 로드: ${centers.length}개`);
        return centers;
        
      default:
        console.warn(`❌ 알 수 없는 데이터 타입: ${type}`);
        return [];
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const bgColor = type === 'success' ? '#4caf50' : 
                   type === 'warning' ? '#ff9800' : 
                   type === 'error' ? '#f44336' : '#2196f3';
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // 3초 후 자동 제거
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// =================================================================
// 전역 함수들
// =================================================================

// 오늘 일정 새로고침
async function refreshTodaySchedule() {
  const refreshBtn = document.querySelector('.btn-refresh-schedule');
  
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '🔄 새로고침 중...';
  }
  
  try {
    // 캐시 클리어
    if (window.app) {
      window.app.googleSheetService.clearCache();
      await window.app.scheduleManager.updateTodaySchedule();
      window.app.showToast('일정이 새로고침되었습니다', 'success');
    }
  } catch (error) {
    console.error('새로고침 실패:', error);
    if (window.app) {
      window.app.showToast('새로고침에 실패했습니다', 'error');
    }
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '🔄 새로고침';
    }
  }
}

// 동적 전체 일정 표시
async function showDynamicFullTimetable() {
  const modal = document.getElementById('dynamicTimetableModal');
  const container = document.getElementById('dynamicTimetableContainer');
  const title = document.getElementById('modalTitle');
  const lastUpdated = document.getElementById('dataLastUpdated');
  
  if (!modal || !container) return;
  
  // 모달 표시
  modal.style.display = 'flex';
  
  // 제목 업데이트
  if (title && window.app) {
    const centerMap = {
      'icheon': '이천 SKT인재개발원',
      'yongin': '용인 SK아카데미', 
      'incheon': '인천 SK무의연수원',
      'sunning': '써닝 리더십센터',
      'sbti': '중소벤처기업연수원',
      'gapyeong' : '가평 교원비전센터',
      'cheonggang' : '청강문화산업대학교'
    };
    const centerName = centerMap[window.app.selectedCenter] || '연수원';
    title.textContent = `📅 ${centerName} 전체 일정`;
  }
  
  // 로딩 표시
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="loading-spinner"></div>
      <p>전체 일정을 불러오는 중...</p>
    </div>
  `;
  
  try {
    // 전체 일정 생성
    if (window.app) {
      const timetableHTML = await window.app.scheduleManager.generateFullTimetable();
      container.innerHTML = timetableHTML;
      
      // 마지막 업데이트 시간 표시
      if (lastUpdated) {
        lastUpdated.textContent = `마지막 업데이트: ${new Date().toLocaleString('ko-KR')}`;
      }
    }
  } catch (error) {
    console.error('전체 일정 로드 실패:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #f44336;">
        <p>❌ 전체 일정을 불러올 수 없습니다</p>
        <small>${error.message}</small>
      </div>
    `;
  }
  
  // 모달 애니메이션
  modal.style.opacity = '0';
  requestAnimationFrame(() => {
    modal.style.transition = 'opacity 0.3s ease';
    modal.style.opacity = '1';
  });
  
  // ESC 키로 닫기
  document.addEventListener('keydown', closeModalOnEscape);
}

// 동적 전체 일정 닫기
function closeDynamicTimetable() {
  const modal = document.getElementById('dynamicTimetableModal');
  if (!modal) return;
  
  modal.style.transition = 'opacity 0.3s ease';
  modal.style.opacity = '0';
  
  setTimeout(() => {
    modal.style.display = 'none';
    modal.style.transition = '';
  }, 300);
  
  document.removeEventListener('keydown', closeModalOnEscape);
}

// ESC 키 이벤트
function closeModalOnEscape(e) {
  if (e.key === 'Escape') {
    closeDynamicTimetable();
  }
}

// 주차별 필터링
function filterTimetableByWeek() {
  const weekFilter = document.getElementById('weekFilter');
  const daySchedules = document.querySelectorAll('.day-schedule');
  
  if (!weekFilter) return;
  
  const selectedWeek = weekFilter.value;
  
  daySchedules.forEach(schedule => {
    if (selectedWeek === 'all') {
      schedule.style.display = 'block';
    } else {
      // 주차별 필터링 로직 (날짜 기반)
      const dateKey = schedule.getAttribute('data-date');
      if (dateKey) {
        const date = new Date(dateKey);
        const weekNumber = getWeekNumber(date);
        
        if (selectedWeek === weekNumber.toString()) {
          schedule.style.display = 'block';
        } else {
          schedule.style.display = 'none';
        }
      }
    }
  });
}

// 요일별 필터링
function filterTimetableByDay() {
  const dayFilter = document.getElementById('dayFilter');
  const daySchedules = document.querySelectorAll('.day-schedule');
  
  if (!dayFilter) return;
  
  const selectedDay = dayFilter.value;
  
  daySchedules.forEach(schedule => {
    if (selectedDay === 'all') {
      schedule.style.display = 'block';
    } else {
      const dateKey = schedule.getAttribute('data-date');
      if (dateKey) {
        const date = new Date(dateKey);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        if (selectedDay === dayName) {
          schedule.style.display = 'block';
        } else {
          schedule.style.display = 'none';
        }
      }
    }
  });
}

// 프로그램 체크리스트 표시
function showProgramChecklist(programId) {
  const checklists = {
    'vision-building': '✅ Vision Building 준비사항\n\n• 장표 준비 (+ BGM)\n• 조별 이젤패드 (4개)\n• 12색 사인펜\n• 포스트잇\n• 4X4 빙고판',
    'memorial-tour': '✅ 기념관 Tour 준비사항\n\n• 개인 노트북 챙기기\n• 스토리텔링 스크립트 숙지\n• 층별 이동 경로 파악\n• 감동 포인트 숙지',
    'daily-opening': '✅ Daily Opening 준비사항\n\n• 8시 30분 전 분과장 도착\n• 오프닝 장표 준비\n• BGM 준비\n• 당일 시간표 확인\n• 출결 체크 준비',
    'growth-roadmap': '✅ 성장 Roadmap 준비사항\n\n• 성장 Roadmap 장표 준비\n• 강점 진단 결과 확인\n• 가이드 질문 숙지\n• 개별 상담 시간 확보',
    'play-skms': '✅ Play SKMS 준비사항\n\n• 조별 이젤패드 (4개)\n• 사인펜, 포스트잇\n• VWBE 관찰 포인트 숙지\n• 게임 규칙 숙지',
    'business-manner': '✅ Biz. Manner 준비사항\n\n• 실습용 명함 준비\n• 정장 착용 확인\n• 인사법 시연 준비\n• 실습 공간 확보',
    'default': '✅ 일반 멘토 프로그램 준비사항\n\n• 프로그램 내용 사전 숙지\n• 필요한 준비물 확인\n• 멘티 참여도 관찰\n• 질문 및 피드백 준비'
  };
  
  const checklist = checklists[programId] || checklists['default'];
  alert(checklist);
}

// =================================================================
// 애니메이션 CSS 추가
// =================================================================
const animationCSS = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .no-schedule, .schedule-error {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 20px 0;
  }
  
  .schedule-error .retry-btn {
    background: #1976d2;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 12px;
  }
  
  .data-source-info {
    text-align: center;
    font-size: 11px;
    color: #999;
    margin-top: 16px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 6px;
  }
`;

// 스타일 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = animationCSS;
document.head.appendChild(styleSheet);

// =================================================================
// 앱 초기화
// =================================================================
let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new SKMentorApp();
  window.app = app; // 전역 접근을 위해
  
  console.log('🚀 앱 로드 완료');
});

// 앱 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKMentorApp, ScheduleManager, GoogleSheetService };
}
