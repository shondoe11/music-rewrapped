import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getEventTimeSeries, getPromoterTimeSeries } from '../services/timeSeriesService';

const useTimeSeries = (userId, eventId = null) => {
    const [timeSeriesData, setTimeSeriesData] = useState({
        daily: [],
        weekly: []
    });
    const [summary, setSummary] = useState({
        total_views: 0,
        total_saves: 0,
        average_daily_views: 0,
        average_daily_saves: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(30); //~ default 30d

    const fetchTimeSeries = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            let data;
            if (eventId) {
                data = await getEventTimeSeries(eventId, userId, timeRange);
            } else {
                data = await getPromoterTimeSeries(userId, timeRange);
            }

            setTimeSeriesData(data.time_series);
            setSummary(data.summary);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch time series data:', error);
            setError('Failed to load time series data');
            toast.error('Failed to load time series data');
        } finally {
            setLoading(false);
        }
    }, [userId, eventId, timeRange]);

    useEffect(() => {
        fetchTimeSeries();
    }, [fetchTimeSeries]);

    //~ Helper fns to process time series data
    const calculateTrends = () => {
        if (!timeSeriesData.daily || timeSeriesData.daily.length < 3) {
            return { trend: 'neutral', percentage: 0 };
        }

        //~ compare last 7d to previous 7d
        const days = timeSeriesData.daily;
        const recentDays = days.slice(-7);
        const previousDays = days.slice(-14, -7);

        const recentViews = recentDays.reduce((sum, day) => sum + day.views, 0);
        const previousViews = previousDays.reduce((sum, day) => sum + day.views, 0);

        if (previousViews === 0) return { trend: 'up', percentage: 100 };

        const percentageChange = ((recentViews - previousViews) / previousViews) * 100;
        const trend = percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'neutral';

        return { trend, percentage: Math.abs(Math.round(percentageChange)) };
    };

    const findPeakDays = () => {
        if (!timeSeriesData.daily || timeSeriesData.daily.length === 0) {
            return [];
        }

        //~ find days w highest views
        return [...timeSeriesData.daily]
            .sort((a, b) => b.views - a.views)
            .slice(0, 3);
    };

    return {
        timeSeriesData,
        summary,
        loading,
        error,
        timeRange,
        setTimeRange,
        fetchTimeSeries,
        calculateTrends,
        findPeakDays
    };
};

export default useTimeSeries;