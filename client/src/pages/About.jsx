import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lightning from '../styles/backgrounds/Lightning';
import profileImage from '../assets/circular-cropped-profile.png';

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
                For more information, please review our full <Link to="/privacy" className="text-green-400 hover:text-green-300 underline">Privacy Policy</Link> and <Link to="/terms" className="text-green-400 hover:text-green-300 underline">Terms of Service</Link>.
                </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 shadow-lg mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Meet the Team</h2>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4">
                    <div className="flex-shrink-0">
                        <img 
                            src={profileImage} 
                            alt="Shawn Tan" 
                            className="w-48 h-48 rounded-full border-2 border-green-500 shadow-lg"
                        />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">Shawn Tan</h3>
                        <p className="text-green-400 text-lg mb-4">Full Stack Developer</p>
                        <p className="text-gray-300 mb-4">
                            Designer and developer of Music Re-Wrapped, bringing together a love for music data visualization
                            and interactive web experiences.
                        </p>
                        <div className="flex justify-center md:justify-start items-center">
                            <a 
                                href="https://bit.ly/shawnGH" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-white">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <span className="text-white">GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>
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