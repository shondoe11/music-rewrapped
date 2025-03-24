import React from 'react';
import PropTypes from 'prop-types';

const TrendIndicator = ({ value, previousValue, precision = 1, suffix = '' }) => {
    if (previousValue === null || previousValue === undefined) {
        return <span className="text-gray-400">—</span>;
    }

    const percentChange = previousValue !== 0 
        ? ((value - previousValue) / Math.abs(previousValue)) * 100 
        : value > 0 ? 100 : 0;
        
    const isPositive = percentChange > 0;
    const isNeutral = percentChange === 0;
    
    return (
        <div className="flex items-center">
        <span className={`font-medium ${isPositive ? 'text-green-500' : isNeutral ? 'text-gray-400' : 'text-red-500'}`}>
            {value.toFixed(precision)}{suffix}
        </span>
        <div className="flex items-center ml-2">
            {isPositive ? (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            ) : isNeutral ? (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
            ) : (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            )}
            <span className={`text-xs ml-1 ${isPositive ? 'text-green-500' : isNeutral ? 'text-gray-400' : 'text-red-500'}`}>
            {Math.abs(percentChange).toFixed(1)}%
            </span>
        </div>
        </div>
    );
};

TrendIndicator.propTypes = {
    value: PropTypes.number.isRequired,
    previousValue: PropTypes.number,
    precision: PropTypes.number,
    suffix: PropTypes.string
};

export default TrendIndicator;