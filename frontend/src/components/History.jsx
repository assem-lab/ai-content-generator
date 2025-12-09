import React from 'react';
import './History.css';

const History = ({ history, onLoadItem }) => {
    if (history.length === 0) {
        return null;
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'blog_post': return '📝';
            case 'social_media': return '📱';
            case 'email': return '✉️';
            default: return '📄';
        }
    };

    const getToneText = (tone) => {
        switch (tone) {
            case 'professional': return 'Prof.';
            case 'casual': return 'Casual';
            case 'funny': return 'Funny';
            default: return tone;
        }
    };

    return (
        <div className="history">
            <h3>Request History</h3>
            <div className="history-list">
                {history.map(item => (
                    <div
                        key={item.id}
                        className="history-item"
                        onClick={() => onLoadItem(item)}
                    >
                        <div className="history-header">
                            <span className="history-type">{getTypeIcon(item.content_type)}</span>
                            <span className="history-topic">{item.topic}</span>
                        </div>
                        <div className="history-meta">
                            <span className="history-tone">{getToneText(item.tone)}</span>
                            <span className="history-words">{item.word_count} words</span>
                            <span className="history-time">{item.timestamp}</span>
                        </div>
                        <div className="history-preview">
                            {item.content.substring(0, 80)}...
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
