
import React, { useState } from 'react';
import './ContentResult.css';
import ShareModal from './ShareModal.jsx';
import CopyIcon from '../assets/icons/copy.png';
import ShareIcon from '../assets/icons/Export.png';
import NewPromptIcon from '../assets/icons/New-prompt.png';

const ContentResult = ({ result, loading, onNewRequest, apiMode }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    // Add function for error messages by contract
    const getErrorMessage = (code) => {
        const messages = {
            'TOPIC_REQUIRED': '⚠️ Enter topic for generation',
            'TOPIC_TOO_LONG': '⚠️ Topic too long (maximum 500 characters)',
            'INVALID_CONTENT_TYPE': '⚠️ Invalid content type selected',
            'INVALID_TONE': '⚠️ Invalid tone selected',
            'INVALID_LANGUAGE': '⚠️ Invalid language selected',
            'AI_SERVICE_ERROR': '🔧 AI service error. Try again later.',
            'GEMINI_API_ERROR': '🔧 AI service error. Try again later.',
            'RATE_LIMIT_EXCEEDED': '⏱️ Too many requests. Wait a minute.',
            'VALIDATION_ERROR': '📋 Correct errors in the form',
            'NETWORK_ERROR': '📡 Network error. Check connection.',
            'UNKNOWN_ERROR': '❌ Unknown error'
        };
        return messages[code] || result?.error?.message || 'An error occurred';
    };

    // Add title for content type
    const getContentTypeTitle = (type) => {
        const titles = {
            'blog_post': '📝 Blog article',
            'social_media': '💬 Social media post',
            'email': '📧 Email'
        };
        return titles[type] || 'Content';
    };

    const handleCopy = () => {
        if (result?.data?.content) {
            navigator.clipboard.writeText(result.data.content);
            alert('Content copied to clipboard!');
        }
    };

    // const handleShare = () => {
    //     if (result?.data?.content) {
    //         if (navigator.share) {
    //             navigator.share({
    //                 title: 'Generated content',
    //                 text: result.data.content,
    //             });
    //         } else {
    //             navigator.clipboard.writeText(result.data.content);
    //             alert('Content copied to clipboard for sharing!');
    //         }
    //     }
    // };

    if (loading) {
        return (
            <div className="result-section loading">
                <div className="result-header">
                    <h3>Result</h3>
                    {/* Add API mode indicator */}
                    {apiMode && (
                        <div className="api-mode-indicator">
                            {apiMode === 'MOCK' ? '🔧 Mock' : '🚀 Real'}
                        </div>
                    )}
                </div>
                <div className="result-content">
                    <div className="loader">
                        <div className="spinner"></div>
                        <span>Generating content...</span>
                    </div>
                </div>
                <div className="result-actions">
                    <button className="btn-copy" disabled>
                        <span>Copy</span>
                        <span className="checkbox"><img src={CopyIcon} alt="copy-icon" /></span>
                    </button>
                    <button className="btn-share" disabled>
                        <span>Share</span>
                        <span className="checkbox"><img src={ShareIcon} alt="share-icon" /></span>
                    </button>
                    <button className="btn-new" disabled>
                        <span>New request</span>
                        <span className="checkbox"><img src={NewPromptIcon} alt="new-prompt-icon" /></span>
                    </button>
                </div>
            </div>
        );
    }

    if (result?.status === 'error') {
        // Determine error type
        const isValidationError = result.error?.code === 'VALIDATION_ERROR';
        const isApiError = ['GEMINI_API_ERROR', 'AI_SERVICE_ERROR', 'RATE_LIMIT_EXCEEDED'].includes(result.error?.code);

        return (
            <div className={`result - section error ${isValidationError ? 'validation' : isApiError ? 'api' : 'server'} `}>
                <div className="result-header">
                    <h3># {isValidationError ? 'Validation Error' : 'Generation Error'}</h3>
                </div>
                <div className="result-content">
                    <p className="error-message">
                        {getErrorMessage(result.error?.code)}
                    </p>
                    {/* Show error code if exists */}
                    {result.error?.code && (
                        <div className="error-code">
                            Code: <code>{result.error.code}</code>
                        </div>
                    )}
                </div>
                <div className="result-actions">
                    <button className="btn-copy" disabled>
                        <span>Copy</span>
                        <span className="checkbox"><img src={CopyIcon} alt="copy-icon" /></span>
                    </button>
                    <button className="btn-share" disabled>
                        <span>Share</span>
                        <span className="checkbox"><img src={ShareIcon} alt="share-icon" /></span>
                    </button>
                    <button className="btn-new" onClick={onNewRequest}>
                        <span>{isValidationError ? 'Fix form' : 'Try again'}</span>
                        <span className="checkbox">[ ]</span>
                    </button>
                </div>
            </div>
        );
    }

    // Always show full structure, even when no result
    const hasContent = result?.data?.content;

    return (
        <div className={`result - section ${hasContent ? 'success' : 'empty'} `}>
            <div className="result-header">
                <h3>Result</h3>
                {/* Add content type title if exists */}
                {hasContent && result.data.content_type && (
                    <div className="content-type-badge">
                        {getContentTypeTitle(result.data.content_type)}
                    </div>
                )}
            </div>
            <div className="result-content">
                {hasContent ? (
                    <>
                        <div className="content-text">{result.data.content}</div>
                        <div className="content-meta">
                            <span>Words: {result.data.word_count}</span>
                            <span>ID: {result.data.id?.substring(0, 10)}...</span>
                            <span>Language: {result.data.language === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
                            <span>Created: {new Date(result.data.created_at).toLocaleString()}</span>
                        </div>
                        {hasContent && (
                            <ShareModal
                                isOpen={showShareModal}
                                onClose={() => setShowShareModal(false)}
                                content={result.data.content}
                                title={`AI Generated: ${result.data.topic || 'Content'}`}
                            />
                        )}
                    </>
                ) : (
                    <div className="empty-content">
                        <div className="empty-icon">✨</div>
                        <p>Ready for generation</p>
                        <div className="empty-tips">
                            <div>✅ Enter topic (up to 500 characters)</div>
                            <div>✅ Select content type</div>
                            <div>✅ Select tone and language</div>
                        </div>
                    </div>
                )}
            </div>
            <div className="result-actions">
                <button
                    className="btn-copy"
                    onClick={handleCopy}
                    disabled={!hasContent}
                >
                    <span>Copy</span>
                    <span className="checkbox"><img src={CopyIcon} alt="copy-icon" /></span>
                </button>
                {/* <button
                    className="btn-share"
                    onClick={handleShare}
                    disabled={!hasContent}
                >
                    <span>Share</span>
                    <span className="checkbox"><img src={ShareIcon} alt="share-icon" /></span>
                </button> */}
                <button
                    className="btn-share"
                    onClick={() => setShowShareModal(true)} // Открываем модалку
                    disabled={!hasContent}
                >
                    <span>Share</span>
                    <span className="checkbox"><img src={ShareIcon} alt="share-icon" /></span>
                </button>
                <button
                    className="btn-new"
                    onClick={onNewRequest}
                    disabled={!hasContent && !result}
                >
                    <span>New request</span>
                    <span className="checkbox"><img src={NewPromptIcon} alt="new-prompt-icon" /></span>
                </button>
            </div>
        </div>
    );
};

export default ContentResult;
