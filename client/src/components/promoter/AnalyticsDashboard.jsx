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

const AnalyticsDashboard = ({ userId }) => {
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
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
            <p className="text-red-500">{error}</p>
            <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
            <button 
            onClick={handleRefresh}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
            Retry
            </button>
        </div>
        );
    }

    //& if no events data avail yet
    if (analytics.total_events === 0) {
        return (
        <div className="p-4">
            <h2 className="text-3xl font-semibold mb-6">Analytics Dashboard</h2>
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-medium mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-400 mb-6">
                Create and publish events to start collecting analytics data. Once your events receive views and interactions, you'll see performance metrics here.
            </p>
            <button 
                onClick={() => window.location.href = '#submit'}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
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
        <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-3xl font-semibold">Analytics Dashboard</h2>
                
                <div className="mt-4 md:mt-0 flex space-x-2">
                    <ExportButton userId={userId.toString()} timeRange={dateRange.endDate ? 
                    Math.ceil((new Date() - dateRange.startDate) / (1000 * 60 * 60 * 24)) : 30} />
                    
                    <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-300 ${
                        isRefreshing 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-800 hover:bg-gray-700 text-green-500'
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
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    ]).isRequired
};

export default AnalyticsDashboard;