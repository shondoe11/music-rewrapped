import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getArtistGenreMatrix } from '../../services/analyticsService';

const ArtistGenreChord = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('medium_term');
    const [artistLimit, setArtistLimit] = useState(8);
    
    const svgRef = useRef();
    
    //& fetch data on time range / artist limit change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const chordData = await getArtistGenreMatrix(userId, timeRange, artistLimit);
                setData(chordData);
                setError(null);
            } catch (err) {
                console.error('Error fetching artist-genre matrix:', err);
                setError('Failed to load artist-genre data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId, timeRange, artistLimit]);
    
    useEffect(() => {
        if (loading || !data) return;
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();
        
        //~ extract data frm response
        const { matrix, names, colors } = data;
        
        if (matrix.length === 0 || names.length === 0) {
            return;
        }
        
        const width = 800;
        const height = 800;
        const innerRadius = Math.min(width, height) * 0.4;
        const outerRadius = innerRadius * 1.1;
        
        //~ SVG container
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);
            
        //~ chord layout
        const chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);
            
        //~ chord data frm matrix
        const chords = chord(matrix);
        
        //~ grp arcs
        const group = svg.append("g")
            .selectAll("g")
            .data(chords.groups)
            .join("g");
            
        //~ add grp arcs
        group.append("path")
            .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
            .attr("fill", d => colors[d.index])
            .attr("stroke", "#333");
            
        //~ add text labels
        group.append("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", "0.35em")
            .attr("transform", d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${outerRadius + 10})
                ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => names[d.index])
            .style("font-size", "12px")
            .style("fill", "#ccc");
            
        //~ add chords (connections)
        svg.append("g")
            .attr("fill-opacity", 0.75)
            .selectAll("path")
            .data(chords)
            .join("path")
            .attr("d", d3.ribbon().radius(innerRadius))
            .attr("fill", d => colors[d.source.index])
            .attr("stroke", "#333")
            .append("title")
            .text(d => `${names[d.source.index]} → ${names[d.target.index]}: ${Math.round(d.source.value)}`);
            
    }, [data, loading]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }
    
    if (error) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
                <p className="text-red-500">{error}</p>
                <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Artist & Genre Connections</h3>
                
                <div className="flex space-x-2">
                    <select
                        value={artistLimit}
                        onChange={(e) => setArtistLimit(Number(e.target.value))}
                        className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm mr-2"
                    >
                        <option value="5">5 Artists</option>
                        <option value="8">8 Artists</option>
                        <option value="10">10 Artists</option>
                        <option value="15">15 Artists</option>
                    </select>
                    
                    <button
                        onClick={() => setTimeRange('short_term')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'short_term' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Last 4 Weeks
                    </button>
                    <button
                        onClick={() => setTimeRange('medium_term')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'medium_term' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Last 6 Months
                    </button>
                    <button
                        onClick={() => setTimeRange('long_term')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'long_term' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        All Time
                    </button>
                </div>
            </div>
            
            <div className="relative">
                <svg ref={svgRef} width="100%" height="800"></svg>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
                <p>
                    This chord diagram illustrates connections between your favorite artists and genres. 
                    Thicker lines represent stronger connections based on your listening patterns.
                </p>
                {!data || data.matrix?.length === 0 && (
                    <p className="mt-2 text-yellow-500">
                        No artist-genre connection data available for this time period. Continue using Spotify with Re-Wrapped to see these connections!
                    </p>
                )}
            </div>
        </div>
    );
};

ArtistGenreChord.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ArtistGenreChord;