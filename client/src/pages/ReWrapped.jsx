import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCurrentUser } from '../api';
import Loader from '../styles/Loader';
import ListeningTrendsChart from '../components/analytics/ListeningTrendsChart';
import ListeningHeatmap from '../components/analytics/ListeningHeatmap';
import GenreBubbleChart from '../components/analytics/GenreBubbleChart';
import ArtistGenreChord from '../components/analytics/ArtistGenreChord';
import ListeningStreakSummary from '../components/analytics/ListeningStreakSummary';
import TopListenersRanking from '../components/analytics/TopListenersRanking';

const ReWrapped = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchUser() {
        try {
            const response = await getCurrentUser();
            login(response.user);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            toast.error("Authenticate with Spotify first to view 'Re-Wrapped'");
            navigate('/spotify-login');
        }
        }
        
        if (!user) {
        fetchUser();
        } else {
        setLoading(false);
        }
    }, [user, login, navigate]);
    
    if (loading) {
        return (
        <div className="flex justify-center items-center h-screen">
            <Loader />
        </div>
        );
    }
    
    //& check if user is guest
    const isGuest = user && user.role === 'guest';
    
    return (
        <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Re-Wrapped Analytics</h1>
        
        {isGuest ? (
            //& fr guest users
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">Re-Wrapped requires you to upgrade your account in order to view deeper insights</h2>
            <p className="text-gray-300 mb-6">
                Unlock advanced analytics, personalized music insights, and much more by upgrading to a full account.
            </p>
            <button 
                onClick={() => navigate('/register')} 
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300"
            >
                Upgrade Account
            </button>
            </div>
        ) : (
            <>
            <p className="text-lg text-gray-300 mb-8">
                Gain deeper insights into your music listening habits with our advanced analytics tools. These visualizations are built from your listening history stored in Re-Wrapped.
            </p>
            
            <div className="space-y-8">
                {/* In-Depth Analytics & Trends */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Listening Trends Over Time</h2>
                    <p className="text-gray-400 mb-4">
                        Track how your music consumption changes over time with our interactive charts. Compare track counts and listening minutes across different time periods.
                    </p>
                    <ListeningTrendsChart userId={user.id} />
                </section>
                
                {/* Listening Activity Heatmap Section */}
                <section>
                <h2 className="text-2xl font-semibold mb-4">Weekly Listening Patterns</h2>
                <p className="text-gray-400 mb-4">
                    Discover which days and times you listen to music the most. This heatmap shows your listening frequency throughout the week.
                </p>
                <ListeningHeatmap userId={user.id} />
                </section>

                {/* Genre Analytics Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Genre Analysis</h2>
                    <p className="text-gray-400 mb-4">
                        Explore the diversity of genres in your music taste with interactive visualizations showing your genre preferences and how they connect to your favorite artists.
                    </p>
                    <GenreBubbleChart userId={user.id} />
                    <div className="mt-8">
                        <ArtistGenreChord userId={user.id} />
                    </div>
                </section>

                {/* Listening Streak Summary */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Longest Listening Streak</h2>
                    <p className="text-gray-400 mb-4">
                        Discover your all-time listening stats, including total minutes listened, biggest listening day, tracks played, and a breakdown of monthly listening hours.
                    </p>
                <ListeningStreakSummary userId={user.id} />
                </section>

                {/* Top Listeners Ranking */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Top Listener Ranking</h2>
                    <p className="text-gray-400 mb-4">
                        See how you compare to other fans with a percentile ranking showing where you stand among listeners of your favorite artist.
                    </p>
                    <TopListenersRanking userId={user.id} />
                </section>
                
                {/* Coming Soon */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">More Insights Coming Soon</h2>
                    <p className="text-gray-300 mb-4">
                        We're working on additional visualizations to give you even more insights into your music listening habits:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-blue-400 mb-2">Personalized Recommendations</h3>
                            <p className="text-sm text-gray-300">
                                A carousel featuring suggested concerts or new album releases tailored to your listening habits. Dynamic ranking charts that update as new data is pulled from Spotify and external concert APIs.
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-green-400 mb-2">Geographic Insights</h3>
                            <p className="text-sm text-gray-300">
                                Interactive maps highlighting listener density or concert attendance by region. Flow maps showing movement trends if location data is available.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
            </>
        )}
        </div>
    );
};

export default ReWrapped;