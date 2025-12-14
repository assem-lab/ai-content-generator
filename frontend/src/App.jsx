import React, { useState, useEffect, useRef } from 'react';
import ContentForm from './components/ContentForm.jsx';
import ContentResult from './components/ContentResult.jsx';
import History from './components/History.jsx';
import Hero from './components/Hero.jsx';
import Header from './components/Header.jsx';
import ErrorNotification from './components/ErrorNotification.jsx';
import apiClient from './api'; // Добавляем импорт API клиента
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null); // Добавляем userId
  // const [apiMode, setApiMode] = useState('MOCK'); // Добавляем режим API
  const formRef = useRef(null);

  // // Инициализация при загрузке
  // useEffect(() => {
  //   // Генерируем или получаем user_id
  //   const storedUserId = localStorage.getItem('ai_content_user_id');
  //   if (storedUserId) {
  //     setUserId(storedUserId);
  //   } else {
  //     const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  //     localStorage.setItem('ai_content_user_id', newUserId);
  //     setUserId(newUserId);
  //   }
  // }, []);

  // // Загрузка истории с сервера/мока
  // useEffect(() => {
  //   if (userId) {
  //     loadHistory();
  //   }
  // }, [userId]);

  // const loadHistory = async () => {
  //   try {
  //     const response = await apiClient.getHistory({
  //       user_id: userId,
  //       limit: 10
  //     });

  //     if (response.status === 'success') {
  //       // Конвертируем формат истории для совместимости
  //       const formattedHistory = response.data.items.map(item => ({
  //         id: item.id,
  //         timestamp: item.created_at,
  //         subject: item.topic,
  //         type: item.content_type,
  //         tone: 'professional', // моковые данные
  //         language: item.language,
  //         content: item.content_preview || item.content,
  //         word_count: item.word_count
  //       }));
  //       setHistory(formattedHistory);
  //     }
  //   } catch (error) {
  //     console.error('Ошибка загрузки истории:', error);
  //   }
  // };

  useEffect(() => {
    // 1. ПРИНУДИТЕЛЬНО НАСТРАИВАЕМ REAL API
    apiClient.setMode('REAL', 'https://us-central1-ai-content-generator-478607.cloudfunctions.net');
    console.log('🚀 API Client настроен на REAL режим');

    // 2. Генерируем или получаем user_id
    const storedUserId = localStorage.getItem('ai_content_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      localStorage.setItem('ai_content_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Загрузка истории с РЕАЛЬНОГО сервера
  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    try {
      console.log('📡 Загружаем историю для пользователя:', userId);

      const response = await apiClient.getHistory({
        user_id: userId,
        limit: 10
      });

      console.log('📊 Ответ истории:', response);

      if (response.status === 'success') {
        // Используем реальные данные, без моков
        const formattedHistory = response.data.items.map(item => ({
          id: item.id,
          timestamp: item.created_at,
          subject: item.topic,
          type: item.content_type,
          tone: item.tone || 'professional', // Берем из ответа, не мок
          language: item.language,
          content: item.content_preview || item.content || '',
          word_count: item.word_count || 0
        }));

        console.log('✅ Загружено записей истории:', formattedHistory.length);
        setHistory(formattedHistory);
      } else {
        console.error('❌ Ошибка в ответе истории:', response.error);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки истории:', error);
      // Если API не доступен, показываем пустую историю
      setHistory([]);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Функция для добавления в историю
  const addToHistory = (requestData, responseData) => {
    const historyItem = {
      id: responseData.data.id || Date.now(),
      timestamp: responseData.data.created_at || new Date().toISOString(),
      subject: requestData.subject || requestData.topic,
      type: requestData.type || requestData.content_type,
      tone: requestData.tone,
      language: requestData.language,
      content: responseData.data.content,
      word_count: responseData.data.word_count
    };

    setHistory(prev => [historyItem, ...prev].slice(0, 10));
  };

  // Функция для загрузки старого результата
  const loadFromHistory = (historyItem) => {
    setResult({
      status: "success",
      data: {
        id: historyItem.id,
        content: historyItem.content,
        word_count: historyItem.word_count,
        created_at: historyItem.timestamp,
        content_type: historyItem.type,
        language: historyItem.language
      }
    });
    scrollToForm();
  };

  // Функция для нового запроса
  const handleNewRequest = () => {
    setResult(null);
    setLoading(false);
    setError(null);
  };

  // Функция для закрытия ошибки
  const closeError = () => {
    setError(null);
  };

  // Обработчик результата от формы
  const handleFormResult = (result) => {
    if (result.status === 'error') {
      setError({
        message: result.error?.message || 'Произошла неизвестная ошибка',
        code: result.error?.code || 'UNKNOWN_ERROR'
      });
      setResult(null);
    } else if (result.status === 'success') {
      setResult(result);
      setError(null);
      if (result.requestData) {
        addToHistory(result.requestData, result);
      }
      // Обновляем историю после успешной генерации
      loadHistory();
    }
  };

  // Переключение режима API (опционально, для DevPanel)
  // const handleApiModeChange = (mode) => {
  //   setApiMode(mode);
  //   apiClient.setMode(mode, mode === 'REAL' ? 'http://localhost:8080' : '');
  // };

  return (
    <div className="app">
      <Header />

      {/* Индикатор режима API (только для разработки)
      {process.env.NODE_ENV === 'development' && (
        <div className={`api-indicator ${apiMode.toLowerCase()}`}>
          {apiMode === 'MOCK' ? '🔧 Mock API' : '🚀 Real API'}
        </div>
      )} */}

      {/* Показываем ошибку поверх всего контента */}
      {error && (
        <ErrorNotification
          message={error.message}
          code={error.code}
          onClose={closeError}
        />
      )}

      <div className="hero-fullscreen">
        <Hero onScrollToForm={scrollToForm} />
      </div>

      <div ref={formRef} className="content-container">
        <div className="form-result-container">
          <div className="form-section">
            <ContentForm
              onResult={handleFormResult}
              loading={loading}
              setLoading={setLoading}
              userId={userId} // Передаём userId в форму
            />
          </div>

          <div className="result-section">
            <ContentResult
              result={result}
              loading={loading}
              onNewRequest={handleNewRequest}
            // apiMode={apiMode} // Передаём режим API
            />
          </div>
        </div>

        <History
          history={history}
          onLoadItem={loadFromHistory}
          onRefresh={loadHistory} // Добавляем обновление истории
        />
      </div>
    </div>
  );
}

export default App;