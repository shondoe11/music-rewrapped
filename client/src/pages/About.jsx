import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lightning from '../styles/backgrounds/Lightning';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen overflow-hidden">
        {/* Lightning BG */}
        <div className="fixed inset-0" 
            style={{ 
            zIndex: -10, 
            pointerEvents: 'none',
            height: '100vh',
            width: '100vw'
            }}
        >
            <Lightning 
            hue={180} 
            speed={0.6} 
            intensity={1.2} 
            size={1.2}
            />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                About Music Re-Wrapped
            </h1>
            
            <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 shadow-lg mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-green-400">What is Music Re-Wrapped?</h2>
                <p className="text-white mb-6">
                Music Re-Wrapped is a personalized music analytics platform that gives you deeper insights into your listening habits. Unlike most platforms, which provides an annual summary, Music Re-Wrapped continuously analyzes your music data to give you real-time understanding of your musical journey.
                </p>
                <p className="text-white mb-6">
                Whether you're curious about your listening trends, want to discover patterns in your music taste, or are looking for personalized event recommendations based on your favorite artists, Music Re-Wrapped transforms your Spotify data into beautiful, interactive visualizations.
                </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 shadow-lg mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">Key Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50">
                    <h3 className="text-xl font-medium text-green-400 mb-2">Continuous Analytics</h3>
                    <p className="text-gray-300">
                    Track your listening habits in real-time with dynamic visualizations that update as you listen to more music.
                    </p>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50">
                    <h3 className="text-xl font-medium text-green-400 mb-2">Genre Evolution</h3>
                    <p className="text-gray-300">
                    See how your taste in genres evolves over time with our beautiful interactive charts.
                    </p>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50">
                    <h3 className="text-xl font-medium text-green-400 mb-2">Artist Connections</h3>
                    <p className="text-gray-300">
                    Discover connections between your favorite artists and explore new music based on your preferences.
                    </p>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50">
                    <h3 className="text-xl font-medium text-green-400 mb-2">Event Recommendations</h3>
                    <p className="text-gray-300">
                    Get personalized concert and event recommendations based on your listening history.
                    </p>
                </div>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50">
                <h3 className="text-xl font-medium text-pink-400 mb-2">Promoter Platform</h3>
                <p className="text-gray-300">
                    For event promoters, we offer a dedicated platform to reach fans based on their actual listening preferences, with detailed analytics on campaign performance.
                </p>
                </div>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 shadow-lg mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-purple-400">How It Works</h2>
                
                <div className="space-y-6">
                <div className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-2 mt-1 mr-4">
                    <span className="text-purple-400 font-bold">1</span>
                    </div>
                    <div>
                    <h3 className="text-xl font-medium text-white mb-2">Connect with Spotify</h3>
                    <p className="text-gray-300">
                        Sign in with your Spotify account to grant Music Re-Wrapped access to your listening data. We use OAuth for secure authentication and never store your Spotify password.
                    </p>
                    </div>
                </div>
                
                <div className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-2 mt-1 mr-4">
                    <span className="text-purple-400 font-bold">2</span>
                    </div>
                    <div>
                    <h3 className="text-xl font-medium text-white mb-2">Data Analysis</h3>
                    <p className="text-gray-300">
                        Our system processes your listening history to generate insights and visualizations. This includes analyzing tracks, artists, genres, and listening patterns.
                    </p>
                    </div>
                </div>
                
                <div className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-2 mt-1 mr-4">
                    <span className="text-purple-400 font-bold">3</span>
                    </div>
                    <div>
                    <h3 className="text-xl font-medium text-white mb-2">Personalized Dashboard</h3>
                    <p className="text-gray-300">
                        Access your personalized dashboard to view your listening trends, discover patterns, and get recommendations for events and new music.
                    </p>
                    </div>
                </div>
                </div>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 shadow-lg mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-red-400">Privacy & Data Usage</h2>
                <p className="text-white mb-4">
                At Music Re-Wrapped, we take your privacy seriously. We only store the data necessary to provide our services:
                </p>
                
                <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2">
                <li>Your listening history is used only to generate insights and is never shared with third parties without consent.</li>
                <li>We use secure connection protocols to ensure your data remains protected.</li>
                <li>You can delete your account and all associated data at any time from your profile settings.</li>
                <li>We use Spotify's OAuth for authentication, meaning we never see or store your Spotify password.</li>
                </ul>
                
                <p className="text-white">
                For more information, please review our full privacy policy and terms of service.
                </p>
            </div>

            <div className="text-center">
                <button 
                onClick={() => navigate('/home')} 
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-full shadow-xl hover:shadow-green-500/30 transform transition-all duration-300 hover:scale-105"
                >
                Return to Home
                </button>
            </div>
            </div>
        </div>
        </div>
    );
};

export default About;