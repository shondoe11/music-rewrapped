import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

const timeFrameMapping = [
  { label: 'Last 4 Weeks', value: 'short_term' },
  { label: 'Last 6 Months', value: 'medium_term' },
  { label: 'All Time', value: 'long_term' }
];

const FavoriteGenresEvolution = ({ userId }) => {
  const [data, setData] = useState([]);
  const [topGenres, setTopGenres] = useState([]); //~ new state to store union of top genres
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!userId) return;
    Promise.all(
      timeFrameMapping.map(tf =>
        fetch(`${import.meta.env.VITE_BASE_URL}/spotify/top-artists?user_id=${userId}&time_frame=${tf.value}&limit=50`, { credentials: 'include' })
          .then(res => res.json())
          .then(result => {
            const genreData = {}; //~ { genre: { count, totalRank, uniqueArtists: Set } }
            result.artists.forEach((artist, idx) => {
              if (artist.genres && artist.genres.length > 0) {
                artist.genres.forEach(g => {
                  if (!genreData[g]) {
                    genreData[g] = { count: 0, totalRank: 0, uniqueArtists: new Set() };
                  }
                  genreData[g].count += 1;
                  genreData[g].totalRank += (idx + 1);
                  genreData[g].uniqueArtists.add(artist.id || artist.name);
                });
              }
            });
            //& output object including counts + extra info (store under prefixed key)
            const output = { timeFrame: tf.label };
            Object.entries(genreData).forEach(([genre, obj]) => {
              output[genre] = obj.count;
              output[`_${genre}`] = {
                avgRank: obj.count ? obj.totalRank / obj.count : 0,
                numArtists: obj.uniqueArtists.size
              };
            });
            return output;
          })
      )
    )
      .then(results => {
        //& compute global counts to determine overall top 10 genres
        let globalGenreCounts = {};
        results.forEach(obj => {
          Object.entries(obj).forEach(([key, value]) => {
            if (key !== 'timeFrame' && !key.startsWith('_')) {
              globalGenreCounts[key] = (globalGenreCounts[key] || 0) + value;
            }
          });
        });
        const top10Genres = Object.entries(globalGenreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(entry => entry[0]);
        setTopGenres(top10Genres); //~ store union of top genres
        //& result filtering: include only top genres + extra info.
        const filteredResults = results.map(obj => {
          const newObj = { timeFrame: obj.timeFrame };
          top10Genres.forEach(genre => {
            newObj[genre] = obj[genre] || 0;
            newObj[`_${genre}`] = obj[`_${genre}`] || { avgRank: 0, numArtists: 0 };
          });
          return newObj;
        });
        setData(filteredResults);
      })
      .catch(err => {
        console.error("Failed to fetch favorite genres evolution data:", err);
      });
  }, [userId]);

  useEffect(() => {
    if (data.length === 0 || topGenres.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    //& margin and dimension adjustments for responsiveness
    const margin = { top: 20, right: 50, bottom: 120, left: 65 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    //& use topGenres state for keys so that all 10 items show in the legend
    const keys = topGenres;

    //& stack layout with wiggle offset for streamgraph effect
    const stack = d3.stack().keys(keys).order(d3.stackOrderNone).offset(d3.stackOffsetWiggle);
    const series = stack(data);

    //& X scale using time frame labels with minimal padding to stretch fully
    const x = d3.scalePoint()
      .domain(data.map(d => d.timeFrame))
      .range([0, width])
      .padding(0.1);

    const yMin = d3.min(series, layer => d3.min(layer, d => d[0]));
    const yMax = d3.max(series, layer => d3.max(layer, d => d[1]));
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    //& color scale for genres
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);

    //& area generator for streamgraph with curved interpolation (using catmull rom for better curves)
    const area = d3.area()
      .x((d, i) => x(data[i].timeFrame))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveCatmullRom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    //& draw layers with tooltip interactivity
    g.selectAll(".layer")
      .data(series)
      .enter().append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", d => color(d.key))
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        const datum = d[0].data;
        const genreValue = datum[d.key];
        const total = keys.reduce((acc, key) => acc + (datum[key] || 0), 0);
        const percentage = total ? ((genreValue / total) * 100).toFixed(1) : 0;
        const extra = datum[`_${d.key}`];
        d3.select(tooltipRef.current)
          .style("display", "block")
          .style("background", "rgba(0, 0, 0, 0.7)")
          .html(`<strong>Genre:</strong> ${d.key}<br/><strong>% Contribution:</strong> ${percentage}%<br/><strong># of Artists:</strong> ${extra.numArtists}<br/><strong>Avg Rank:</strong> ${extra.avgRank.toFixed(1)}`);
      })
      .on("mousemove", function(event) {
        d3.select(tooltipRef.current)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(tooltipRef.current).style("display", "none");
      });

    //& x-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(10))
      .selectAll("text")
      .style("font-size", "18px")
      .style("fill", "#fff");

    //& y-axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    yAxis.selectAll("text")
      .style("font-size", "18px")
      .style("fill", "#fff");
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Genre count");

    //& legend positioned below the chart in two rows if needed.
    const legendAreaWidth = width;
    const legendItemWidth = 150;
    const itemsPerRow = Math.floor(legendAreaWidth / legendItemWidth) || 1;
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${height + margin.top + 60})`);

    keys.forEach((key, i) => {
      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);
      legend.append("circle")
        .attr("cx", col * legendItemWidth + 9)
        .attr("cy", row * 30 + 9)
        .attr("r", 9)
        .attr("fill", color(key));
      legend.append("text")
        .attr("x", col * legendItemWidth + 22)
        .attr("y", row * 30 + 14)
        .style("font-size", "18px")
        .style("fill", "#fff")
        .text(key);
    });
  }, [data, topGenres]);

  return (
    <div className='mt-4'>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg ref={svgRef} viewBox="0 0 900 400" preserveAspectRatio="xMidYMid meet"></svg>
      </div>
      <div ref={tooltipRef} style={{ position: 'absolute', display: 'none' }}></div>
    </div>
  );
};

export default FavoriteGenresEvolution;
