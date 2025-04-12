import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getGenreDistribution } from '../../services/analyticsService';
import { motion } from 'framer-motion';

const GenreBubbleChart = ({ userId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('medium_term');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    const svgRef = useRef();
    const tooltipRef = useRef();
    const containerRef = useRef();
    
    //& handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    //& fetch data on time range change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const genreData = await getGenreDistribution(userId, timeRange);
                setData(genreData);
                setError(null);
            } catch (err) {
                console.error('Error fetching genre distribution:', err);
                setError('Failed to load genre distribution data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId, timeRange]);
    
    useEffect(() => {
        if (loading || !data || data.length === 0) return;
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();

        //~ use container dimensions for more responsive sizing
        const containerWidth = containerRef.current ? containerRef.current.clientWidth : 900;
        const isMobile = window.innerWidth < 768;   
        //~ optimize dimensions fr maximum bubble size
        //~ on mobile: use square fr best packing w slightly taller height
        //~ on desktop: use wide rectangle fr best viewing
        const width = isMobile ? containerWidth - 20 : Math.max(1000, containerWidth * 1.2);
        const height = isMobile ? width * 1.6 : 600;
        
        //~ SVG container
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", height)
            .attr("preserveAspectRatio", isMobile ? "xMidYMin meet" : "xMidYMid meet")
            
        //~ hierarchy data structure fr bubble layout
        const hierarchy = {
            children: data.map(d => ({
                name: d.genre,
                value: d.minutes,
                trackCount: d.trackCount
            }))
        };
        
        //~ bubble layout w minimal padding fr largest possible bubbles
        const bubble = d3.pack()
            .size([width, height])
            .padding(isMobile ? 1 : 3);
            
        //~ process data fr bubble layout
        const root = d3.hierarchy(hierarchy)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
            
        bubble(root);
        
        //~ custom color palette
        const colorPalette = [
            "#10B981",
            "#3B82F6", 
            "#8B5CF6", 
            "#EC4899",
            "#F59E0B",
            "#06B6D4",
            "#6366F1",
            "#84CC16",
            "#14B8A6", 
            "#F97316", 
            "#8B5CF6", 
            "#0EA5E9", 
            "#D946EF", 
            "#22C55E", 
            "#4F46E5", 
            "#7C3AED",
        ];
        
        //~ color scale fr bubbles
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.genre))
            .range(colorPalette);
            
        //~ add subtle gradient bg
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "url(#bubble-background)")
            .attr("rx", isMobile ? 8 : 15)
            .attr("ry", isMobile ? 8 : 15)
            .attr("opacity", 0.05);
            
        //~ define gradients
        const defs = svg.append("defs");
        
        //~ bg gradient
        const backgroundGradient = defs.append("linearGradient")
            .attr("id", "bubble-background")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%");
            
        backgroundGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#3B82F6")
            .attr("stop-opacity", 0.2);
            
        backgroundGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#10B981")
            .attr("stop-opacity", 0.2);
            
        //~ bubbles
        const nodes = svg.selectAll('.node')
            .data(root.children)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`);
        
        //~ create individual gradients fr each bubble
        nodes.each(function(d, i) {
            const gradientId = `bubble-gradient-${i}`;
            const baseColor = color(d.data.name);
            
            let lighterColor;
            try {
                const rgb = d3.rgb(baseColor);
                lighterColor = d3.rgb(
                    Math.min(255, rgb.r + 40),
                    Math.min(255, rgb.g + 40),
                    Math.min(255, rgb.b + 40)
                ).formatHex();
            } catch {
                //~ silently handle error and use fallback
                lighterColor = baseColor;
            }
            
            const gradient = defs.append("radialGradient")
                .attr("id", gradientId)
                .attr("cx", "30%")
                .attr("cy", "30%")
                .attr("r", "70%")
                .attr("gradientUnits", "objectBoundingBox");
                
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", lighterColor);
                
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", baseColor);
            
            d.gradientId = gradientId;
        });
            
        //~ circles w smooth entrance animation
        nodes.append('circle')
            .attr('r', 0)
            .attr('fill', d => `url(#${d.gradientId})`)
            .attr('opacity', 0.85)
            .attr('stroke', d => d3.rgb(color(d.data.name)).darker(0.5))
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.7)
            .attr('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
            .transition()
            .duration(800)
            .delay((d, i) => i * 30)
            .ease(d3.easeBounceOut)
            .attr('r', d => d.r)
            .on('end', function() {
                d3.select(this)
                    .on('mouseover', function(event, d) {
                        const chartRect = svgRef.current.getBoundingClientRect();
                        const tooltipWidth = 180; 
                        const tooltipHeight = 100;
                        
                        let xPosition = event.clientX - chartRect.left;
                        let yPosition = event.clientY - chartRect.top - tooltipHeight - 10;
                        
                        xPosition = Math.max(0, Math.min(xPosition, chartRect.width - tooltipWidth));
                        yPosition = Math.max(10, yPosition);
                        
                        //~ tooltip
                        d3.select(tooltipRef.current)
                            .style('display', 'block')
                            .style('left', `${xPosition}px`)
                            .style('top', `${yPosition}px`)
                            .html(`
                                <div class="font-medium text-lg" style="color:${color(d.data.name)}">${d.data.name}</div>
                                <div class="mt-1 text-gray-200">${Math.round(d.data.value)} minutes listened</div>
                                <div class="text-gray-300">${Math.round(d.data.trackCount)} tracks</div>
                                <div class="text-xs mt-1 text-gray-400">${Math.round((d.value / root.value) * 100)}% of your total listening</div>
                            `);
                            
                        //~ highlight circle
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr('stroke-width', 3)
                            .attr('stroke', '#fff')
                            .attr('opacity', 1);
                    })
                    .on('mouseout', function() {
                        //~ hide tooltip
                        d3.select(tooltipRef.current)
                            .style('display', 'none');
                            
                        //~ restore circle
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr('stroke-width', 1.5)
                            .attr('stroke', d => d3.rgb(color(d.data.name)).darker(0.5))
                            .attr('stroke-opacity', 0.7)
                            .attr('opacity', 0.85);
                    });
            });
            
        //~ add text labels but only fr larger bubbles w improved text readability
        nodes.filter(d => d.r > 30)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .attr('fill', '#fff')
            .attr('opacity', 0)
            .style('font-size', d => Math.min(d.r / 3, 13) + 'px')
            .style('font-weight', 'bold')
            .style('text-shadow', '0 1px 3px rgba(0,0,0,0.7)')
            .text(d => d.data.name)
            .style('pointer-events', 'none')
            .transition()
            .duration(500)
            .delay((d, i) => 800 + i * 30)
            .attr('opacity', 1);
            
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
            className="bg-gray-800/40 backdrop-blur-xl p-3 sm:p-6 rounded-xl border border-gray-700/50 shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <motion.h3 
                    className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Your Musical Universe
                </motion.h3>
                
                <motion.div 
                    className="flex bg-gray-900/50 p-1 rounded-lg w-full justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <button
                        onClick={() => setTimeRange('short_term')}
                        className={`flex-1 px-4 py-1.5 rounded-l-md rounded-r-none text-sm font-medium transition-all duration-300 ${
                            timeRange === 'short_term' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                            : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                        }`}
                    >
                        Last 4 Weeks
                    </button>
                    <button
                        onClick={() => setTimeRange('medium_term')}
                        className={`flex-1 px-4 py-1.5 rounded-none border-l border-r border-gray-700/30 text-sm font-medium transition-all duration-300 ${
                            timeRange === 'medium_term' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                            : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                        }`}
                    >
                        Last 6 Months
                    </button>
                    <button
                        onClick={() => setTimeRange('long_term')}
                        className={`flex-1 px-4 py-1.5 rounded-l-none rounded-r-md text-sm font-medium transition-all duration-300 ${
                            timeRange === 'long_term' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                            : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                        }`}
                    >
                        All Time
                    </button>
                </motion.div>
            </div>
            
            <div className={`relative rounded-lg ${isMobile ? '-mx-3 overflow-visible' : '-mx-2 sm:mx-0 overflow-hidden'}`}>
                <svg ref={svgRef} width="100%" height={isMobile ? "160%" : "600"} className="overflow-visible"></svg>
                <div
                    ref={tooltipRef}
                    className="absolute bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-gray-700/50 pointer-events-none hidden z-50"
                    style={{ display: 'none', position: 'absolute' }}
                ></div>
            </div>
            
            <div className="mt-6 text-sm text-gray-400 border-t border-gray-700/30 pt-4">
                <p>
                    This visualization shows your listening distribution across different genres. 
                    Larger bubbles represent genres you listen to more frequently. 
                    Hover over bubbles to see detailed listening statistics.
                </p>
                {data.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                        <p className="text-yellow-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            No genre data available for this time period. Continue using Spotify with Re-Wrapped to see your genre preferences!
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

GenreBubbleChart.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default GenreBubbleChart;