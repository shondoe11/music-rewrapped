import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getListeningHeatmap } from '../../services/analyticsService';
import { motion } from 'framer-motion';

const ListeningHeatmap = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [days, setDays] = useState(90);
    
    const svgRef = useRef();
    const tooltipRef = useRef();
    const containerRef = useRef();
    
    //& fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const heatmapData = await getListeningHeatmap(userId, days);
                setData(heatmapData);
                setError(null);
            } catch (err) {
                console.error('Error fetching listening heatmap:', err);
                setError('Failed to load listening heatmap data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId, days]);
    
    //& create & update heatmap using D3
    useEffect(() => {
        if (loading || !data || !data.data) return;
        
        //~ day & hour labels
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();
        
        //~ set dimensions & margins
        const isMobile = window.innerWidth < 768;
        const containerWidth = containerRef.current ? containerRef.current.clientWidth : 900;
        const margin = { 
            top: 30, 
            right: isMobile ? 10 : 30, 
            bottom: 50, 
            left: isMobile ? 40 : 70 
        };
        const width = Math.max(900, containerWidth) - margin.left - margin.right;
        const height = 480 - margin.top - margin.bottom;
        
        const cellWidth = width / 24;
        const cellHeight = height / 7;
        
        //~ create SVG container
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${Math.max(900, containerWidth)} 480`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        //~ custom color scale
        const colorScale = d3.scaleSequential()
            .domain([0, data.maxValue])
            .interpolator(d => {
                const t = d;
                if (t < 0.5) {
                    return d3.interpolateRgb("#1A365D", "#10B981")(t * 2);
                } else {
                    return d3.interpolateRgb("#10B981", "#8B5CF6")((t - 0.5) * 2);
                }
            });

        //~ add day labels (y-axis)
        svg.selectAll(".day-label")
            .data(days)
            .enter()
            .append("text")
            .attr("class", "day-label")
            .attr("x", -10)
            .attr("y", (d, i) => cellHeight * i + cellHeight / 2)
            .style("text-anchor", "end")
            .style("dominant-baseline", "middle")
            .style("fill", "#ccc")
            .style("font-size", isMobile ? "10px" : "12px")
            .text(d => d.substring(0, 3)); //~ always show abbreviated day names

        //~ add hour labels (x-axis)
        svg.selectAll(".hour-label")
            .data(hours)
            .enter()
            .append("text")
            .attr("class", "hour-label")
            .attr("x", (d, i) => cellWidth * i + cellWidth / 2)
            .attr("y", height + 15)
            .style("text-anchor", "middle")
            .style("fill", "#ccc")
            .style("font-size", isMobile ? "9px" : "10px")
            .text((d, i) => isMobile ? (i % 6 === 0 ? d : '') : (i % 3 === 0 ? d : '')); //~ show fewer hours on mobile

        //~ add title w increased spacing on desktop
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", isMobile ? -15 : -10)
            .style("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "16px")
            .text("Listening Activity by Day and Hour");

        //& create heatmap cells
        const heatmapCells = svg.selectAll(".heatmap-cell")
            .data(data.data.flatMap((dayData, dayIndex) => 
                dayData.map((value, hourIndex) => ({
                    day: dayIndex,
                    hour: hourIndex,
                    value: value
                }))
            ))
            .enter()
            .append("rect")
            .attr("class", "heatmap-cell")
            .attr("x", d => d.hour * cellWidth)
            .attr("y", d => d.day * cellHeight)
            .attr("width", cellWidth - (isMobile ? 0.5 : 1))
            .attr("height", cellHeight - (isMobile ? 0.5 : 1))
            .attr("rx", isMobile ? 2 : 3) //~ slightly smaller rounded corners on mobile
            .attr("ry", isMobile ? 2 : 3)
            .attr("fill", d => d.value > 0 ? colorScale(d.value) : "#1e293b")
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 1)
            .attr("opacity", 0) 
            .transition() 
            .duration(50)
            .delay((d, i) => i * 2)
            .attr("opacity", 1)
            .on("end", function() {
                d3.select(this)
                    .on("mouseover", function(event, d) {
                        const chartRect = svgRef.current.getBoundingClientRect();
                        const tooltipWidth = 150; 
                        const tooltipHeight = 70;
                        
                        let xPosition = event.clientX - chartRect.left;
                        let yPosition = event.clientY - chartRect.top - tooltipHeight - 10;
                        
                        xPosition = Math.max(0, Math.min(xPosition, chartRect.width - tooltipWidth));
                        yPosition = Math.max(10, yPosition);
                        
                        //~ show tooltip
                        d3.select(tooltipRef.current)
                            .style("display", "block")
                            .style("left", `${xPosition}px`)
                            .style("top", `${yPosition}px`)
                            .html(`
                                <div class="font-medium text-gray-200">${days[d.day]}, ${hours[d.hour]}</div>
                                <div class="text-sm mt-1">${d.value} track${d.value === 1 ? '' : 's'} played</div>
                                ${d.value > 0 ? `<div class="text-xs mt-1 text-gray-400">${Math.round(d.value / data.maxValue * 100)}% of peak</div>` : ''}
                            `);
                        
                        //~ highlight cell with transition
                        d3.select(this)
                            .transition()
                            .duration(150)
                            .attr("stroke", "white")
                            .attr("stroke-width", 2)
                            .attr("filter", "brightness(1.2)");
                    })
                    .on("mouseout", function() {
                        //~ hide tooltip
                        d3.select(tooltipRef.current)
                            .style("display", "none");
                        
                        //~ restore cell with transition
                        d3.select(this)
                            .transition()
                            .duration(150)
                            .attr("stroke", "#0f172a")
                            .attr("stroke-width", 1)
                            .attr("filter", null);
                    });
            });

        //& add legend
        const legendWidth = 200;
        const legendHeight = 20;
        const legendX = width - legendWidth;
        const legendY = height + 40;

        //& create gradient fr legend
        const defs = svg.append("defs");

        const gradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        //& add color stops to gradient
        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
            const offset = i / numStops;
            gradient.append("stop")
                .attr("offset", `${offset * 100}%`)
                .attr("stop-color", colorScale(offset * data.maxValue));
        }

        //& draw legend rectangle w gradient
        svg.append("rect")
            .attr("x", isMobile ? width/2 - legendWidth/2 : legendX)
            .attr("y", legendY)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill", "url(#legend-gradient)");

        //& add legend labels
        svg.append("text")
            .attr("x", isMobile ? width/2 - legendWidth/2 : legendX)
            .attr("y", legendY - 5)
            .style("text-anchor", "start")
            .style("fill", "#ccc")
            .style("font-size", "12px")
            .text("0");
            
        svg.append("text")
            .attr("x", isMobile ? width/2 + legendWidth/2 : legendX + legendWidth)
            .attr("y", legendY - 5)
            .style("text-anchor", "end")
            .style("fill", "#ccc")
            .style("font-size", "12px")
            .text(`${data.maxValue}`);
            
        svg.append("text")
            .attr("x", isMobile ? width/2 : legendX + legendWidth / 2)
            .attr("y", legendY - 5)
            .style("text-anchor", "middle")
            .style("fill", "#ccc")
            .style("font-size", "12px")
            .text("Tracks played");
        }, [data, loading]);

        if (loading) {
            return (
                <motion.div 
                    className="flex justify-center items-center h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Loader />
                </motion.div>
            );
        }

        if (error) {
            return (
                <motion.div 
                    className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl backdrop-blur-sm text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-red-400 font-medium text-lg">{error}</p>
                    <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
                </motion.div>
            );
        }

        return (
            <motion.div 
                ref={containerRef}
                className="bg-gray-800/40 backdrop-blur-xl p-2 sm:p-4 rounded-xl border border-gray-700/50 shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                    <motion.h3 
                        className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Listening Activity Heatmap
                    </motion.h3>
                    
                    <motion.div 
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <span className="text-sm text-gray-300">Time period:</span>
                        <div className="relative">
                            <select
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="bg-gray-900/70 text-white border border-gray-700/50 rounded-lg py-1.5 px-4 pr-8 text-sm appearance-none shadow-sm hover:border-blue-500/50 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all duration-200"
                            >
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="180">Last 6 months</option>
                                <option value="365">Last year</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                <div className="relative overflow-hidden -mx-3 sm:-mx-1">
                    <svg ref={svgRef} width="100%" height="480" className="overflow-visible"></svg>
                    <div
                        ref={tooltipRef}
                        className="absolute bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-gray-700/50 pointer-events-none hidden z-50"
                        style={{ display: 'none', position: 'absolute' }}
                    ></div>
                </div>
                
                <div className="mt-6 text-sm text-gray-400 border-t border-gray-700/30 pt-4">
                    <p>
                        This heatmap shows when you're most active on Spotify throughout the week. 
                        Brighter colors indicate more tracks played during that hour of the day.
                    </p>
                    {data && data.data.every(row => row.every(cell => cell === 0)) && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                            <p className="text-yellow-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                No listening data available for this time period. Continue using Spotify with Re-Wrapped to see your activity patterns!
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
};

ListeningHeatmap.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ListeningHeatmap;