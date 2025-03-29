import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';

const EventForm = ({ initialData, onSubmit, submitButtonText = 'Submit', compact = false }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || {
            title: '',
            location: '',
            date: '',
            time: '',
            description: '',
            image: '',
            url: '',
            targetCountry: '',
            targetGenreInterest: '',
            targetArtistInterest: '',
            listeningThreshold: '',
            targetRoles: []
        }
    });

    //& reset form on initialData change (fr update form scenarios)
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    //& handle form submission
    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    const formFieldClasses = "w-full p-3 rounded-lg border bg-gray-900 bg-opacity-50 text-white placeholder-gray-500 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-20 focus:outline-none transition-all duration-300";
    const labelClasses = "block mb-1 text-gray-300 text-sm font-medium";
    const errorClasses = "text-red-400 text-xs mt-1";
    const sectionClasses = "backdrop-filter backdrop-blur-sm bg-gray-800 bg-opacity-30 rounded-lg border border-gray-700 border-opacity-50 p-4 mt-4";

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-${compact ? '3' : '5'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Title</label>
                    <input
                        type="text"
                        {...register("title", { required: "Title is required" })}
                        className={formFieldClasses}
                        placeholder="Event title"
                    />
                    {errors.title && <p className={errorClasses}>{errors.title.message}</p>}
                </div>
                
                <div>
                    <label className={labelClasses}>Location</label>
                    <input
                        type="text"
                        {...register("location", { required: "Location is required" })}
                        className={formFieldClasses}
                        placeholder="Event location"
                    />
                    {errors.location && <p className={errorClasses}>{errors.location.message}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Event Image URL</label>
                    <input
                        type="text"
                        {...register("image", {  
                            pattern: { 
                                value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i,
                                message: "Enter a valid image URL"
                            }
                        })}
                        className={formFieldClasses}
                        placeholder="Valid image URL"
                    />
                    {errors.image && <p className={errorClasses}>{errors.image.message}</p>}
                </div>
                
                <div>
                    <label className={labelClasses}>Event URL</label>
                    <input
                        type="text"
                        {...register("url", { 
                            pattern: { 
                                value: /^(https?:\/\/[^\s]+)$/i,
                                message: "Enter a valid event URL"
                            }
                        })}
                        className={formFieldClasses}
                        placeholder="Valid event URL"
                    />
                    {errors.url && <p className={errorClasses}>{errors.url.message}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Date</label>
                    <input
                        type="date"
                        {...register("date", { required: "Date is required" })}
                        className={formFieldClasses}
                    />
                    {errors.date && <p className={errorClasses}>{errors.date.message}</p>}
                </div>
                <div>
                    <label className={labelClasses}>Time</label>
                    <input
                        type="time"
                        {...register("time", { required: "Time is required" })}
                        className={formFieldClasses}
                    />
                    {errors.time && <p className={errorClasses}>{errors.time.message}</p>}
                </div>
            </div>
            
            <div>
                <label className={labelClasses}>Description</label>
                <textarea
                    {...register("description")}
                    className={formFieldClasses}
                    placeholder="Event description"
                    rows={compact ? 2 : 4}
                ></textarea>
            </div>
            
            <div className={sectionClasses}>
                <h3 className="font-semibold text-green-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Targeting Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Target Country</label>
                        <input
                            type="text"
                            {...register("targetCountry")}
                            placeholder="e.g., us"
                            className={formFieldClasses}
                        />
                    </div>
                    
                    <div>
                        <label className={labelClasses}>Listening Threshold</label>
                        <input
                            type="number"
                            {...register("listeningThreshold")}
                            placeholder="Number of listens required (e.g., 10)"
                            className={formFieldClasses}
                        />
                    </div>
                </div>
                
                <div className="mt-4">
                    <label className={labelClasses}>Target Genre Interest (comma-separated)</label>
                    <input
                        type="text"
                        {...register("targetGenreInterest")}
                        placeholder="e.g., rock, pop"
                        className={formFieldClasses}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Separate multiple genres with commas for better targeting
                    </p>
                </div>
                
                <div className="mt-4">
                    <label className={labelClasses}>Target Artist Interest (comma-separated)</label>
                    <input
                        type="text"
                        {...register("targetArtistInterest")}
                        placeholder="e.g., the beatles, taylor swift"
                        className={formFieldClasses}
                    />
                </div>
                
                <div className="mt-4">
                    <label className={labelClasses}>Target Role</label>
                    <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center bg-gray-900 bg-opacity-50 rounded-lg p-2 px-3">
                            <input
                                type="checkbox"
                                {...register("targetRoles")}
                                value="guest"
                                className="mr-2 rounded h-4 w-4 text-green-500 focus:ring-green-500"
                            />
                            <span className="text-white">Guest</span>
                        </div>
                        <div className="flex items-center bg-gray-900 bg-opacity-50 rounded-lg p-2 px-3">
                            <input
                                type="checkbox"
                                {...register("targetRoles")}
                                value="regular"
                                className="mr-2 rounded h-4 w-4 text-green-500 focus:ring-green-500"
                            />
                            <span className="text-white">Regular</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Select target roles to specify which users to target
                    </p>
                </div>
            </div>
            
            <button 
                type="submit" 
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105 flex items-center justify-center"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {submitButtonText}
            </button>
        </form>
    );
};

EventForm.propTypes = {
    initialData: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    submitButtonText: PropTypes.string,
    compact: PropTypes.bool
};

export default EventForm;