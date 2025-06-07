/**
 * SK 멘토 가이드 - 하이브리드 설정 관리 클래스
 * @version 1.0.0
 * 
 * 설정 로드 우선순위:
 * 1순위: Google Sheets (실시간 최신 정보)
 * 2순위: Cached Config (이전 온라인 데이터)
 * 3순위: config.json (기본값/오프라인 백업)
 */

class ConfigManager {
    constructor() {
        this.configPath = '/data/config.json';
        this.cacheKey = 'sk-mentor-cached-config';
        this.cacheTimeKey = 'sk-mentor-config-cache-time';
        this.cacheTimeout = 30 * 60 * 1000; // 30분 캐시
        
        // Google Sheets URL (향후 config에서 가져올 수도 있음)
        this.googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbyvkEufshC8wwQwMqO5nJsdhhUC6EvBqKkeXVR5YF5cQnnPLUG3oo5d0eObTVkjN55Y/exec';
        
        this.loadedConfig = null;
        this.loadPromise = null;
    }

    /**
     * 메인 설정 로드 함수
     * 하이브리드 전략으로 최적의 설정 반환
     */
    async loadConfig() {
        // 이미 로드 중이면 동일한 Promise 반환 (중복 요청 방지)
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadConfigInternal();
        return this.loadPromise;
    }

    async _loadConfigInternal() {
        console.log('🔧 [ConfigManager] 설정 로드 시작');

        try {
            // 1단계: 기본 config.json 로드 (항상 성공해야 함)
            const baseConfig = await this._loadBaseConfig();
            console.log('✅ [ConfigManager] 기본 설정 로드 완료');

            // 2단계: Google Sheets에서 업데이트 시도
            try {
                const onlineUpdates = await this._loadOnlineConfig();
                console.log('🌐 [ConfigManager] 온라인 설정 로드 완료');
                
                // 3단계: 병합 및 캐시 저장
                const mergedConfig = this._mergeConfigs(baseConfig, onlineUpdates);
                this._saveToCache(mergedConfig);
                
                this.loadedConfig = mergedConfig;
                return mergedConfig;

            } catch (onlineError) {
                console.warn('⚠️ [ConfigManager] 온라인 설정 로드 실패:', onlineError.message);
                
                // 4단계: 캐시된 설정 시도
                const cachedConfig = this._loadFromCache();
                if (cachedConfig) {
                    console.log('💾 [ConfigManager] 캐시된 설정 사용');
                    const mergedConfig = this._mergeConfigs(baseConfig, cachedConfig);
                    this.loadedConfig = mergedConfig;
                    return mergedConfig;
                }
                
                // 5단계: 기본 설정만 사용
                console.log('📋 [ConfigManager] 기본 설정만 사용 (오프라인)');
                this.loadedConfig = baseConfig;
                return baseConfig;
            }

        } catch (error) {
            console.error('❌ [ConfigManager] 설정 로드 실패:', error);
            throw new Error('설정을 불러올 수 없습니다. 앱을 다시 시작해주세요.');
        }
    }

    /**
     * 기본 config.json 파일 로드
     */
    async _loadBaseConfig() {
        try {
            const response = await fetch(this.configPath);
            if (!response.ok) {
                throw new Error(`Config 파일 로드 실패: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ [ConfigManager] 기본 설정 파일 로드 실패:', error);
            throw error;
        }
    }

    /**
     * Google Sheets에서 실시간 설정 로드
     */
    async _loadOnlineConfig() {
        try {
            const response = await fetch(`${this.googleSheetsUrl}?action=getConfig`, {
                method: 'GET',
                timeout: 10000 // 10초 타임아웃
            });

            if (!response.ok) {
                throw new Error(`온라인 설정 로드 실패: ${response.status}`);
            }

            const data = await response.json();
            
            // Google Sheets 응답 형식 검증
            if (!data || typeof data !== 'object') {
                throw new Error('잘못된 온라인 설정 형식');
            }

            return data;

        } catch (error) {
            // 네트워크 오류는 정상적인 상황으로 처리 (오프라인 등)
            if (error.name === 'TypeError' || error.message.includes('fetch')) {
                throw new Error('인터넷 연결 없음');
            }
            throw error;
        }
    }

    /**
     * 기본 설정과 온라인 설정 병합
     */
    _mergeConfigs(baseConfig, onlineConfig) {
        try {
            // Deep merge 수행
            const merged = JSON.parse(JSON.stringify(baseConfig)); // Deep copy
            
            // 온라인 설정으로 덮어쓰기
            if (onlineConfig.trainingCenters) {
                merged.trainingCenters = { ...merged.trainingCenters, ...onlineConfig.trainingCenters };
            }
            
            if (onlineConfig.contacts) {
                merged.contacts = { ...merged.contacts, ...onlineConfig.contacts };
            }
            
            if (onlineConfig.mentorPrinciples) {
                merged.mentorPrinciples = onlineConfig.mentorPrinciples;
            }
            
            if (onlineConfig.quickAccessPrograms) {
                merged.quickAccessPrograms = onlineConfig.quickAccessPrograms;
            }

            // 메타데이터 추가
            merged._metadata = {
                lastUpdated: new Date().toISOString(),
                source: 'hybrid',
                hasOnlineUpdates: true
            };

            return merged;

        } catch (error) {
            console.error('❌ [ConfigManager] 설정 병합 실패:', error);
            return baseConfig; // 병합 실패시 기본 설정 반환
        }
    }

    /**
     * 캐시에 설정 저장
     */
    _saveToCache(config) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(config));
            localStorage.setItem(this.cacheTimeKey, Date.now().toString());
            console.log('💾 [ConfigManager] 설정 캐시 저장 완료');
        } catch (error) {
            console.warn('⚠️ [ConfigManager] 캐시 저장 실패:', error);
        }
    }

    /**
     * 캐시에서 설정 로드
     */
    _loadFromCache() {
        try {
            const cachedTime = localStorage.getItem(this.cacheTimeKey);
            const cachedConfig = localStorage.getItem(this.cacheKey);
            
            if (!cachedTime || !cachedConfig) {
                return null;
            }

            // 캐시 만료 확인
            const cacheAge = Date.now() - parseInt(cachedTime);
            if (cacheAge > this.cacheTimeout) {
                console.log('⏰ [ConfigManager] 캐시 만료됨');
                this._clearCache();
                return null;
            }

            return JSON.parse(cachedConfig);

        } catch (error) {
            console.warn('⚠️ [ConfigManager] 캐시 로드 실패:', error);
            this._clearCache();
            return null;
        }
    }

    /**
     * 캐시 클리어
     */
    _clearCache() {
        try {
            localStorage.removeItem(this.cacheKey);
            localStorage.removeItem(this.cacheTimeKey);
            console.log('🧹 [ConfigManager] 캐시 클리어 완료');
        } catch (error) {
            console.warn('⚠️ [ConfigManager] 캐시 클리어 실패:', error);
        }
    }

    /**
     * 강제 새로고침 (캐시 무시하고 온라인에서 다시 로드)
     */
    async forceRefresh() {
        console.log('🔄 [ConfigManager] 강제 새로고침');
        this._clearCache();
        this.loadedConfig = null;
        this.loadPromise = null;
        return this.loadConfig();
    }

    /**
     * 현재 로드된 설정 반환 (동기)
     */
    getCurrentConfig() {
        if (!this.loadedConfig) {
            console.warn('⚠️ [ConfigManager] 설정이 아직 로드되지 않음');
            return null;
        }
        return this.loadedConfig;
    }

    /**
     * 특정 연수원 정보 가져오기
     */
    getTrainingCenter(centerId) {
        const config = this.getCurrentConfig();
        if (!config || !config.trainingCenters) {
            return null;
        }
        return config.trainingCenters[centerId] || null;
    }

    /**
     * 모든 연수원 목록 가져오기
     */
    getTrainingCenters() {
        const config = this.getCurrentConfig();
        if (!config || !config.trainingCenters) {
            return {};
        }
        return config.trainingCenters;
    }

    /**
     * 멘토 원칙 가져오기
     */
    getMentorPrinciples() {
        const config = this.getCurrentConfig();
        if (!config || !config.mentorPrinciples) {
            return [];
        }
        return config.mentorPrinciples;
    }

    /**
     * 연락처 정보 가져오기
     */
    getContacts() {
        const config = this.getCurrentConfig();
        if (!config || !config.contacts) {
            return {};
        }
        return config.contacts;
    }

    /**
     * 빠른 접근 프로그램 목록 가져오기
     */
    getQuickAccessPrograms() {
        const config = this.getCurrentConfig();
        if (!config || !config.quickAccessPrograms) {
            return [];
        }
        return config.quickAccessPrograms;
    }

    /**
     * 설정 상태 정보 가져오기
     */
    getConfigStatus() {
        const config = this.getCurrentConfig();
        if (!config) {
            return { status: 'not_loaded' };
        }

        const metadata = config._metadata || {};
        const cachedTime = localStorage.getItem(this.cacheTimeKey);
        
        return {
            status: 'loaded',
            source: metadata.source || 'unknown',
            lastUpdated: metadata.lastUpdated || 'unknown',
            hasOnlineUpdates: metadata.hasOnlineUpdates || false,
            cacheAge: cachedTime ? Date.now() - parseInt(cachedTime) : null
        };
    }
}

// 전역 인스턴스 생성 및 내보내기
const configManager = new ConfigManager();

// CommonJS/ES6 호환성
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}

// 글로벌 접근 (브라우저 환경)
if (typeof window !== 'undefined') {
    window.ConfigManager = ConfigManager;
    window.configManager = configManager;
}

console.log('🔧 ConfigManager 클래스 로드 완료');