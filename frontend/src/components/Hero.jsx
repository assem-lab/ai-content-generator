import React from 'react';
import './Hero.css';

const Hero = ({ onScrollToForm }) => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1 className="hero-title">AI CONTENT GENERATOR</h1>

                <p className="hero-description">
                    Create unique texts for blogs, social networks and email
                    using artificial intelligence in seconds
                </p>

                <div className="hero-divider"></div>

                <button
                    className="cta-button"
                    onClick={onScrollToForm}
                >
                    START FREE
                </button>
            </div>
        </section>
    );
};

export default Hero;