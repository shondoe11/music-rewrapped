import React from 'react';
import PropTypes from 'prop-types';

const PromoterNav = ({ selectedTab, onTabChange }) => {
    const tabs = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'submit', label: 'New Event' },
        { key: 'sponsored', label: 'My Events' },
        { key: 'analytics', label: 'Analytics' }
    ];

    return (
        <aside className="w-64 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-6">Promoter Panel</h1>
        <nav className="space-y-4">
            {tabs.map((tab) => (
            <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`w-full text-left p-2 rounded transition-colors duration-300 ${
                selectedTab === tab.key 
                    ? 'bg-green-500 text-white' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }`}
            >
                {tab.label}
            </button>
            ))}
        </nav>
        </aside>
    );
};

    PromoterNav.propTypes = {
    selectedTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired
    };

export default PromoterNav;