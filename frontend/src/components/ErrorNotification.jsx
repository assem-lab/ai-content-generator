import React, { useEffect } from 'react';
import './ErrorNotification.css';

const ErrorNotification = ({ message, code, onClose }) => {
    // Автоматически закрываем через 10 секунд
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 10000);

        return () => clearTimeout(timer);
    }, [onClose]);

    // Получаем заголовок ошибки по коду из контракта
    const getErrorTitle = (code) => {
        const errorTitles = {
            // Ошибки валидации (400)
            'TOPIC_REQUIRED': 'Не указана тема',
            'TOPIC_TOO_LONG': 'Тема слишком длинная',
            'INVALID_CONTENT_TYPE': 'Неверный тип контента',
            'INVALID_TONE': 'Неверный тон',
            'INVALID_LANGUAGE': 'Неверный язык',
            'VALIDATION_ERROR': 'Ошибка валидации',

            // Ошибки сервера (5xx)
            'GEMINI_API_ERROR': 'Ошибка AI сервиса',
            'AI_SERVICE_ERROR': 'Ошибка AI сервиса',
            'FIRESTORE_ERROR': 'Ошибка базы данных',
            'INTERNAL_SERVER_ERROR': 'Внутренняя ошибка сервера',

            // Ошибки клиента
            'RATE_LIMIT_EXCEEDED': 'Превышен лимит запросов',
            'NETWORK_ERROR': 'Ошибка сети',
            'GENERATION_NOT_FOUND': 'Генерация не найдена',
            'UNAUTHORIZED_ACCESS': 'Доступ запрещён',

            // По умолчанию
            'UNKNOWN_ERROR': 'Неизвестная ошибка'
        };

        return errorTitles[code] || 'Ошибка';
    };

    // Определяем тип ошибки для стилизации
    const getErrorType = (code) => {
        if (code?.includes('VALIDATION') || code?.includes('INVALID') || code === 'TOPIC_REQUIRED' || code === 'TOPIC_TOO_LONG') {
            return 'validation';
        }
        if (code?.includes('NETWORK') || code?.includes('RATE_LIMIT')) {
            return 'network';
        }
        if (code?.includes('API_ERROR') || code?.includes('SERVICE_ERROR')) {
            return 'api';
        }
        return 'server';
    };

    const errorType = getErrorType(code);

    return (
        <div className={`error-notification error-${errorType}`}>
            <div className="error-content">
                <div className="error-header">
                    <span className="error-icon">
                        {errorType === 'validation' ? '📋' :
                            errorType === 'network' ? '📡' :
                                errorType === 'api' ? '🔧' : '❌'}
                    </span>
                    <div className="error-title-container">
                        <h3 className="error-title">{getErrorTitle(code)}</h3>
                        {code && (
                            <span className="error-status">
                                {errorType === 'validation' ? '400' :
                                    code === 'RATE_LIMIT_EXCEEDED' ? '429' :
                                        code === 'GENERATION_NOT_FOUND' ? '404' :
                                            code?.includes('API') ? '502' : '500'}
                            </span>
                        )}
                    </div>
                    <button
                        className="error-close"
                        onClick={onClose}
                        aria-label="Закрыть уведомление"
                    >
                        ×
                    </button>
                </div>

                <p className="error-message">{message}</p>

                {code && code !== 'UNKNOWN_ERROR' && (
                    <div className="error-footer">
                        <div className="error-code">
                            Код ошибки: <code>{code}</code>
                        </div>
                        <div className="error-timestamp">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorNotification;