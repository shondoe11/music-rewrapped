import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    //& handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!password) {
        setError('Password is required to confirm account deletion');
        return;
        }
        
        setIsSubmitting(true);
        try {
        await onConfirm(password);
        //~ reset form
        setPassword('');
        } catch (err) {
        setError(err.message || 'Failed to delete account');
        } finally {
        setIsSubmitting(false);
        }
    };
    
    //& if modal closed, dont render anything
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Delete Account</h2>
            
            <p className="text-gray-300 mb-6">
            This action will delete all your listening history data and reset your account to guest status. 
            Your Spotify connection will be maintained, but your username, saved events, and custom preferences will be removed.
            <span className="block mt-2 font-bold text-red-400">This action cannot be undone.</span>
            </p>
            
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                Enter your password to confirm:
                </label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-red-500 focus:outline-none"
                placeholder="Enter your password"
                />
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>
            
            <div className="flex justify-end space-x-4">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center"
                >
                {isSubmitting ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                    </>
                ) : "Delete Account"}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
    };

    DeleteAccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
};

export default DeleteAccountModal;