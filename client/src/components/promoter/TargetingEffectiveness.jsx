import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

const TargetingEffectiveness = ({ targetingData }) => {
    const [selectedCategory, setSelectedCategory] = useState('countries');
    
    if (!targetingData || !targetingData[selectedCategory] || Object.keys(targetingData[selectedCategory]).length === 0) {
        return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold mb-4">Targeting Effectiveness</h3>
            <div className="text-center py-8 text-gray-400">
            No targeting data available. Create events with targeting parameters to see analytics.
            </div>
        </div>
        );
    }
    
    //& prepare data fr selected category
    const prepareChartData = () => {
        const categoryData = targetingData[selectedCategory];
        return Object.entries(categoryData).map(([name, data]) => ({
        name: name.length > 10 ? name.substring(0, 10) + '...' : name,
        engagement: parseFloat(data.avgEngagement.toFixed(1)),
        saveRate: parseFloat(data.saveRate.toFixed(1)),
        events: data.events
        })).sort((a, b) => b.engagement - a.engagement).slice(0, 8); // Show top 8
    };
    
    const chartData = prepareChartData();
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Targeting Effectiveness</h3>
            
            <div className="flex space-x-2">
            <button
                onClick={() => setSelectedCategory('countries')}
                className={`px-3 py-1 rounded-md text-sm ${
                selectedCategory === 'countries' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                Countries
            </button>
            <button
                onClick={() => setSelectedCategory('genres')}
                className={`px-3 py-1 rounded-md text-sm ${
                selectedCategory === 'genres' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                Genres
            </button>
            <button
                onClick={() => setSelectedCategory('artists')}
                className={`px-3 py-1 rounded-md text-sm ${
                selectedCategory === 'artists' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                Artists
            </button>
            </div>
        </div>
        
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                contentStyle={{
                    backgroundColor: '#333',
                    borderColor: '#444',
                    color: '#fff',
                }}
                formatter={(value, name) => {
                    if (name === 'saveRate') return [value + '%', 'Save Rate'];
                    return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                }}
                />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Bar dataKey="engagement" name="Engagement" fill="#F472B6" />
                <Bar dataKey="saveRate" name="Save Rate (%)" fill="#3B82F6" />
                <Bar dataKey="events" name="Events" fill="#4ADE80" />
            </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
            <p>
            This chart shows the effectiveness of your targeting parameters. Higher engagement and save rates indicate more successful targeting.
            </p>
        </div>
        </div>
    );
};

TargetingEffectiveness.propTypes = {
    targetingData: PropTypes.shape({
        countries: PropTypes.object,
        genres: PropTypes.object,
        artists: PropTypes.object
    }).isRequired
};

export default TargetingEffectiveness;