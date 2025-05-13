import React from 'react';
import { Link } from 'react-router-dom';
import SpotifyAttribution from '../components/utils/SpotifyAttribution';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen relative bg-gray-900 text-white">
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Privacy Policy
          </h1>
          <SpotifyAttribution size="md" variant="white" />
        </div>
        
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl border border-gray-700/50">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Music Re-Wrapped Privacy Policy</h2>
          <p className="mb-6">Last Updated: May 13, 2025</p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">1. Introduction</h3>
          <p className="mb-4">
            This Privacy Policy explains how Music Re-Wrapped ("we", "our", or "us") collects, uses, and shares your 
            personal information when you use our service. We respect your privacy and are committed to protecting
            your personal information. Please read this Privacy Policy carefully to understand our practices.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">2. Information We Collect</h3>
          <p className="mb-2">We collect the following types of information:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Account Information:</strong> When you register, we collect your username and encrypted password.
            </li>
            <li>
              <strong>Spotify Data:</strong> With your consent, we collect and store data from your Spotify account including:
              <ul className="list-circle pl-6 mt-2 space-y-1">
                <li>Listening history and recently played tracks</li>
                <li>Top artists, tracks, and genres</li>
                <li>Playlists information</li>
                <li>Basic profile information from Spotify</li>
              </ul>
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our service, including page views and features used.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, IP address, and device type.
            </li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">3. How We Use Your Information</h3>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide and improve our service's features and functionality</li>
            <li>Generate personalized music analytics and visualizations</li>
            <li>Track your listening history and evolution over time</li>
            <li>Communicate with you about your account and our service</li>
            <li>Ensure the security of our service</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">4. Data Storage and Security</h3>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information. Your data
            is stored securely in our databases with industry-standard protections.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">5. Data Sharing</h3>
          <p className="mb-4">
            We do not sell or rent your personal information to third parties. We may share your information
            in the following limited circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Service providers that help us operate our service</li>
            <li>If required by law or legal process</li>
            <li>To protect our rights, property, or safety</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">6. Your Rights and Choices</h3>
          <p className="mb-4">
            You have several rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access and download your personal information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt-out of certain data processing activities</li>
            <li>Update your account information</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">7. Data Retention</h3>
          <p className="mb-4">
            We retain your personal information for as long as your account is active or as needed to provide
            our services. You can request deletion of your account at any time through your profile settings.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">8. Changes to This Privacy Policy</h3>
          <p className="mb-4">
            We may update this Privacy Policy periodically. We will notify you of significant changes by
            posting the new Privacy Policy on this page and/or via email.
          </p>
          
          <h3 className="text-xl font-semibold mb-3 text-green-400">9. Contact Us</h3>
          <p className="mb-4">
            If you have questions about this Privacy Policy, please contact us at musicrewrapped@gmail.com.
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

export default PrivacyPolicy;
