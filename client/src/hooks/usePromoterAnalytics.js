import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getPromoterAnalytics } from '../services/analyticsService';

const usePromoterAnalytics = (userId) => {
    const [analytics, setAnalytics] = useState({
        total_events: 0,
        total_views: 0,
        total_saves: 0,
        average_engagement: 0,
        events_analytics: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    });

    //& fetch analytics data
    const fetchAnalytics = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const data = await getPromoterAnalytics(userId);
            setAnalytics(data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);

            // More specific error messages based on error type
            if (error.status === 404) {
                setError('No analytics data found');
            } else if (error.status === 401) {
                setError('Authentication required to view analytics');
            } else {
                setError('Failed to load analytics data');
            }

            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    //& initialize by fetching analytics data
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    //& filter events by date range
    const filterEventsByDate = useCallback((events) => {
        if (!dateRange.startDate && !dateRange.endDate) return events;

        return events.filter(event => {
            const eventDate = event.event_date ? new Date(event.event_date) : null;
            if (!eventDate) return true; //~ include events without dates

            const isAfterStart = !dateRange.startDate || eventDate >= dateRange.startDate;
            const isBeforeEnd = !dateRange.endDate || eventDate <= dateRange.endDate;

            return isAfterStart && isBeforeEnd;
        });
    }, [dateRange]);

    //& get top performing events (by engagement)
    const getTopEvents = (limit = 5) => {
        return filterEventsByDate([...analytics.events_analytics])
            .sort((a, b) => b.engagement - a.engagement)
            .slice(0, limit);
    };

    //& get events w best save rate
    const getEventsWithBestSaveRate = (limit = 5) => {
        return filterEventsByDate([...analytics.events_analytics])
            .filter(event => event.views > 10) //~ only consider events w sufficient views
            .sort((a, b) => b.save_rate - a.save_rate)
            .slice(0, limit);
    };

    //& get effectiveness of targeting parameters
    const getTargetingEffectiveness = () => {
        const events = filterEventsByDate([...analytics.events_analytics]);
        if (!events.length) return {};

        //~ grp by country
        const countryGroups = {};
        events.forEach(event => {
            if (!event.target_country) return;

            if (!countryGroups[event.target_country]) {
                countryGroups[event.target_country] = {
                    events: 0,
                    views: 0,
                    saves: 0,
                    engagementTotal: 0
                };
            }

            countryGroups[event.target_country].events += 1;
            countryGroups[event.target_country].views += event.views;
            countryGroups[event.target_country].saves += event.saves;
            countryGroups[event.target_country].engagementTotal += event.engagement;
        });

        //~ calculate averages
        Object.keys(countryGroups).forEach(country => {
            const group = countryGroups[country];
            group.avgEngagement = group.engagementTotal / group.events;
            group.saveRate = (group.saves / group.views) * 100;
        });

        //~ do same fr genres & artists (parse comma-separated lists)
        const genreGroups = {};
        const artistGroups = {};

        events.forEach(event => {
            //~ process genres
            const genres = event.target_genre_interest ?
                event.target_genre_interest.split(',').map(g => g.trim()) : [];

            genres.forEach(genre => {
                if (!genre) return;

                if (!genreGroups[genre]) {
                    genreGroups[genre] = {
                        events: 0,
                        views: 0,
                        saves: 0,
                        engagementTotal: 0
                    };
                }

                genreGroups[genre].events += 1;
                genreGroups[genre].views += event.views;
                genreGroups[genre].saves += event.saves;
                genreGroups[genre].engagementTotal += event.engagement;
            });

            //~ process artists
            const artists = event.target_artist_interest ?
                event.target_artist_interest.split(',').map(a => a.trim()) : [];

            artists.forEach(artist => {
                if (!artist) return;

                if (!artistGroups[artist]) {
                    artistGroups[artist] = {
                        events: 0,
                        views: 0,
                        saves: 0,
                        engagementTotal: 0
                    };
                }

                artistGroups[artist].events += 1;
                artistGroups[artist].views += event.views;
                artistGroups[artist].saves += event.saves;
                artistGroups[artist].engagementTotal += event.engagement;
            });
        });

        //~ calculate averages fr genres & artists
        Object.keys(genreGroups).forEach(genre => {
            const group = genreGroups[genre];
            group.avgEngagement = group.engagementTotal / group.events;
            group.saveRate = (group.saves / group.views) * 100;
        });

        Object.keys(artistGroups).forEach(artist => {
            const group = artistGroups[artist];
            group.avgEngagement = group.engagementTotal / group.events;
            group.saveRate = (group.saves / group.views) * 100;
        });

        return {
            countries: countryGroups,
            genres: genreGroups,
            artists: artistGroups
        };
    };

    //& analyze trending performance
    const getTrends = useCallback(() => {
        const events = filterEventsByDate([...analytics.events_analytics]);
        if (!events.length) return { improving: [], declining: [] };

        //~ sort events by date
        const sortedEvents = [...events]
            .filter(e => e.event_date)
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        if (sortedEvents.length < 2) return { improving: [], declining: [] };

        //~ calculate engagement rate (engagement/views) fr each event
        const withRates = sortedEvents.map(event => ({
            ...event,
            engagementRate: event.views > 0 ? event.engagement / event.views : 0
        }));

        //~ find trends by comparing each event to the average of previous events
        let improving = [];
        let declining = [];

        for (let i = 1; i < withRates.length; i++) {
            const current = withRates[i];

            //~ calculate average of previous events
            const previousEvents = withRates.slice(0, i);
            const avgPrevRate = previousEvents.reduce((sum, e) => sum + e.engagementRate, 0) / previousEvents.length;

            //~ determine if improving / declining
            if (current.engagementRate > avgPrevRate * 1.1) { //~ 10% better than previous
                improving.push(current);
            } else if (current.engagementRate < avgPrevRate * 0.9) { //~ 10% worse than previous
                declining.push(current);
            }
        }

        return { improving, declining };
    }, [analytics.events_analytics, filterEventsByDate]);

    return {
        analytics,
        loading,
        error,
        fetchAnalytics,
        getTopEvents,
        getEventsWithBestSaveRate,
        getTargetingEffectiveness,
        getTrends,
        dateRange,
        setDateRange
    };
};

export default usePromoterAnalytics;