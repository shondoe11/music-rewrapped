import React from 'react';
import PropTypes from 'prop-types';

const PromoterNav = ({ selectedTab, onTabChange }) => {
    const tabs = [
        { key: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { key: 'submit', label: 'New Event', icon: 'M12 4v16m8-8H4' },
        { key: 'sponsored', label: 'My Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { key: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
    ];

    return (
        <aside className="w-full h-full backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-70 border-r border-gray-700 border-opacity-50 transition-all duration-300 ease-in-out overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-8 text-green-400 flex items-center">
                    <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Promoter Panel
                </h1>
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out transform ${
                                selectedTab === tab.key 
                                    ? 'bg-green-500 bg-opacity-20 text-green-400 border-l-4 border-green-500 pl-2 translate-x-1' 
                                    : 'hover:bg-gray-700 hover:bg-opacity-50 text-gray-300 hover:text-white border-l-4 border-transparent'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

PromoterNav.propTypes = {
    selectedTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired
};

export default PromoterNav;