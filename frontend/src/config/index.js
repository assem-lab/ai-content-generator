// Централизованная конфигурация приложения
const config = {
    // Основные настройки
    app: {
        name: import.meta.env.VITE_APP_NAME || 'AI Content Generator',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.VITE_APP_ENV || 'development',
        description: import.meta.env.VITE_APP_DESCRIPTION || '',
    },

    // API настройки
    api: {
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
        mode: import.meta.env.VITE_API_MODE || 'MOCK',
        timeout: 30000, // 30 секунд
        retryAttempts: 3,
        retryDelay: 1000,
    },

    // Настройки отладки
    debug: {
        enabled: import.meta.env.VITE_DEBUG === 'true',
        logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
        enableNetworkLogs: import.meta.env.VITE_APP_ENV !== 'production',
    },

    // Функции для проверки окружения
    isDevelopment: () => import.meta.env.VITE_APP_ENV === 'development',
    isProduction: () => import.meta.env.VITE_APP_ENV === 'production',
    isTest: () => import.meta.env.VITE_APP_ENV === 'test',

    // Функции для логирования
    log: {
        debug: (...args) => {
            if (config.debug.enabled && config.debug.logLevel === 'debug') {
                console.debug('[DEBUG]', ...args);
            }
        },
        info: (...args) => {
            if (config.debug.enabled && ['debug', 'info'].includes(config.debug.logLevel)) {
                console.info('[INFO]', ...args);
            }
        },
        warn: (...args) => {
            if (config.debug.enabled && ['debug', 'info', 'warn'].includes(config.debug.logLevel)) {
                console.warn('[WARN]', ...args);
            }
        },
        error: (...args) => {
            console.error('[ERROR]', ...args);
        },
    },

    // Получение значения переменной окружения с дефолтом
    getEnv: (key, defaultValue = null) => {
        return import.meta.env[key] || defaultValue;
    },

    // Константы для приложения
    constants: {
        contentTypes: ['blog_post', 'social_media', 'email'],
        tones: ['professional', 'casual', 'funny', 'academic'],
        languages: ['ru', 'en'],
        lengths: ['short', 'medium', 'long'],
    },
};

// Экспорт конфигурации
export default config;

// Экспорт хелперов для удобства
export const {
    app,
    api,
    debug,
    isDevelopment,
    isProduction,
    isTest,
    log,
    getEnv,
    constants
} = config;