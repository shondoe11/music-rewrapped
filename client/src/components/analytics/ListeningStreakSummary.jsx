import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Loader from '../../styles/Loader';
import { getLongestListeningStreak } from '../../services/analyticsService';
import { motion } from 'framer-motion';

const ListeningStreakSummary = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredMonth, setHoveredMonth] = useState(null);
    
    const svgRef = useRef();
    const tooltipRef = useRef();
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const streakData = await getLongestListeningStreak(userId);
                setData(streakData);
                setError(null);
            } catch (err) {
                console.error('Error fetching listening streak data:', err);
                setError('Failed to load listening streak data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId]);
    
    //& create & update radial chart
    useEffect(() => {
        if (loading || !data || !data.monthly_hours || Object.keys(data.monthly_hours).length === 0) return;
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();
        
        //~ chart dimensions
        const width = 600;
        const height = 600;
        const margin = 60;
        const innerRadius = 80;
        const outerRadius = Math.min(width, height) / 2 - margin;
        
        //~ SVG
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);
            
        //~ subtle bg
        svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", outerRadius + 20)
            .attr("fill", "url(#radialBackgroundGradient)")
            .attr("opacity", 0.1);
            
        //~ process data
        const monthsData = [];
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        
        //& get reference year frm data / use current year
        let referenceYear = new Date().getFullYear();
        const monthlyHours = data.monthly_hours;
        const dataMonths = Object.keys(monthlyHours);
        
        if (dataMonths.length > 0) {
            //~ extract year frm first data point if avail
            referenceYear = parseInt(dataMonths[0].split('-')[0], 10);
        }
        
        //& generate all 12 months w empty data
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const monthNum = monthIndex + 1;
            const yearMonth = `${referenceYear}-${String(monthNum).padStart(2, '0')}`;
            
            monthsData.push({
                month: months[monthIndex],
                yearMonth: yearMonth,
                hours: 0 //~ default 0 hours
            });
        }
        
        //& now fill actual data where it exists
        Object.entries(monthlyHours).forEach(([yearMonth, hours]) => {
            const [year, monthStr] = yearMonth.split('-');
            const monthIndex = parseInt(monthStr, 10) - 1; //~ convert 0-based index
            
            //~ only update if year match reference year
            if (parseInt(year, 10) === referenceYear && monthIndex >= 0 && monthIndex < 12) {
                monthsData[monthIndex].hours = hours;
            }
        });
        
        //~ get max value fr scale
        const maxHours = d3.max(monthsData, d => d.hours) || 1;
        
        //~ scales
        const angleScale = d3.scaleLinear()
            .domain([0, monthsData.length])
            .range([0, 2 * Math.PI]);
            
        const radiusScale = d3.scaleLinear()
            .domain([0, maxHours])
            .range([innerRadius, outerRadius]);
            
        //~ define gradients
        const defs = svg.append("defs");
        
        //~ bg gradient
        const backgroundGradient = defs.append("radialGradient")
            .attr("id", "radialBackgroundGradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
            
        backgroundGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#4ADE80")
            .attr("stop-opacity", 0.1);
            
        backgroundGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#3B82F6")
            .attr("stop-opacity", 0.05);
            
        //~ area fill gradient
        const fillGradient = defs.append("radialGradient")
            .attr("id", "radialFillGradient")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", outerRadius)
            .attr("gradientUnits", "userSpaceOnUse");
            
        fillGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#4ADE80")
            .attr("stop-opacity", 0.9);
            
        fillGradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#22C55E")
            .attr("stop-opacity", 0.6);
            
        fillGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#16A34A")
            .attr("stop-opacity", 0.2);
            
        //~ center gradient
        const centerGradient = defs.append("radialGradient")
            .attr("id", "centerGradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
            
        centerGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#4ADE80");
            
        centerGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#22C55E");
            
        //~ glow filter fr highlighted elements
        const filter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
            
        filter.append("feGaussianBlur")
            .attr("stdDeviation", "3")
            .attr("result", "blur");
            
        filter.append("feComposite")
            .attr("in", "SourceGraphic")
            .attr("in2", "blur")
            .attr("operator", "over");
            
        //~ x axis (circles) w smoother appearance
        const xAxisTicks = [maxHours * 0.25, maxHours * 0.5, maxHours * 0.75, maxHours];
        
        svg.selectAll(".circle-axis")
            .data(xAxisTicks)
            .join("circle")
            .attr("class", "circle-axis")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => radiusScale(d))
            .attr("fill", "none")
            .attr("stroke", "#374151")
            .attr("stroke-dasharray", "3,3")
            .attr("stroke-width", 0.8)
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .delay((d, i) => i * 200)
            .attr("opacity", 0.6);
            
        //~ x axis labels w better positioning & styling
        svg.selectAll(".circle-axis-label")
            .data(xAxisTicks)
            .join("text")
            .attr("class", "circle-axis-label")
            .attr("x", 5)
            .attr("y", d => -radiusScale(d))
            .attr("dy", 3)
            .attr("text-anchor", "start")
            .attr("fill", "#9CA3AF")
            .attr("font-size", "11px")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .delay((d, i) => 800 + i * 200)
            .attr("opacity", 1)
            .text(d => `${Math.round(d)} hrs`);
            
        //~ y axis (months) w improved styling
        svg.selectAll(".month-line")
            .data(monthsData)
            .join("line")
            .attr("class", "month-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * outerRadius)
            .attr("y2", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * outerRadius)
            .attr("stroke", "#374151")
            .attr("stroke-width", 0.8)
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .delay((d, i) => i * 100)
            .attr("opacity", 0.4);
            
        //~ month labels w better styling
        svg.selectAll(".month-label")
            .data(monthsData)
            .join("text")
            .attr("class", "month-label")
            .attr("x", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * (outerRadius + 20))
            .attr("y", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * (outerRadius + 20))
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", d => d.hours > 0 ? "#D1D5DB" : "#9CA3AF") 
            .attr("font-weight", d => d.hours > 0 ? "500" : "400")
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .delay((d, i) => 1000 + i * 100)
            .attr("opacity", 1)
            .text(d => d.month);
        
        //~ create custom path fr filled area w animation
        let hasData = false;
        let startIndex = -1;
        
        //~ find first month w data
        for (let i = 0; i < monthsData.length; i++) {
            if (monthsData[i].hours > 0) {
                hasData = true;
                startIndex = i;
                break;
            }
        }
        
        if (hasData) {
            //~ create custom path fr filled area
            let pathData = "";
            const activeMonths = monthsData.filter(d => d.hours > 0);
            
            if (activeMonths.length > 0) {
                //& start at center
                pathData = "M 0,0 ";
                
                //& draw line to first month w data
                const firstMonth = activeMonths[0];
                const firstMonthIndex = monthsData.indexOf(firstMonth);
                const firstAngle = angleScale(firstMonthIndex) - Math.PI / 2;
                const firstX = Math.cos(firstAngle) * radiusScale(firstMonth.hours);
                const firstY = Math.sin(firstAngle) * radiusScale(firstMonth.hours);
                
                pathData += `L ${firstX},${firstY} `;
                
                //& ONLY months w data to path
                activeMonths.forEach(month => {
                    const monthIndex = monthsData.indexOf(month);
                    const angle = angleScale(monthIndex) - Math.PI / 2;
                    const x = Math.cos(angle) * radiusScale(month.hours);
                    const y = Math.sin(angle) * radiusScale(month.hours);
                    
                    pathData += `L ${x},${y} `;
                });
                
                //~ close path back to center
                pathData += "Z";
                
                //~ draw custom path
                svg.append("path")
                    .attr("d", pathData)
                    .attr("fill", "url(#radialFillGradient)")
                    .attr("stroke", "#4ADE80")
                    .attr("stroke-width", 1.5)
                    .attr("opacity", 0) 
                    .transition()
                    .duration(1500)
                    .attr("opacity", 0.85); 
            }
        } else {
            //~ fallback if no data - create small circle in center w animation
            svg.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", innerRadius)
                .attr("fill", "url(#centerGradient)")
                .attr("opacity", 0) 
                .transition()
                .duration(1000)
                .attr("opacity", 0.7);
        }
        
        //~ center circle
        svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", innerRadius)
            .attr("fill", "url(#centerGradient)")
            .attr("opacity", 0.6)
            .attr("stroke", "#22C55E")
            .attr("stroke-width", 1);
            
        //~ center text w better styling
        const centerText = svg.append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#FFFFFF");
            
        centerText.append("tspan")
            .attr("x", 0)
            .attr("dy", "-0.6em")
            .attr("font-size", "18px")
            .attr("font-weight", "medium")
            .text("Hours");
            
        centerText.append("tspan")
            .attr("x", 0)
            .attr("dy", "1.4em")
            .attr("font-size", "18px")
            .attr("font-weight", "medium")
            .text("Listened");
            
        //& enhanced dots fr each month w interactive features
        const dots = svg.selectAll(".month-dot")
            .data(monthsData)
            .join("g")
            .attr("class", "month-dot")
            .attr("transform", (d, i) => {
                const angle = angleScale(i) - Math.PI / 2;
                const r = d.hours > 0 ? radiusScale(d.hours) : innerRadius;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                return `translate(${x}, ${y})`;
            })
            .style("cursor", "pointer")
            .on("mouseover", function(event, d, i) {
                if (d.hours <= 0) return;
                
                d3.select(this).select("circle.dot-highlight")
                    .transition()
                    .duration(200)
                    .attr("r", 15)
                    .attr("opacity", 0.5);
                    
                d3.select(this).select("circle.dot-outer")
                    .transition()
                    .duration(200)
                    .attr("r", 12)
                    .attr("stroke-width", 2)
                    .attr("filter", "url(#glow)");
                    
                d3.select(this).select("circle.dot-inner")
                    .transition()
                    .duration(200)
                    .attr("r", 5);
                    
                const chartRect = svgRef.current.getBoundingClientRect();
                const tooltipWidth = 200;
                const tooltipHeight = 80;
                
                const angle = angleScale(monthsData.indexOf(d)) - Math.PI / 2;
                const r = radiusScale(d.hours);
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                
                const tooltipX = chartRect.width / 2 + x;
                const tooltipY = chartRect.height / 2 + y;
                
                const tooltip = d3.select(tooltipRef.current);
                tooltip.style("display", "block")
                    .style("left", `${tooltipX}px`)
                    .style("top", `${tooltipY - 15}px`)
                    .html(`
                        <div class="font-medium text-green-400">${d.month} ${referenceYear}</div>
                        <div class="text-white text-lg font-semibold">${Math.round(d.hours)} listening hours</div>
                        <div class="text-gray-300 text-sm">~${Math.round(d.hours * 60 / 3.5)} tracks</div>
                    `);
                    
                setHoveredMonth(d.month);
            })
            .on("mouseout", function() {
                d3.select(this).select("circle.dot-highlight")
                    .transition()
                    .duration(200)
                    .attr("r", 10)
                    .attr("opacity", 0.2);
                    
                d3.select(this).select("circle.dot-outer")
                    .transition()
                    .duration(200)
                    .attr("r", 8)
                    .attr("stroke-width", 1.5)
                    .attr("filter", "none");
                    
                d3.select(this).select("circle.dot-inner")
                    .transition()
                    .duration(200)
                    .attr("r", 3);
                    
                d3.select(tooltipRef.current)
                    .style("display", "none");
                    
                setHoveredMonth(null);
            });
            
        dots.append("circle")
            .attr("class", "dot-highlight")
            .attr("r", 10)
            .attr("fill", d => d.hours > 0 ? "#4ADE80" : "transparent")
            .attr("opacity", 0.2);
            
        dots.append("circle")
            .attr("class", "dot-outer")
            .attr("r", d => d.hours > 0 ? 8 : 4)
            .attr("fill", "transparent")
            .attr("stroke", d => d.hours > 0 ? "#4ADE80" : "#6B7280")
            .attr("stroke-width", d => d.hours > 0 ? 1.5 : 0.5)
            .attr("opacity", d => d.hours > 0 ? 1 : 0.5);
            
        dots.append("circle")
            .attr("class", "dot-inner")
            .attr("r", d => d.hours > 0 ? 3 : 2)
            .attr("fill", d => d.hours > 0 ? "#4ADE80" : "#6B7280")
            .attr("opacity", d => d.hours > 0 ? 1 : 0.5);
            
        dots.attr("opacity", 0)
            .transition()
            .duration(500)
            .delay((d, i) => 1500 + i * 50)
            .attr("opacity", 1);
            
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
    
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        }
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };
    
    return (
        <motion.div 
            className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50 shadow-xl hover:shadow-green-500/5 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row items-start justify-between mb-6">
                <motion.h3 
                    className="text-xl font-semibold mb-4 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Your Listening Journey
                </motion.h3>
            </div>
            
            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div 
                    className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center shadow-lg transform transition-all duration-300 hover:shadow-green-500/10 hover:-translate-y-1"
                    variants={itemVariants}
                >
                    <div className="text-sm text-gray-300 mb-2">Total Listening Time</div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500">
                        {formatTime(data.total_minutes)}
                    </div>
                </motion.div>
                
                <motion.div 
                    className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center shadow-lg transform transition-all duration-300 hover:shadow-blue-500/10 hover:-translate-y-1"
                    variants={itemVariants}
                >
                    <div className="text-sm text-gray-300 mb-2">Total Tracks Played</div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
                        {data.total_tracks.toLocaleString()}
                    </div>
                </motion.div>
                
                <motion.div 
                    className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center shadow-lg transform transition-all duration-300 hover:shadow-purple-500/10 hover:-translate-y-1"
                    variants={itemVariants}
                >
                    <div className="text-sm text-gray-300 mb-2">Biggest Listening Day</div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        {formatDate(data.biggest_listening_day)}
                    </div>
                </motion.div>
            </motion.div>
            
            <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <h4 className="text-lg font-medium mb-4 text-center text-gray-200">
                    Monthly Listening Hours {hoveredMonth && <span className="text-green-400">• {hoveredMonth} Highlighted</span>}
                </h4>
                <div className="relative flex justify-center">
                    <svg ref={svgRef} width="100%" height="500" className="overflow-visible"></svg>
                    <div
                        ref={tooltipRef}
                        className="absolute bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-gray-700/50 pointer-events-none hidden z-50 transform -translate-x-1/2 -translate-y-full"
                        style={{ display: 'none' }}
                    ></div>
                </div>
            </motion.div>
            
            <div className="mt-6 text-sm text-gray-400 border-t border-gray-700/30 pt-4">
                <p>
                    This chart shows your listening activity over the past year. The radial visualization displays how many hours you spent listening to music each month. Larger circles indicate more listening time in that month. Hover over the dots to see detailed statistics.
                </p>
            </div>
        </motion.div>
    );
};

ListeningStreakSummary.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ListeningStreakSummary;