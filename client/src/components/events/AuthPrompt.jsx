import React from 'react';

const AuthPrompt = ({ icon, title, description, buttonText, onClick }) => {
    return (
        <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm p-8 border border-gray-700/50">
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/4 flex justify-center">
            {icon}
            </div>
            <div className="md:w-3/4">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 mb-4">{description}</p>
            <button 
                onClick={onClick}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300 inline-block"
            >
                {buttonText}
            </button>
            </div>
        </div>
        </div>
    );
};

export default AuthPrompt;