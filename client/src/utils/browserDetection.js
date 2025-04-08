import { useState, useEffect } from 'react';

export const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isFirefox = () => {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

export const supportsCssBackdropFilter = () => {
    return (
        'backdropFilter' in document.documentElement.style ||
        '-webkit-backdrop-filter' in document.documentElement.style
    );
};

export const supportsClipPath = () => {
    return 'clipPath' in document.documentElement.style;
};

export const applyCompatibilityClasses = (element) => {
    if (isSafari()) {
        element.classList.add('safari-compat');
    }
    if (isFirefox()) {
        element.classList.add('firefox-compat');
    }
    if (!supportsCssBackdropFilter()) {
        element.classList.add('no-backdrop-filter');
    }
    if (!supportsClipPath()) {
        element.classList.add('no-clip-path');
    }
};

export const useCompatibleBrowser = () => {
    const [browserInfo, setBrowserInfo] = useState({
        isSafari: false,
        isFirefox: false,
        supportsBackdropFilter: true,
        supportsClipPath: true
    });

    useEffect(() => {
        setBrowserInfo({
            isSafari: isSafari(),
            isFirefox: isFirefox(),
            supportsBackdropFilter: supportsCssBackdropFilter(),
            supportsClipPath: supportsClipPath()
        });
    }, []);

    return browserInfo;
};