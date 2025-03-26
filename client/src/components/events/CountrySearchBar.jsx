import React from 'react';

const CountrySearchBar = ({ inputCode, setInputCode, handleCountrySearch, scrollToEventListings, isLocating }) => {
  //& handle key press fr country input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
        handleCountrySearch();
        scrollToEventListings();
        }
    };

    return (
        <div className="max-w-lg mx-auto mb-16 relative z-20">
        <div className="bg-gray-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-700/50">
            <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-1">Find Events Near You</h3>
            <p className="text-sm text-gray-400">Enter a two-letter country code</p>
            </div>
            <div className="flex items-center gap-3">
            <div className="flex-grow relative">
                <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="e.g. US, GB, SG"
                className="w-full bg-black/30 text-green-500 text-xl p-3 pl-10 rounded-xl border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all backdrop-blur-sm"
                maxLength={2}
                disabled={isLocating}
                />
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-green-500/70">
                    {isLocating ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    )}
                </span>
                </div>
            </div>
            <button 
                onClick={() => {
                handleCountrySearch();
                scrollToEventListings();
                }}
                className={`bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 ${isLocating ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLocating}
            >
                {isLocating ? 'Detecting Location...' : 'Search'}
            </button>
            </div>
        </div>
        </div>
    );
};

export default CountrySearchBar;