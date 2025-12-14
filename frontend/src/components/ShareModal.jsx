import React from 'react';
import './ShareModal.css';
import Telegram from '../assets/icons/telegram.png';
import WhatsApp from '../assets/icons/whatsApp.png';
import Twitter from '../assets/icons/twitter.png';
import Vk from '../assets/icons/vk.png';
import Facebook from '../assets/icons/facebook.png';
import LinkedIn from '../assets/icons/linkedIn.png';


const ShareModal = ({ isOpen, onClose, content, title }) => {
    if (!isOpen) return null;

    // ПРАВИЛЬНЫЙ shareData - весь контент!
    const shareData = {
        title: title || 'AI Generated Content',
        text: content, // ← ВЕСЬ текст, а не только первые 100 символов
        url: window.location.href,
    };

    const shareToSocial = (platform) => {
        // Кодируем ВЕСЬ текст
        const encodedText = encodeURIComponent(content);
        const encodedUrl = encodeURIComponent(window.location.href);

        const urls = {
            telegram: `https://t.me/share?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`,
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            vk: `https://vk.com/share.php?url=${encodedUrl}&title=${encodeURIComponent(title)}&comment=${encodedText}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        };

        window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                // Шерим ВЕСЬ контент
                await navigator.share({
                    title: title,
                    text: content, // ← ВЕСЬ текст
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback - копируем весь текст
            navigator.clipboard.writeText(content);
            alert('Content copied to clipboard!');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Share Content</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="share-preview">{content.substring(0, 80)}...</p>

                    <div className="social-grid">
                        <button className="social-btn telegram" onClick={() => shareToSocial('telegram')}>
                            <span className="social-icon"><img src={Telegram} alt="" /></span>
                            <span className="social-name">Telegram</span>
                        </button>

                        <button className="social-btn whatsapp" onClick={() => shareToSocial('whatsapp')}>
                            <span className="social-icon"><img src={WhatsApp} alt="" /></span>
                            <span className="social-name">WhatsApp</span>
                        </button>

                        <button className="social-btn twitter" onClick={() => shareToSocial('twitter')}>
                            <span className="social-icon"><img src={Twitter} alt="" /></span>
                            <span className="social-name">Twitter</span>
                        </button>

                        <button className="social-btn vk" onClick={() => shareToSocial('vk')}>
                            <span className="social-icon"><img src={Vk} alt="" /></span>
                            <span className="social-name">VK</span>
                        </button>

                        <button className="social-btn facebook" onClick={() => shareToSocial('facebook')}>
                            <span className="social-icon"><img src={Facebook} alt="" /></span>
                            <span className="social-name">Facebook</span>
                        </button>

                        <button className="social-btn linkedin" onClick={() => shareToSocial('linkedin')}>
                            <span className="social-icon"><img src={LinkedIn} alt="" /></span>
                            <span className="social-name">LinkedIn</span>
                        </button>
                    </div>

                    <div className="native-share-section">
                        <button className="native-share-btn" onClick={handleNativeShare}>
                            📤 Share via system apps
                        </button>
                        <small>Opens Windows share dialog</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;