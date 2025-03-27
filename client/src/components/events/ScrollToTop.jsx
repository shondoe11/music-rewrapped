import React, { useEffect, useState } from 'react';

const ScrollToTop = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    //& handle scroll event show/hide back to top button
    useEffect(() => {
        const handleScroll = () => {
        //~ show button when user scroll past 500px
        if (window.scrollY > 500) {
            setShowScrollTop(true);
        } else {
            setShowScrollTop(false);
        }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
        window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
        top: 0,
        behavior: 'smooth'
        });
    };

    if (!showScrollTop) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
        <button
            onClick={scrollToTop}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-110 focus:outline-none"
            aria-label="Scroll to top"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
        </div>
    );
};

export default ScrollToTop;