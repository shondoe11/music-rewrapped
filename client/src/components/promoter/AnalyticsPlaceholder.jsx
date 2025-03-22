import React from 'react';

const AnalyticsPlaceholder = () => {
  return (
    <div className="p-4">
      <h2 className="text-3xl font-semibold mb-4">Analytics Dashboard</h2>
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <div className="text-green-500 text-6xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold mb-2">Analytics Coming Soon</h3>
        <p className="text-gray-400 text-lg">
          We're building powerful analytics tools to help you track the performance of your events.
        </p>
        <div className="mt-6 py-3 px-4 bg-gray-700 rounded-lg inline-block">
          <p className="text-sm">Feature in Development</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlaceholder;