import React from 'react';
import { Link } from 'react-router-dom';
import SpotifyAttribution from '../components/utils/SpotifyAttribution';

const TermsOfService = () => {
  return (
    <div className="min-h-screen relative bg-gray-900 text-white">
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Terms of Service
          </h1>
          <SpotifyAttribution size="md" variant="white" />
        </div>
        
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl border border-gray-700/50">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Music Re-Wrapped Terms of Service</h2>
          <p className="mb-6">Last Updated: May 13, 2025</p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">1. Acceptance of Terms</h3>
          <p className="mb-4">
            By accessing or using the Music Re-Wrapped service ("Service"), you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
            using or accessing this Service.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">2. Spotify Data Usage</h3>
          <p className="mb-4">
            Music Re-Wrapped utilizes data from your Spotify account to provide personalized analytics and insights 
            about your listening habits. By using our Service, you acknowledge that:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>We store and process your Spotify listening history, playlist information, and related metadata</li>
            <li>We display content from Spotify including album artwork, artist names, and track information</li>
            <li>All Spotify content displayed remains the property of Spotify and respective rights holders</li>
            <li>We provide links back to original content on Spotify's platform</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">3. User Accounts</h3>
          <p className="mb-4">
            To access our Service, you must create an account with a username and password. You are responsible for
            maintaining the confidentiality of your account information and are fully responsible for all activities
            that occur under your account.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">4. Data Storage and Privacy</h3>
          <p className="mb-4">
            Your use of the Service is also governed by our <Link to="/privacy" className="text-green-500 hover:underline">Privacy Policy</Link>.
            We store your listening history and related Spotify data to provide the Service. You can request deletion of your 
            account and associated data at any time.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">5. Intellectual Property</h3>
          <p className="mb-4">
            Spotify content displayed through our Service (including but not limited to logos, album artwork, and artist imagery)
            is the property of Spotify and the respective rights holders. Music Re-Wrapped does not claim ownership of any
            Spotify content.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">6. Limitations and Termination</h3>
          <p className="mb-4">
            We reserve the right to terminate or suspend access to our Service immediately, without prior notice, for any
            reason whatsoever, including without limitation if you breach the Terms.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">7. Changes to Terms</h3>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. We will notify users of any significant changes to
            these terms. Your continued use of the Service following the posting of changes will be deemed your acceptance
            of those changes.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">8. Contact Information</h3>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at musicrewrapped@gmail.com.
          </p>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Music Re-Wrapped is not affiliated with, maintained, authorized, endorsed, or sponsored by Spotify.
              All Spotify logos and trademarks displayed on this service are property of Spotify AB.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full font-medium transition-all duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;