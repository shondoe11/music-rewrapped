import React from 'react';
import PropTypes from 'prop-types';

const DateRangeSelector = ({ dateRange, onChange }) => {
    const handleChange = (field, value) => {
        onChange({
            ...dateRange,
            [field]: value ? new Date(value) : null
        });
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        //~ use YYYY-MM-DD format fr input val
        return date instanceof Date 
            ? date.toISOString().split('T')[0]
            : new Date(date).toISOString().split('T')[0];
    };

    const presetRanges = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 }
    ];

    const setPresetRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        onChange({ startDate: start, endDate: end });
    };

    return (
        <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-5 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-6">
            <h3 className="text-sm font-medium text-green-400 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Filter by Date Range
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={formatDateForInput(dateRange.startDate)}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full bg-gray-700 bg-opacity-60 text-white text-sm p-2 rounded-lg border border-gray-600 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-20 focus:outline-none transition-all duration-300"
                    />
                </div>
                
                <div className="md:col-span-3">
                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
                    <input
                        type="date"
                        value={formatDateForInput(dateRange.endDate)}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="w-full bg-gray-700 bg-opacity-60 text-white text-sm p-2 rounded-lg border border-gray-600 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-20 focus:outline-none transition-all duration-300"
                    />
                </div>
                
                <div className="md:col-span-4 flex flex-wrap gap-2">
                    {presetRanges.map(range => (
                        <button
                            key={range.days}
                            onClick={() => setPresetRange(range.days)}
                            className="bg-gray-700 bg-opacity-60 hover:bg-opacity-80 text-gray-300 hover:text-white text-xs py-2 px-3 rounded-lg transition-all duration-300"
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
                
                <div className="md:col-span-2 text-right">
                    <button
                        onClick={() => onChange({ startDate: null, endDate: null })}
                        className="w-full bg-gray-900 bg-opacity-60 hover:bg-opacity-80 text-gray-300 text-sm py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

DateRangeSelector.propTypes = {
    dateRange: PropTypes.shape({
        startDate: PropTypes.instanceOf(Date),
        endDate: PropTypes.instanceOf(Date)
    }),
    onChange: PropTypes.func.isRequired
};

export default DateRangeSelector;