export class MockBackend {
    constructor() {
        this.history = [];
        this.errorRate = 0.1; // 10% ошибок
    }

    // Задержка сети
    delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Валидация по контракту
    validateRequest(data) {
        const errors = [];

        // 1. Topic (1-500 символов)
        if (!data.topic || data.topic.trim() === '') {
            errors.push({ code: 'TOPIC_REQUIRED', message: 'Поле "topic" обязательно для заполнения' });
        } else if (data.topic.length > 500) {
            errors.push({ code: 'TOPIC_TOO_LONG', message: 'Тема не должна превышать 500 символов' });
        }

        // 2. Content type
        const validContentTypes = ['blog_post', 'social_media', 'email'];
        if (!validContentTypes.includes(data.content_type)) {
            errors.push({ code: 'INVALID_CONTENT_TYPE', message: 'Неверный тип контента' });
        }

        // 3. Tone
        const validTones = ['professional', 'casual', 'funny'];
        if (!validTones.includes(data.tone)) {
            errors.push({ code: 'INVALID_TONE', message: 'Неверный тон' });
        }

        // 4. Language
        const validLanguages = ['ru', 'en'];
        if (!validLanguages.includes(data.language)) {
            errors.push({ code: 'INVALID_LANGUAGE', message: 'Неверный язык' });
        }

        return errors;
    }

    // Генерация контента
    generateContent(data) {
        const templates = {
            blog_post: `# ${data.topic}\n\nЭто подробная статья на тему "${data.topic}".\n\n**Тон:** ${data.tone}\n**Язык:** ${data.language}\n\nИскусственный интеллект продолжает революционизировать различные отрасли...`,
            social_media: `🎯 ${data.topic}\n\nОтличная тема для обсуждения! #AI #${data.tone}`,
            email: `Уважаемый коллега,\n\nПишу вам по поводу: ${data.topic}.\n\nС уважением,\nAI Content Generator`
        };

        const wordCounts = {
            blog_post: 350,
            social_media: 25,
            email: 120
        };

        return {
            content: templates[data.content_type] || templates.blog_post,
            word_count: wordCounts[data.content_type] || 100
        };
    }

    // Основной метод
    async generate(data) {
        // Задержка 1-3 секунды
        await this.delay(1000 + Math.random() * 2000);

        // Случайная ошибка (10% chance)
        if (Math.random() < this.errorRate) {
            const errors = [
                { code: 'GEMINI_API_ERROR', message: 'Сервис AI временно недоступен' },
                { code: 'RATE_LIMIT_EXCEEDED', message: 'Превышен лимит запросов' }
            ];
            const error = errors[Math.floor(Math.random() * errors.length)];
            return { status: 'error', error };
        }

        // Валидация
        const validationErrors = this.validateRequest(data);
        if (validationErrors.length > 0) {
            return { status: 'error', error: validationErrors[0] };
        }

        // Успешный ответ
        const { content, word_count } = this.generateContent(data);
        const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Сохраняем в историю
        this.history.unshift({
            id,
            ...data,
            content,
            word_count,
            created_at: new Date().toISOString()
        });

        return {
            status: 'success',
            data: {
                id,
                content,
                word_count,
                token_count: Math.floor(word_count * 1.3),
                content_type: data.content_type,
                language: data.language,
                created_at: new Date().toISOString(),
                model_used: 'gemini-1.5-pro',
                processing_time_ms: 1500
            }
        };
    }
}

export default new MockBackend();