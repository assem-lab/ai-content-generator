import axios from 'axios';
// Базовый URL - ТОЛЬКО REAL API
const API_BASE_URL = 'https://us-central1-ai-content-generator-478607.cloudfunctions.net';

console.log(`🌐 API Mode: REAL`);
console.log(`📡 API URL: ${API_BASE_URL}`);

// Создаем экземпляр axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 секунд как в контракте
});

// Основной API клиент
export const apiClient = {
    /**
     * Генерация контента (POST /generate)
     * @param {Object} data - Данные для генерации
     */
    generate: async (data) => {
        try {
            console.log('📤 Sending to /generate:', data);

            const response = await api.post('/generate', {
                topic: data.topic || data.subject,
                content_type: data.content_type || data.type,
                tone: data.tone,
                language: data.language,
                length: data.length || 'medium',
                user_id: data.user_id || 'demo_user'
            });

            console.log('✅ Backend response:', response.data);

            // Форматируем ответ по контракту
            if (response.data.status === 'success') {
                return {
                    status: 'success',
                    data: {
                        id: response.data.data.id || `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        content: response.data.data.content,
                        word_count: response.data.data.word_count || 0,
                        token_count: response.data.data.token_count || 0,
                        content_type: response.data.data.content_type,
                        language: response.data.data.language,
                        created_at: response.data.data.created_at || new Date().toISOString(),
                        model_used: response.data.data.model_used || 'gemini-1.5-pro',
                        processing_time_ms: response.data.data.processing_time_ms || 0
                    }
                };
            } else {
                // Ошибка от бэкенда
                return response.data;
            }

        } catch (error) {
            console.error('❌ API Error:', error);

            if (error.code === 'ECONNABORTED') {
                return {
                    status: 'error',
                    error: {
                        code: 'TIMEOUT_ERROR',
                        message: 'Request timeout. AI service is taking too long to respond.'
                    }
                };
            }

            if (!error.response) {
                return {
                    status: 'error',
                    error: {
                        code: 'NETWORK_ERROR',
                        message: 'Network error. Check your internet connection.'
                    }
                };
            }

            // Ошибка от сервера
            return error.response.data || {
                status: 'error',
                error: {
                    code: `HTTP_${error.response.status}`,
                    message: `Server error: ${error.response.status}`
                }
            };
        }
    },

    /**
     * Получение истории генераций (GET /history)
     * @param {Object} params - Параметры запроса
     */
    getHistory: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams({
                user_id: params.user_id || 'demo_user',
                limit: params.limit || 20,
                offset: params.offset || 0,
                ...(params.content_type && { content_type: params.content_type }),
                ...(params.from_date && { from_date: params.from_date }),
                ...(params.to_date && { to_date: params.to_date })
            });

            const response = await api.get(`/history?${queryParams}`);
            return response.data;

        } catch (error) {
            console.error('History API Error:', error);
            return {
                status: 'error',
                error: {
                    code: 'HISTORY_ERROR',
                    message: 'Failed to fetch history'
                }
            };
        }
    },

    /**
     * Получение деталей генерации (GET /history/{id})
     * @param {string} generationId - ID генерации
     */
    getGenerationDetails: async (generationId) => {
        try {
            const response = await api.get(`/history/${generationId}`);
            return response.data;
        } catch (error) {
            console.error('Generation details error:', error);
            return {
                status: 'error',
                error: {
                    code: 'DETAILS_ERROR',
                    message: 'Failed to fetch generation details'
                }
            };
        }
    },

    /**
     * Удаление генерации (DELETE /history/{id})
     * @param {string} generationId - ID генерации
     * @param {string} userId - ID пользователя
     */
    deleteGeneration: async (generationId, userId) => {
        try {
            const response = await api.delete(`/history/${generationId}`, {
                data: { user_id: userId }
            });
            return response.data;
        } catch (error) {
            console.error('Delete error:', error);
            return {
                status: 'error',
                error: {
                    code: 'DELETE_ERROR',
                    message: 'Failed to delete generation'
                }
            };
        }
    },

    /**
     * Получение статистики (GET /stats)
     * @param {Object} params - Параметры запроса
     */
    getStats: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams({
                user_id: params.user_id || 'demo_user',
                ...(params.period && { period: params.period })
            });

            const response = await api.get(`/stats?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Stats API Error:', error);
            return {
                status: 'error',
                error: {
                    code: 'STATS_ERROR',
                    message: 'Failed to fetch statistics'
                }
            };
        }
    },

    /**
     * Тест подключения к API
     */
    testConnection: async () => {
        try {
            await api.get('/');
            return { connected: true, message: 'API is available' };
        } catch (error) {
            return { connected: false, message: error.message };
        }
    }
};

export default apiClient;