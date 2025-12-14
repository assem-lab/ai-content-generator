import React, { useState } from 'react';
import './ContentForm.css';
import apiClient from '../api'; // Add API client import

const ContentForm = ({ onResult, loading, setLoading, userId }) => { // Add userId to parameters
    const [formData, setFormData] = useState({
        subject: '',      // Keep subject for compatibility
        tone: '',
        type: '',         // Keep type for compatibility  
        language: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [charCount, setCharCount] = useState(0); // Add character counter

    // Form validation function (improved)
    const validateForm = () => {
        const errors = {};

        if (!formData.subject.trim()) {
            errors.subject = 'Topic is required';
        } else if (formData.subject.length > 500) {
            errors.subject = 'Topic should not exceed 500 characters';
        }

        // Check valid values
        const validTones = ['professional', 'casual', 'funny'];
        if (!validTones.includes(formData.tone)) {
            errors.tone = 'Select tone from the list';
        }

        const validTypes = ['blog_post', 'social_media', 'email'];
        if (!validTypes.includes(formData.type)) {
            errors.type = 'Select content type from the list';
        }

        const validLanguages = ['ru', 'en'];
        if (!validLanguages.includes(formData.language)) {
            errors.language = 'Select language from the list';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation before submission
        if (!validateForm()) {
            onResult({
                status: "error",
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Please fix errors in the form"
                }
            });
            return;
        }

        setLoading(true);
        setFieldErrors({});

        try {
            // Prepare data for API (map subject→topic, type→content_type)
            const apiData = {
                topic: formData.subject,           // Mapping for contract
                content_type: formData.type,      // Mapping for contract
                tone: formData.tone,
                language: formData.language,
                user_id: userId || 'demo_user'    // Add user_id
            };

            // =========== ДЕБАГ ЛОГИ ===========
            console.log('🔍 [DEBUG] Form data:', formData);
            console.log('🔍 [DEBUG] API data being sent:', apiData);
            console.log('🔍 [DEBUG] Calling apiClient.generate...');
            // ==================================

            // Use API client instead of setTimeout
            const response = await apiClient.generate(apiData);

            // =========== ДЕБАГ ЛОГИ ===========
            console.log('🔍 [DEBUG] API Response:', response);
            console.log('🔍 [DEBUG] Response status:', response?.status);
            console.log('🔍 [DEBUG] Response data:', response?.data);
            console.log('🔍 [DEBUG] Response error:', response?.error);
            // ==================================

            // Add requestData for compatibility
            onResult({
                ...response,
                requestData: formData
            });

        } catch (error) {
            // =========== ДЕБАГ ЛОГИ ===========
            console.error('🔍 [DEBUG] Catch error:', error);
            console.error('🔍 [DEBUG] Error message:', error.message);
            console.error('🔍 [DEBUG] Error code:', error.code);
            console.error('🔍 [DEBUG] Error response:', error.response);
            console.error('🔍 [DEBUG] Error response data:', error.response?.data);
            // ==================================

            // Network error handling
            onResult({
                status: "error",
                error: {
                    code: "NETWORK_ERROR",
                    message: "Network error. Check connection."
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     // Validation before submission
    //     if (!validateForm()) {
    //         onResult({
    //             status: "error",
    //             error: {
    //                 code: "VALIDATION_ERROR",
    //                 message: "Please fix errors in the form"
    //             }
    //         });
    //         return;
    //     }

    //     setLoading(true);
    //     setFieldErrors({});

    //     try {
    //         // Prepare data for API (map subject→topic, type→content_type)
    //         const apiData = {
    //             topic: formData.subject,           // Mapping for contract
    //             content_type: formData.type,      // Mapping for contract
    //             tone: formData.tone,
    //             language: formData.language,
    //             user_id: userId || 'demo_user'    // Add user_id
    //         };

    //         // Use API client instead of setTimeout
    //         const response = await apiClient.generate(apiData);

    //         // Add requestData for compatibility
    //         onResult({
    //             ...response,
    //             requestData: formData
    //         });

    //     } catch (error) {
    //         // Network error handling
    //         onResult({
    //             status: "error",
    //             error: {
    //                 code: "NETWORK_ERROR",
    //                 message: "Network error. Check connection."
    //             }
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Reset field error when changed
        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: null
            });
        }

        // Update character counter for subject
        if (name === 'subject') {
            setCharCount(value.length);
        }
    };

    // Check form validity for button
    const isFormValid = () => {
        return formData.subject.trim() &&
            formData.tone &&
            formData.type &&
            formData.language &&
            Object.keys(fieldErrors).length === 0;
    };

    return (
        <div className="custom-form">
            {/* Subject Field */}
            <div className="form-field">
                <label className="field-label">Topic:</label>
                <div className="input-container">
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Enter topic for generation (1-500 characters)..."
                        className={`custom-input ${fieldErrors.subject ? 'error' : ''}`}
                        disabled={loading}
                        maxLength={500}
                        required
                    />
                </div>
                {fieldErrors.subject && (
                    <div className="field-error">{fieldErrors.subject}</div>
                )}
                <div className="char-counter">{charCount}/500 characters</div>
            </div>

            {/* Tone Field */}
            <div className="form-field">
                <label className="field-label">Tone:</label>
                <div className="input-container">
                    <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleChange}
                        className={`custom-select ${fieldErrors.tone ? 'error' : ''}`}
                        disabled={loading}
                        required
                    >
                        <option value="" disabled>Select tone</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="funny">Funny</option>
                    </select>
                    <div className="select-arrow">▼</div>
                </div>
                {fieldErrors.tone && (
                    <div className="field-error">{fieldErrors.tone}</div>
                )}
            </div>

            {/* Type Field */}
            <div className="form-field">
                <label className="field-label">Content type:</label>
                <div className="input-container">
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={`custom-select ${fieldErrors.type ? 'error' : ''}`}
                        disabled={loading}
                        required
                    >
                        <option value="" disabled>Select type</option>
                        <option value="blog_post">Blog article</option>
                        <option value="social_media">Social media post</option>
                        <option value="email">Email</option>
                    </select>
                    <div className="select-arrow">▼</div>
                </div>
                {fieldErrors.type && (
                    <div className="field-error">{fieldErrors.type}</div>
                )}
            </div>

            {/* Language Field */}
            <div className="form-field">
                <label className="field-label">Language:</label>
                <div className="input-container">
                    <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className={`custom-select ${fieldErrors.language ? 'error' : ''}`}
                        disabled={loading}
                        required
                    >
                        <option value="" disabled>Select language</option>
                        <option value="ru">Russian</option>
                        <option value="en">English</option>
                    </select>
                    <div className="select-arrow">▼</div>
                </div>
                {fieldErrors.language && (
                    <div className="field-error">{fieldErrors.language}</div>
                )}
            </div>

            <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
                className="submit-button"
            >
                {loading ? (
                    <>
                        <span className="spinner"></span> Generating...
                    </>
                ) : (
                    'Generate'
                )}
            </button>
        </div>
    );
};

export default ContentForm;