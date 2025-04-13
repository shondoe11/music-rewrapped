import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getArtistGenreMatrix } from '../../services/analyticsService';
import { motion } from 'framer-motion';
import { isSafari, isFirefox } from '../../utils/browserDetection';

const ArtistGenreChord = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('long_term');
    const [artistLimit, setArtistLimit] = useState(15);
    const [_selectedSegment, _setSelectedSegment] = useState(null);
    const [isSafariBrowser, setIsSafariBrowser] = useState(false);
    const [isFirefoxBrowser, setIsFirefoxBrowser] = useState(false);
    const [originalColors, setOriginalColors] = useState([]);
    
    const svgRef = useRef();
    const tooltipRef = useRef();
    
    useEffect(() => {
        setIsSafariBrowser(isSafari());
        setIsFirefoxBrowser(isFirefox());
    }, []);
    
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
    const height = 700;
    const topPadding = 80;
    const innerRadius = Math.min(width, height - topPadding * 2) * 0.36;
    const outerRadius = innerRadius * 1.1;
    
    //~ SVG container
    const svg = d3.select(svgRef.current)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", height)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);
    
    //~ enhance colors with gradient definitions
    const defs = svg.append("defs");
    
    const backgroundGradient = defs.append("radialGradient")
    .attr("id", "background-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("gradientUnits", "objectBoundingBox"); //~ fr Safari compatibility
    
    backgroundGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#1f2937")
    .attr("stop-opacity", 0.2);
    
    backgroundGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#111827")
    .attr("stop-opacity", 0.3);
    
    svg.append("circle")
    .attr("r", innerRadius * 1.25)
    .attr("fill", "url(#background-gradient)")
    .attr("opacity", 0.5);
    
    //& store original colors fr tooltip use
    if (originalColors.length === 0) {
        setOriginalColors([...colors]);
    }
    
    colors.forEach((color, i) => {
    const gradientId = `chord-gradient-${i}`;
    
    const segmentGradient = defs.append("linearGradient")
    .attr("id", gradientId)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("gradientUnits", "objectBoundingBox"); //~ fr Safari compatibility
    
const _baseHex = color.startsWith("#") ? color.substring(1) : color;
    
    let lighterColor;
    try {
    const rgb = d3.rgb(color);
    lighterColor = d3.rgb(
    Math.min(255, rgb.r + 40),
    Math.min(255, rgb.g + 40),
    Math.min(255, rgb.b + 40)
    ).formatHex();
    } catch (_) {
    lighterColor = color;
    }
    
    segmentGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", lighterColor);
    
    segmentGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", color);
    
    colors[i] = `url(#${gradientId})`;
    });
    
    //~ chord layout
    const chord = d3.chord()
    .padAngle(0.07)
    .sortSubgroups(d3.descending);
    
    //~ chord data frm matrix
    const chords = chord(matrix);
    
    //~ grp arcs w enhanced visuals & interactions
    const group = svg.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");
    
    //~ add grp arcs w animation & enhanced styling
    group.append("path")
    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
    .attr("fill", d => colors[d.index])
    .attr("stroke", "#1f2937")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0)
    .transition() 
    .duration(750)
    .delay((d, i) => i * 100) 
    .attr("opacity", 0.85);
    
    group.selectAll("path")
    .on("mouseover touchstart", function(event, d) {
        const [_pointerX, _pointerY] = d3.pointer(event, this);
        
        d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
        
        svg.selectAll(".chord")
        .filter(c => c.source.index === d.index || c.target.index === d.index)
        .transition()
        .duration(200)
        .attr("opacity", 0.9)
        .attr("stroke", "#fff");
        
        svg.selectAll(".chord")
        .filter(c => c.source.index !== d.index && c.target.index !== d.index)
        .transition()
        .duration(200)
        .attr("opacity", 0.1);
        
        const relatedChords = chords.filter(c => 
            c.source.index === d.index || c.target.index === d.index
        );
        
        const connections = relatedChords.map(c => {
            const isSource = c.source.index === d.index;
            const otherIndex = isSource ? c.target.index : c.source.index;
            const value = isSource ? c.source.value : c.target.value;
            return {
                name: names[otherIndex],
                value: Math.round(value)
            };
        }).sort((a, b) => b.value - a.value);
        
        //& calculating angle & position (fr highlighting)
        const angle = (d.startAngle + d.endAngle) / 2;
        const _x = Math.sin(angle) * (outerRadius + 30);
        const _y = -Math.cos(angle) * (outerRadius + 30);
        
        const chartRect = svgRef.current.getBoundingClientRect();
        const tooltip = d3.select(tooltipRef.current);
        
        //& use original color for tooltip
        const segmentColor = originalColors[d.index] || '#ffffff';
        
        //& responsive positioning calculation
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        let leftPosition, topPosition;
        
        //& position tooltip based on screen size
        if (isMobile || isTablet) {
            //~ fixed position guaranteed to be visible inside component
            leftPosition = chartRect.left + chartRect.width / 2;
            topPosition = chartRect.top + 80;
        } else {
            //~ desktop position
            leftPosition = chartRect.left + width/2;
            topPosition = chartRect.top + 40;
        }
        
        tooltip.style("display", "block")
        .style("left", `${leftPosition}px`)
        .style("top", `${topPosition}px`)
        .html(`
            <div class="text-lg font-medium" style="color:${segmentColor}">${names[d.index]}</div>
            <div class="text-sm text-gray-300 mt-1">Connections:</div>
            <div class="max-h-40 overflow-y-auto pr-2">
                ${connections.map((conn, _i) => `
                <div class="flex justify-between items-center mt-1 text-sm">
                <span style="color:${segmentColor}">${conn.name}</span>
                <span style="color:${segmentColor}" class="ml-4">${conn.value}</span>
                </div>
                `).join('')}
            </div>
        `);
    })
    .on("mouseout touchend touchcancel", function() {
        d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0.85)
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 1.5);
        
        svg.selectAll(".chord")
        .transition()
        .duration(200)
        .attr("opacity", 0.75)
        .attr("stroke", "#1f2937");
        
        d3.select(tooltipRef.current)
        .style("display", "none");
    });
    
    //~ add text labels w improved readability
    group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", "0.35em")
    .attr("transform", d => `
    rotate(${(d.angle * 180 / Math.PI - 90)})
    translate(${outerRadius + 25})
    ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
    .text(d => names[d.index])
    .style("font-size", "13px")
    .style("font-weight", "medium")
    .style("fill", "#e2e8f0")
    .style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)")
    .style("opacity", 0)
    .transition()
    .duration(750)
    .delay((d, i) => 500 + i * 100)
    .style("opacity", 1);
    
    //~ add chords (connections) w improved styling & animations
    svg.append("g")
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("class", "chord")
    .attr("d", d3.ribbon().radius(innerRadius))
    .attr("fill", d => colors[d.source.index])
    .attr("fill-opacity", 0.75)
    .attr("stroke", "#1f2937")
    .attr("stroke-width", 0.75)
    .attr("opacity", 0) 
    .transition() 
    .duration(750)
    .delay((d, i) => 1000 + i * 20) 
    .attr("opacity", 0.75);
    
    //~ add event handlers separately fr chords
    svg.selectAll(".chord")
    .on("mouseover touchstart", function(event, d) {
        const [_pointerX, _pointerY] = d3.pointer(event);
        
        d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
        
        svg.selectAll("g").selectAll("path")
        .filter((_, i, nodes) => {
            const arcData = d3.select(nodes[i].parentNode).datum();
            return arcData && (arcData.index === d.source.index || arcData.index === d.target.index);
        })
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .attr("stroke", "#fff");
        
        const chartRect = svgRef.current.getBoundingClientRect();
        const tooltip = d3.select(tooltipRef.current);
        
        //& use original color fr tooltip
        const sourceColor = originalColors[d.source.index] || '#ffffff';
        
        //& responsive positioning calculation
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        let leftPosition, topPosition;
        
        //& position tooltip based on screen size
        if (isMobile || isTablet) {
            //~ fixed position guaranteed to be visible inside component
            leftPosition = chartRect.left + chartRect.width / 2;
            topPosition = chartRect.top + 80;
        } else {
            //~ desktop position
            leftPosition = chartRect.left + width/2;
            topPosition = chartRect.top + 40;
        }
        
        tooltip.style("display", "block")
        .style("left", `${leftPosition}px`)
        .style("top", `${topPosition}px`)
        .html(`
            <div class="font-medium"><span style="color:${sourceColor}">${names[d.source.index]}</span> → <span style="color:${sourceColor}">${names[d.target.index]}</span></div>
            <div class="text-sm text-gray-300 mt-1">Connection strength: ${Math.round(d.source.value)}</div>
        `);
    })
    .on("mouseout touchend touchcancel", function() {
        d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0.75)
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 0.75);
        
        svg.selectAll("g").selectAll("path")
        .transition()
        .duration(200)
        .attr("opacity", 0.85)
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 1.5);
        
        d3.select(tooltipRef.current)
        .style("display", "none");
    });
    }, [data, loading, originalColors]);
    
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
    
    //~ add browser-specific class fr styling
    const containerClass = `bg-gray-800/40 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50 shadow-xl hover:shadow-pink-500/5 transition-all duration-300 ${isSafariBrowser ? 'safari-compat' : ''} ${isFirefoxBrowser ? 'firefox-compat' : ''}`;
    
    return (
    <motion.div 
    className={containerClass}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    >
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
    <motion.h3 
    className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-400"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    >
    Artist & Genre Connections
    </motion.h3>
    
    <motion.div 
    className="flex flex-wrap gap-2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    >
    <div className="relative">
    <select
    value={artistLimit}
    onChange={(e) => setArtistLimit(Number(e.target.value))}
    className="bg-gray-900/70 text-white border border-gray-700/50 rounded-lg py-1.5 px-4 pr-8 text-sm appearance-none shadow-sm hover:border-pink-500/50 focus:border-pink-500/70 focus:ring-1 focus:ring-pink-500/50 focus:outline-none transition-all duration-200"
    >
    <option value="5">5 Artists</option>
    <option value="8">8 Artists</option>
    <option value="10">10 Artists</option>
    <option value="15">15 Artists</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    </div>
    </div>
    
    <div className="bg-gray-900/50 p-1 rounded-lg flex">
    <button
    onClick={() => setTimeRange('short_term')}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
    timeRange === 'short_term' 
    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
    }`}
    >
    Last 4 Weeks
    </button>
    <button
    onClick={() => setTimeRange('medium_term')}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
    timeRange === 'medium_term' 
    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
    }`}
    >
    Last 6 Months
    </button>
    <button
    onClick={() => setTimeRange('long_term')}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
    timeRange === 'long_term' 
    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
    }`}
    >
    All Time
    </button>
    </div>
    </motion.div>
    </div>
    
    <div className="relative overflow-hidden rounded-lg safari-flex-fix">
    <div>
    <svg ref={svgRef} width="100%" height="700" preserveAspectRatio="xMidYMid meet" className="overflow-visible"></svg>
    <div
    ref={tooltipRef}
    className="absolute bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-gray-700/50 pointer-events-none hidden z-50 max-w-xs w-64"
    style={{ display: 'none', transform: 'translate(-50%, 0)' }}
    ></div>
    </div>
    </div>
    
    <div className="mt-6 text-sm text-gray-400 border-t border-gray-700/30 pt-4">
    <p>
    This chord diagram illustrates connections between your favorite artists and genres. 
    Thicker lines represent stronger connections based on your listening patterns.
    Hover over segments to explore connections in detail.
    </p>
    {!data || (data.matrix && data.matrix.length === 0) && (
    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
    <p className="text-yellow-500 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
    No artist-genre connection data available for this time period. Continue using Spotify with Re-Wrapped to see these connections!
    </p>
    </div>
    )}
    </div>
    </motion.div>
    );
};

ArtistGenreChord.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ArtistGenreChord;