import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCurrentUser, getEarliestListeningDate } from '../api';
import Loader from '../styles/Loader';
import ListeningTrendsChart from '../components/analytics/ListeningTrendsChart';
import ListeningHeatmap from '../components/analytics/ListeningHeatmap';
import GenreBubbleChart from '../components/analytics/GenreBubbleChart';
import ArtistGenreChord from '../components/analytics/ArtistGenreChord';
import ListeningStreakSummary from '../components/analytics/ListeningStreakSummary';
import TopListenersRanking from '../components/analytics/TopListenersRanking';
import Waves from '../styles/backgrounds/Waves';
import { motion } from 'framer-motion';

const ReWrapped = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [earliestDate, setEarliestDate] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    
    //& track scroll position fr parallax effects
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
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

    //& fetch earliest listening date when user is available
    useEffect(() => {
        async function fetchEarliestDate() {
            if (!user || !user.id) return;
            
            try {
                const response = await getEarliestListeningDate(user.id);
                if (response && response.earliest_date) {
                    setEarliestDate(response.earliest_date);
                }
            } catch (err) {
                console.error("Failed to fetch earliest listening date:", err);
            }
        }
        
        fetchEarliestDate();
    }, [user]);
    
    //& format date fr display
    const formatDate = (dateString) => {
        if (!dateString) return 'unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
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
        <>
            {/* Scroll to Top */}
            <motion.div 
                className="fixed bottom-8 right-8"
                style={{ 
                    zIndex: 99999,
                    pointerEvents: 'auto' 
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                    opacity: scrollY > 500 ? 1 : 0,
                    scale: scrollY > 500 ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
            >
                <button
                    className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg hover:shadow-green-500/20 text-white"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            </motion.div>

            <div className="min-h-screen bg-gray-900 text-white relative overflow-x-hidden">
                {/* Animated BG */}
                <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
                    <Waves 
                        lineColor="#1DB954"
                        backgroundColor="#000000"
                        waveSpeedX={0.010}
                        waveSpeedY={0.004}
                        waveAmpX={24}
                        waveAmpY={12}
                        xGap={15}
                        yGap={40}
                    />
                </div>
                
                <div 
                    className="fixed inset-0 z-0 opacity-30 pointer-events-none" 
                    style={{ 
                        transform: `translateY(${scrollY * 0.2}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-3xl"></div>
                    <div className="absolute top-2/3 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-yellow-500/20 to-green-500/20 blur-3xl"></div>
                </div>
                
                <div className="container mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <motion.header 
                        className="py-24 flex flex-col items-center justify-center relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.h1 
                            className="text-6xl md:text-7xl font-bold mb-4 text-center"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
                                Your Music Story
                            </span>
                        </motion.h1>
                        
                        <motion.div
                            className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-6"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 96, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        />
                        
                        <motion.p 
                            className="text-xl md:text-2xl text-gray-300 max-w-3xl text-center"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Discover the patterns and stories hidden in your listening habits
                        </motion.p>
                    </motion.header>
                    
                    {isGuest ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-700/30 text-center mb-24 transform transition-all duration-300 hover:shadow-green-500/10"
                        >
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-white">Unlock Your Music Analytics</h2>
                            <p className="text-white mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                                Gain access to deeper insights, personalized music analysis, and visualizations of your listening habits by upgrading to a full account.
                            </p>
                            <motion.button 
                                onClick={() => navigate('/register')} 
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Upgrade Account
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mb-24 bg-gray-800/40 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/30 shadow-lg"
                        >
                            <p className="text-xl text-white leading-relaxed">
                                Explore your music journey with our advanced analytics tools. Discover your patterns, preferences, and how your taste has evolved over time.
                                {earliestDate && (
                                    <span className="mt-6 block px-6 py-4 bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/20 rounded-xl text-green-300 font-medium text-center">
                                        Your listening data has been tracked since <span className="font-semibold text-green-200">{formatDate(earliestDate)}</span>
                                    </span>
                                )}
                            </p>
                        </motion.div>
                        
                        <div className="space-y-32">
                            {/* Listening Trends */}
                            <SectionContainer title="Your Listening Patterns Over Time">
                                <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-4xl">
                                    See how your music habits change over time. The chart below shows how many tracks you've played and minutes you've listened across different time periods.
                                </p>
                                <motion.div 
                                    className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-green-500/10"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <ListeningTrendsChart userId={user.id} />
                                </motion.div>
                            </SectionContainer>
                            
                            {/* Listening Activity Heatmap */}
                            <SectionContainer title="When You Listen Most">
                                <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-4xl">
                                    This heatmap reveals your listening schedule throughout the week. Darker colors show the hours and days when you listen to more music.
                                </p>
                                <motion.div 
                                    className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-blue-500/10"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <ListeningHeatmap userId={user.id} />
                                </motion.div>
                            </SectionContainer>

                            {/* Genre Analytics */}
                            <SectionContainer title="Your Musical Universe">
                                <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-4xl">
                                    Explore the variety of genres you enjoy and how they connect to your favorite artists. The size of each bubble represents how much time you spend with each genre.
                                </p>
                                <motion.div 
                                    className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-purple-500/10 mb-16"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <GenreBubbleChart userId={user.id} />
                                </motion.div>
                                
                                <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-4xl mt-16">
                                    This chord diagram shows the connections between your favorite artists and the genres they represent in your listening history.
                                </p>
                                <motion.div 
                                    className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-pink-500/10 mt-4"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <ArtistGenreChord userId={user.id} />
                                </motion.div>
                            </SectionContainer>

                            {/* Listening Streak Summary */}
                            <SectionContainer title="Your Listening Journey">
                                <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-4xl">
                                    Check out your all-time stats, including total listening time, number of tracks played, and when you had your biggest music day.
                                </p>
                                <motion.div 
                                    className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-green-500/10"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <ListeningStreakSummary userId={user.id} />
                                </motion.div>
                            </SectionContainer>

                            {/* Top Listeners Ranking */}
                            <SectionContainer title="How You Compare to Other Fans">
                                <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-4xl">
                                    See where you rank among listeners of your favorite artist. The higher your percentile, the more dedicated a fan you are compared to others.
                                </p>
                                <motion.div 
                                    className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-pink-500/10"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <TopListenersRanking userId={user.id} />
                                </motion.div>
                            </SectionContainer>
                            
                            {/* Coming Soon */}
                            <motion.section 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-700/50 mb-24"
                            >
                                <h2 className="text-3xl font-bold mb-8 text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">Coming Soon</h2>
                                <p className="text-white mb-12 text-lg leading-relaxed text-center">
                                    We're developing even more ways to visualize your music journey:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <motion.div 
                                        className="bg-gradient-to-br from-gray-900/80 to-gray-900/60 backdrop-blur-xl p-8 rounded-xl border border-blue-700/20 shadow-lg hover:shadow-blue-500/20 transform transition-all duration-500"
                                        whileHover={{ y: -10, scale: 1.02 }}
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-blue-400 mb-4">Personalized Recommendations</h3>
                                        <p className="text-gray-300 text-lg leading-relaxed">
                                            A carousel featuring suggested concerts and new album releases tailored to your unique listening habits, with dynamic ranking charts that update as you listen.
                                        </p>
                                    </motion.div>
                                    <motion.div 
                                        className="bg-gradient-to-br from-gray-900/80 to-gray-900/60 backdrop-blur-xl p-8 rounded-xl border border-green-700/20 shadow-lg hover:shadow-green-500/20 transform transition-all duration-500"
                                        whileHover={{ y: -10, scale: 1.02 }}
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-green-400 mb-4">Geographic Insights</h3>
                                        <p className="text-gray-300 text-lg leading-relaxed">
                                            Interactive maps showing where your favorite artists are popular and where their fans are concentrated, helping you connect with the global music community.
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.section>
                        </div>
                        </>
                    )}
                </div>
                
                <motion.footer
                    className="mt-24 py-12 relative z-10"
                    style={{ pointerEvents: 'auto' }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6"></div>
                            <p className="text-gray-400 text-sm">
                                Re-Wrapped | Your personalized music analytics
                            </p>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </>
    );
};

//& helper component fr section containers
const SectionContainer = ({ title, children }) => {
    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12"
        >
            <div className="group relative inline-block mb-6">
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">{title}</h2>
                <motion.span 
                    className="absolute left-0 -bottom-1 block h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                />
            </div>
            {children}
        </motion.section>
    );
};

export default ReWrapped;