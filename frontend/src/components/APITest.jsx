// Создай временно `src/components/APITest.jsx`
import React, { useState } from 'react';
import apiClient from '../api';

const APITest = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testGenerate = async () => {
        setLoading(true);
        const response = await apiClient.generate({
            topic: "Искусственный интеллект в образовании",
            content_type: "blog_post",
            tone: "professional",
            language: "ru"
        });
        setResult(response);
        setLoading(false);
    };

    const testHistory = async () => {
        setLoading(true);
        const response = await apiClient.getHistory({ user_id: 'demo_user' });
        setResult(response);
        setLoading(false);
    };

    const testConnection = async () => {
        const connection = await apiClient.testConnection();
        setResult(connection);
    };

    return (
        <div style={{ padding: '20px', background: '#f0f0f0' }}>
            <h3>API Тесты</h3>
            <button onClick={testConnection} disabled={loading}>Test Connection</button>
            <button onClick={testGenerate} disabled={loading}>Test Generate</button>
            <button onClick={testHistory} disabled={loading}>Test History</button>

            {result && (
                <pre style={{ background: 'white', padding: '10px', marginTop: '10px' }}>
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
};

export default APITest;