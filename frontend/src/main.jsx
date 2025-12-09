import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import config, { log } from './config';

// Логирование информации о приложении
log.info(`🚀 ${config.app.name} v${config.app.version}`);
log.info(`🌍 Environment: ${config.app.environment}`);
log.info(`🔧 API Mode: ${config.api.mode}`);
log.info(`🌐 API URL: ${config.api.baseURL}`);

// В режиме разработки показываем предупреждения
if (config.isDevelopment()) {
    log.warn('Running in development mode - debug logs enabled');

    // Предупреждение о моках
    if (config.api.mode === 'MOCK') {
        console.log(`
    ⚠️  ВНИМАНИЕ: Используется MOCK режим API
    📡 Все запросы обрабатываются локально
    🔄 Для переключения на реальный API измените VITE_API_MODE=REAL
    `);
    }
}

// В production режиме отключаем console.log
if (config.isProduction()) {
    // eslint-disable-next-line no-console
    console.log = () => { };
    // eslint-disable-next-line no-console
    console.debug = () => { };
    // eslint-disable-next-line no-console
    console.info = () => { };
}

// Рендеринг приложения
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Отслеживание ошибок
window.addEventListener('error', (event) => {
    log.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    log.error('Unhandled promise rejection:', event.reason);
});