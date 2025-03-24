import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { exportEventAnalytics, exportPromoterAnalytics } from '../../services/exportService';

const ExportButton = ({ userId, eventId, timeRange = 30 }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [showFormatOptions, setShowFormatOptions] = useState(false);
    
    const handleExport = async (format) => {
        setIsExporting(true);
        setShowFormatOptions(false);
        
        try {
        if (eventId) {
            await exportEventAnalytics(eventId, userId, format, timeRange);
            toast.success(`Event analytics exported as ${format.toUpperCase()}`);
        } else {
            await exportPromoterAnalytics(userId, format);
            toast.success(`Promoter analytics exported as ${format.toUpperCase()}`);
        }
        } catch (error) {
        console.error('Export failed:', error);
        toast.error('Failed to export analytics data');
        } finally {
        setIsExporting(false);
        }
    };
    
    return (
        <div className="relative">
        <button
            onClick={() => setShowFormatOptions(!showFormatOptions)}
            disabled={isExporting}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-300 ${
            isExporting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 text-green-500'
            }`}
        >
            {isExporting ? (
            <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
            </>
            ) : (
            <>
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Data
            </>
            )}
        </button>
        
        {showFormatOptions && (
            <div className="absolute right-0 mt-2 w-36 bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden">
            <div className="py-1">
                <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                CSV
                </button>
                <button
                onClick={() => handleExport('json')}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                JSON
                </button>
            </div>
            </div>
        )}
        </div>
    );
};

ExportButton.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timeRange: PropTypes.number
};

export default ExportButton;