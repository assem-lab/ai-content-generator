import React, { useState, useEffect } from 'react';
import './History.css';

const History = ({ history, onLoadItem, onRefresh }) => {
    const [filteredHistory, setFilteredHistory] = useState(history);
    const [searchTerm, setSearchTerm] = useState('');
    const [contentTypeFilter, setContentTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 5;

    // Фильтрация и сортировка
    useEffect(() => {
        let result = [...history];

        // Поиск по теме
        if (searchTerm) {
            result = result.filter(item =>
                item.topic.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Фильтр по типу контента
        if (contentTypeFilter !== 'all') {
            result = result.filter(item => item.content_type === contentTypeFilter);
        }

        // Сортировка
        result.sort((a, b) => {
            const dateA = new Date(a.created_at || a.timestamp);
            const dateB = new Date(b.created_at || b.timestamp);
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredHistory(result);
        setCurrentPage(1); // Сброс пагинации при фильтрации
    }, [history, searchTerm, contentTypeFilter, sortBy]);

    // Пагинация
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleRefresh = async () => {
        if (onRefresh) {
            setLoading(true);
            await onRefresh();
            setLoading(false);
        }
    };

    if (history.length === 0) {
        return (
            <div className="history">
                <div className="history-header-section">
                    <h3>Request History</h3>
                    <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                        {loading ? '🔄' : '🔄'}
                    </button>
                </div>
                <div className="empty-history">
                    <p>No generation history yet</p>
                    <small>Generated content will appear here</small>
                </div>
            </div>
        );
    }

    return (
        <div className="history">
            {/* Header с кнопкой обновления */}
            <div className="history-header-section">
                <h3>Request History ({filteredHistory.length})</h3>
                <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                    {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Controls - Фильтры, поиск, сортировка */}
            <div className="history-controls">
                {/* Поиск */}
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            ✕
                        </button>
                    )}
                </div>

                {/* Фильтры */}
                <div className="filter-controls">
                    <select
                        value={contentTypeFilter}
                        onChange={(e) => setContentTypeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="blog_post">📝 Blog Posts</option>
                        <option value="social_media">📱 Social Media</option>
                        <option value="email">✉️ Email</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Скелетон при загрузке */}
            {loading && (
                <div className="skeleton-loader">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton-item">
                            <div className="skeleton-line skeleton-title"></div>
                            <div className="skeleton-line skeleton-meta"></div>
                            <div className="skeleton-line skeleton-content"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Список истории */}
            <div className="history-list">
                {paginatedHistory.map(item => (
                    <div
                        key={item.id}
                        className="history-item"
                        onClick={() => onLoadItem(item)}
                    >
                        <div className="history-header">
                            <span className="history-type">{getTypeIcon(item.content_type)}</span>
                            <span className="history-topic">{item.topic}</span>
                            <span className="history-date">{formatDate(item.created_at || item.timestamp)}</span>
                        </div>
                        <div className="history-meta">
                            <span className="history-tone">{getToneText(item.tone)}</span>
                            <span className="history-words">{item.word_count || 0} words</span>
                            <span className="history-language">{item.language?.toUpperCase()}</span>
                        </div>
                        <div className="history-preview">
                            {item.content?.substring(0, 100) || 'No content preview'}...
                        </div>
                    </div>
                ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ← Previous
                    </button>

                    <span className="page-info">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Статистика */}
            <div className="history-stats">
                <div className="stat-item">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{history.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Showing:</span>
                    <span className="stat-value">{paginatedHistory.length} of {filteredHistory.length}</span>
                </div>
                {contentTypeFilter !== 'all' && (
                    <div className="stat-item">
                        <span className="stat-label">Filter:</span>
                        <span className="stat-value">{contentTypeFilter.replace('_', ' ')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;