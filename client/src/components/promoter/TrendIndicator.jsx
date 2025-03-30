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
    
    const getBgClass = () => {
        if (isPositive) return 'bg-green-500 bg-opacity-20';
        if (isNeutral) return 'bg-gray-500 bg-opacity-20';
        return 'bg-red-500 bg-opacity-20';
    };
    
    const getTextClass = () => {
        if (isPositive) return 'text-green-400';
        if (isNeutral) return 'text-gray-400';
        return 'text-red-400';
    };
    
    const getIconPath = () => {
        if (isPositive) {
            return "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6";
        }
        if (isNeutral) {
            return "M5 12h14";
        }
        return "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6";
    };
    
    return (
        <div className="flex items-center">
            <span className={`font-medium ${getTextClass()}`}>
                {value.toFixed(precision)}{suffix}
            </span>
            
            <div className={`flex items-center ml-2 ${getBgClass()} rounded-full px-2 py-0.5`}>
                <svg className={`w-3.5 h-3.5 mr-1 ${getTextClass()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconPath()} />
                </svg>
                <span className={`text-xs ${getTextClass()}`}>
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