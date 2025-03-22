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

    //& reset form when initialData changes (for update form scenarios)
    useEffect(() => {
        if (initialData) {
        reset(initialData);
        }
    }, [initialData, reset]);

    //& handle form submission
    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-${compact ? '2' : '4'}`}>
        <div>
            <label className="block mb-1">Title</label>
            <input
            type="text"
            {...register("title", { required: "Title is required" })}
            className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            placeholder="Event title"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        
        <div>
            <label className="block mb-1">Event Image URL</label>
            <input
            type="text"
            {...register("image", {  
                pattern: { 
                value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i,
                message: "Enter a valid image URL"
                }
            })}
            className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            placeholder="Valid image URL"
            />
            {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
        </div>
        
        <div>
            <label className="block mb-1">Event URL</label>
            <input
            type="text"
            {...register("url", { 
                pattern: { 
                value: /^(https?:\/\/[^\s]+)$/i,
                message: "Enter a valid event URL"
                }
            })}
            className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            placeholder="Valid event URL"
            />
            {errors.url && <p className="text-red-500 text-sm">{errors.url.message}</p>}
        </div>
        
        <div>
            <label className="block mb-1">Location</label>
            <input
            type="text"
            {...register("location", { required: "Location is required" })}
            className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            placeholder="Event location"
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>
        
        <div className="flex gap-4">
            <div className="w-1/2">
            <label className="block mb-1">Date</label>
            <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
            </div>
            <div className="w-1/2">
            <label className="block mb-1">Time</label>
            <input
                type="time"
                {...register("time", { required: "Time is required" })}
                className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            />
            {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
            </div>
        </div>
        
        <div>
            <label className="block mb-1">Description</label>
            <textarea
            {...register("description")}
            className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            placeholder="Event description"
            rows={compact ? 2 : 4}
            ></textarea>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
            <h3 className="font-semibold mb-2">Targeting Settings</h3>
            <div>
            <label className="block mb-1">Target Country</label>
            <input
                type="text"
                {...register("targetCountry")}
                placeholder="e.g., us"
                className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            />
            </div>
            
            <div>
            <label className="block mb-1">Target Genre Interest (comma-separated)</label>
            <input
                type="text"
                {...register("targetGenreInterest")}
                placeholder="e.g., rock, pop"
                className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            />
            </div>
            
            <div>
            <label className="block mb-1">Target Artist Interest (comma-separated)</label>
            <input
                type="text"
                {...register("targetArtistInterest")}
                placeholder="e.g., the beatles, taylor swift"
                className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            />
            </div>
            
            <div>
            <label className="block mb-1">Listening Threshold</label>
            <input
                type="number"
                {...register("listeningThreshold")}
                placeholder="Number of listens required (e.g., 10)"
                className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500">
                This threshold indicates the minimum number of times a user must have listened to be considered.
            </p>
            </div>
            
            <div>
            <label className="block mb-1">Target Role</label>
            <div className="flex items-center">
                <input
                type="checkbox"
                {...register("targetRoles")}
                value="guest"
                className="mr-2"
                />
                <span className="mr-4">Guest</span>
                <input
                type="checkbox"
                {...register("targetRoles")}
                value="regular"
                className="mr-2"
                />
                <span>Regular</span>
            </div>
            <p className="text-xs text-gray-500">
                Select target roles to specify which users to target.
            </p>
            </div>
        </div>
        
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
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