import React, { useState } from 'react';
import PropTypes from 'prop-types';
import usePromoterAnalytics from '../../hooks/usePromoterAnalytics';
import AnalyticsSummary from './AnalyticsSummary';
import EventPerformanceChart from './EventPerformanceChart';
import TargetingEffectiveness from './TargetingEffectiveness';
import TopEventsTable from './TopEventsTable';
import DateRangeSelector from './DateRangeSelector';
import PerformanceInsights from './PerformanceInsights';
import Loader from '../../styles/Loader';
import TimeSeriesDashboard from './TimeSeriesDashboard';
import ExportButton from './ExportButton';

const AnalyticsDashboard = ({ userId, onTabChange }) => {
    const { 
        analytics, 
        loading, 
        error, 
        getTopEvents,
        getEventsWithBestSaveRate,
        getTargetingEffectiveness,
        getTrends,
        dateRange,
        setDateRange,
        fetchAnalytics
    } = usePromoterAnalytics(userId);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAnalytics();
        setIsRefreshing(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 backdrop-filter backdrop-blur-md bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-xl text-center">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-400 text-xl font-medium">{error}</p>
                <p className="text-gray-300 mt-3">Please try refreshing the page.</p>
                <button 
                    onClick={handleRefresh}
                    className="mt-5 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 border border-red-500 border-opacity-50 text-red-400 py-2 px-6 rounded-lg transition-all duration-300"
                >
                    Retry
                </button>
            </div>
        );
    }

    //& if no events data avail yet
    if (analytics.total_events === 0) {
        return (
            <div className="p-6">
                <h2 className="text-3xl font-semibold mb-6 text-green-400">Analytics Dashboard</h2>
                <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-8 rounded-xl shadow-lg border border-gray-700 border-opacity-40 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-2xl font-medium mb-3 text-green-400">No Analytics Data Yet</h3>
                    <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                        Create and publish events to start collecting analytics data. Once your events receive views and interactions, you'll see performance metrics here.
                    </p>
                    <button 
                        onClick={() => onTabChange('submit')}
                        className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105"
                    >
                        Create Your First Event
                    </button>
                </div>
            </div>
        );
    }

    const topEvents = getTopEvents(5);
    const bestSaveRateEvents = getEventsWithBestSaveRate(5);
    const targetingData = getTargetingEffectiveness();
    const trends = getTrends();

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h2 className="text-3xl font-semibold text-green-400 mb-4 md:mb-0">Analytics Dashboard</h2>
                
                <div className="flex space-x-3">
                    <ExportButton userId={userId.toString()} timeRange={dateRange.endDate ? 
                        Math.ceil((new Date() - dateRange.startDate) / (1000 * 60 * 60 * 24)) : 30} />
                    
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                            isRefreshing 
                            ? 'bg-gray-700 bg-opacity-50 text-gray-400 cursor-not-allowed' 
                            : 'backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 border border-gray-700 border-opacity-40 hover:bg-opacity-60 text-green-400 hover:text-green-300'
                        }`}
                    >
                        {isRefreshing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Data
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Date Range Filter */}
            <DateRangeSelector dateRange={dateRange} onChange={setDateRange} />
            
            {/* Summary Cards */}
            <AnalyticsSummary analytics={analytics} />

            {/* Time Series Dashboard */}
            <TimeSeriesDashboard userId={userId} />
            
            {/* Performance Insights */}
            <PerformanceInsights analytics={analytics} trends={trends} />
            
            {/* Event Performance Chart */}
            {analytics.events_analytics.length > 0 && (
                <EventPerformanceChart events={analytics.events_analytics.slice(0, 8)} />
            )}
            
            {/* Targeting Effectiveness */}
            <TargetingEffectiveness targetingData={targetingData} />
            
            {/* Top Events Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopEventsTable 
                    events={topEvents} 
                    title="Top Performing Events" 
                    userId={userId.toString()} 
                />
                <TopEventsTable 
                    events={bestSaveRateEvents} 
                    title="Highest Save Rate Events" 
                />
            </div>
        </div>
    );
};

AnalyticsDashboard.propTypes = {
    userId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    onTabChange: PropTypes.func.isRequired
};

export default AnalyticsDashboard;