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
        //~ use YYYY-MM-DD format fr input value
        return date instanceof Date 
        ? date.toISOString().split('T')[0]
        : new Date(date).toISOString().split('T')[0];
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Filter by Date Range</h3>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
                type="date"
                value={formatDateForInput(dateRange.startDate)}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="bg-gray-700 text-white text-sm p-2 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
            />
            </div>
            <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
                type="date"
                value={formatDateForInput(dateRange.endDate)}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="bg-gray-700 text-white text-sm p-2 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
            />
            </div>
            <div className="sm:flex sm:items-end">
            <button
                onClick={() => onChange({ startDate: null, endDate: null })}
                className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm py-2 px-3 rounded"
            >
                Reset Filters
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