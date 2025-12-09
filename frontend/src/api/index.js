import mockBackend from './mockBackend';

class APIClient {
    constructor() {
        this.mode = 'MOCK'; // MOCK, REAL
        this.baseURL = '';
        this.mock = mockBackend;
    }

    setMode(mode, baseURL = '') {
        this.mode = mode;
        this.baseURL = baseURL;
        console.log(`API mode changed to: ${mode}`);
    }

    async generate(data) {
        if (this.mode === 'MOCK') {
            return this.mock.generate(data);
        }

        // TODO: Реальный запрос
        try {
            const response = await fetch(`${this.baseURL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            return {
                status: 'error',
                error: { code: 'NETWORK_ERROR', message: 'Ошибка сети' }
            };
        }
    }

    async getHistory(params = {}) {
        if (this.mode === 'MOCK') {
            // Моковая история
            const items = this.mock.history
                .filter(item => !params.user_id || item.user_id === params.user_id)
                .slice(0, params.limit || 10)
                .map(item => ({
                    id: item.id,
                    topic: item.topic,
                    content_preview: item.content.substring(0, 100) + '...',
                    content_type: item.content_type,
                    word_count: item.word_count,
                    language: item.language,
                    created_at: item.created_at
                }));

            return {
                status: 'success',
                data: {
                    items,
                    pagination: {
                        total: this.mock.history.length,
                        limit: params.limit || 10,
                        offset: 0,
                        has_more: false
                    }
                }
            };
        }

        // TODO: Реальный запрос
        return { status: 'error', error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented' } };
    }
}

export default new APIClient();