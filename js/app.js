// Fetch the data from the JSON files
function loadData() {
    Promise.all([
        d3.json('data/0478-01.json'),
        d3.json('data/0742-01.json'),
        d3.json('data/0466-01.json'),
        d3.json('data/0296-01.json'),
        d3.json('data/0643-01.json'),
        d3.json('data/0089-01.json'),
        d3.json('data/0460-01.json'),
        d3.json('data/0482-01.json'),
        d3.json('data/0518-01.json'),
        d3.json('data/0556-01.json'),
        d3.json('data/1066-01.json'),
        d3.json('data/1226-01.json'),
    ]).then(function(data) {
        // Consolidate the data from all JSON files
        let allData = [].concat(...data);
        
        // Calculate min and max dates
        const minDate = d3.min(allData, d => new Date(d.decision_date));
        const maxDate = d3.max(allData, d => new Date(d.decision_date));

        // Initialize the date range slider
        const dateRangeSlider = document.getElementById('date-range-slider');

        // Initialize noUiSlider
        noUiSlider.create(dateRangeSlider, {
            start: [minDate.getFullYear(), maxDate.getFullYear()],
            connect: true,
            range: {
                min: minDate.getFullYear(),
                max: maxDate.getFullYear()
            },
            step: 1,
        });

        // Call function to create table
        createTable(allData);  // Create the table

        // Add event listener for date range slider
        dateRangeSlider.noUiSlider.on('update', function(values) {
            const selectedMinYear = parseInt(values[0]);
            const selectedMaxYear = parseInt(values[1]);
            document.getElementById('date-range-values').textContent = `${selectedMinYear} - ${selectedMaxYear}`;
            filterTableByDateRange(selectedMinYear, selectedMaxYear);
        });
        
        
    }).catch(function(error) {
        console.error('Error loading the data:', error);
    });
}

// Function to filter table by date range
function filterTableByDateRange(minYear, maxYear) {
    const rows = document.querySelectorAll('#table-area table tbody tr');
    rows.forEach(row => {
        const dateCell = row.querySelector('.col-date');
        if (dateCell) {
            const decisionDate = new Date(dateCell.textContent);
            const decisionYear = decisionDate.getFullYear();
            console.log(`Row date: ${decisionYear}, Min: ${minYear}, Max: ${maxYear}`);
            if (decisionYear >= minYear && decisionYear <= maxYear) {
                row.style.display = ''; // Show row
            } else {
                row.style.display = 'none'; // Hide row
            }
        }
    });
}

// Define jurisdiction levels mapping
const jurisdictionLevels = {
    "U.S.": 3,         // Federal level
    "Federal": 3,      // General federal designation
    "Minn.": 2,        // Minnesota (state level example)
    "Cal.": 2,         // California (state level example)
    "N.Y.": 2,         // New York (state level example)
    // Add more states or jurisdictions as needed
    "Local": 1,        // Placeholder for municipal/local levels
    "Municipal": 1
};

// Function to get jurisdiction level
function getJurisdictionLevel(jurisdiction) {
    const jurisdictionName = jurisdiction ? jurisdiction.name || jurisdiction.name_long : "Local";
    return jurisdictionLevels[jurisdictionName] || 1; // Default to 1 if jurisdiction not found
}

/**
 * Function to create the table with selection functionality
 * @param {Array} data - The case data loaded from the JSON files
 * @param {Function} onSelectionChange - Callback function to handle selection changes
 */
function createTable(data) {
    // Clear existing content
    d3.select("#table-area").selectAll("*").remove();

    // Column definitions
    const columns = [
        { id: 'select', header: 'Select', class: 'col-select' },
        { id: 'caseName', header: 'Case Name', class: 'col-case-name' },
        { id: 'docket', header: 'Docket Number', class: 'col-docket' },
        { id: 'date', header: 'Decision Date', class: 'col-date' },
        { id: 'court', header: 'Court', class: 'col-court' },
        { id: 'jurisdiction', header: 'Jurisdiction', class: 'col-jurisdiction' },
        { id: 'citations', header: 'Citations', class: 'col-citations' },
        { id: 'wordCount', header: 'Word Count', class: 'col-word-count' },
        { id: 'pageRange', header: 'Page Range', class: 'col-page-range' },
        { id: 'judges', header: 'Judges', class: 'col-judges' },
        { id: 'attorneys', header: 'Attorneys', class: 'col-attorneys' }
    ];

    // Create wrapper for horizontal scroll
    const wrapper = d3.select("#table-area")
        .append("div")
        .attr("class", "table-wrapper");

    // Create table container
    const tableContainer = wrapper.append("div")
        .attr("class", "table-container");

    // Create table
    const table = tableContainer.append("table");

    // Create header
    const thead = table.append("thead");
    const headerRow = thead.append("tr");

    // Add headers with classes for width control
    headerRow.selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .attr("class", d => d.class)
        .text(d => d.header);

    // Create table body
    const tbody = table.append("tbody");

    // Create rows
    const rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // Add cells with data
    // Checkbox column
    rows.append("td")
        .attr("class", "col-select")
        .append("input")
        .attr("type", "checkbox")
        .attr("class", "case-selector")
        .attr("value", (d, i) => i)
        .property("checked", (d, i) => i < 3)
        .on("change", updateVisualizations);

    // Case Name
    rows.append("td")
        .attr("class", "col-case-name")
        .append("div")
        .attr("class", "truncate")
        .attr("title", d => d.name_abbreviation || d.name)
        .text(d => d.name_abbreviation || d.name || 'N/A');

    // Docket Number
    rows.append("td")
        .attr("class", "col-docket")
        .append("div")
        .attr("class", "truncate")
        .text(d => d.docket_number || 'N/A');

    // Decision Date
    rows.append("td")
        .attr("class", "col-date")
        .text(d => d.decision_date || 'N/A');

    // Court
    rows.append("td")
        .attr("class", "col-court")
        .append("div")
        .attr("class", "truncate")
        .attr("title", d => d.court?.name || '')
        .text(d => d.court?.name_abbreviation || d.court?.name || 'N/A');

    // Jurisdiction
    rows.append("td")
        .attr("class", "col-jurisdiction")
        .append("div")
        .attr("class", "truncate")
        .attr("title", d => d.jurisdiction?.name_long || '')
        .text(d => d.jurisdiction?.name || 'N/A');

    // Citations
    rows.append("td")
        .attr("class", "col-citations")
        .append("div")
        .attr("class", "truncate")
        .attr("title", d => d.citations?.map(c => c.cite).join('\n'))
        .text(d => d.citations?.map(c => c.cite).join(", ") || 'N/A');

    // Word Count
    rows.append("td")
        .attr("class", "col-word-count")
        .text(d => d.analysis?.word_count?.toLocaleString() || 'N/A');

    // Page Range
    rows.append("td")
        .attr("class", "col-page-range")
        .text(d => d.first_page && d.last_page ? 
            `${d.first_page}-${d.last_page}` : 'N/A');

    // Judges
    rows.append("td")
        .attr("class", "col-judges")
        .append("div")
        .attr("class", "truncate")
        .attr("title", d => d.casebody?.judges?.join('\n'))
        .text(d => d.casebody?.judges?.join(", ") || 'N/A');

    // Attorneys
    rows.append("td")
        .attr("class", "col-attorneys")
        .append("div")
        .attr("class", "truncate")
        .attr("title", d => d.casebody?.attorneys?.join('\n'))
        .text(d => d.casebody?.attorneys?.join(", ") || 'N/A');

    // Update visualizations function remains the same
    function updateVisualizations() {
        const selectedIndices = Array.from(document.querySelectorAll('.case-selector:checked'))
            .map(checkbox => parseInt(checkbox.value));
        
        const selectedData = selectedIndices.map(i => data[i]);
        
        if (selectedData.length > 0) {
            createRadarChart(processRadarData(selectedData));
            createParallelCoordinatesPlot(processParallelData(selectedData));
            createSimilarityChart(selectedData);
        } else {
            // Clear the visualizations if no data is selected
            d3.select("#radar-chart-area").selectAll("*").remove();
            d3.select("#parallel-coordinates-area").selectAll("*").remove();
            d3.select("#similarity-chart-area").selectAll("*").remove();
        }
    }

    // Initial update with default selection
    updateVisualizations();
    
}
/**
 * Function to process and normalize data for the radar chart
 * @param {Array} data - Raw case data from JSON files
 * @returns {Array} - Processed and normalized data for radar chart
 */
function processRadarData(data) {
    // Calculate max values for normalization
    const maxCitations = d3.max(data, d => d.citations ? d.citations.length : 0);
    const maxCitesTo = d3.max(data, d => d.cites_to ? d.cites_to.length : 0);
    const minYear = d3.min(data, d => new Date(d.decision_date).getFullYear());
    const maxYear = d3.max(data, d => new Date(d.decision_date).getFullYear());

    // Normalize and structure data for radar chart
    return data.map(d => {
        const year = new Date(d.decision_date).getFullYear();
        return {
            name: d.name || 'Unknown Case',
            citations: (d.citations ? d.citations.length : 0) / maxCitations,
            cites_to: (d.cites_to ? d.cites_to.length : 0) / maxCitesTo,
            decision_year: (new Date().getFullYear() - year) / (new Date().getFullYear() - minYear) // Relative case age (older cases are higher)
        };
    });
}
/**
 * Function to create a radar chart with D3.js
 * @param {Array} data - Array of normalized data objects for radar chart
 */
function createRadarChart(data) {
    const width = 500;
    const height = 500;
    const margin = { top: 40, right: 80, bottom: 40, left: 80 };
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right);

    // Clear existing chart but retain the tooltip
    d3.select("#radar-chart-area").selectAll("svg").remove();

    // Create SVG container
    const chartArea = d3.select("#radar-chart-area")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const axes = [
        { id: 'citations', label: 'Citations' },
        { id: 'cites_to', label: 'Cites To' },
        { id: 'decision_year', label: 'Decision Year' }
    ];
    const angleSlice = (Math.PI * 2) / axes.length;

    // Create scales for each axis
    const scales = createScales(data, axes.map(a => a.id), radius);

    // Ensure the tooltip is persistent
    let tooltip = d3.select("#radar-chart-area .radar-tooltip");
    if (tooltip.empty()) {
        tooltip = createTooltip("#radar-chart-area", "radar-tooltip");
    }

    // Draw circular grid
    drawCircularGrid(chartArea, radius, 5);

    // Draw axes
    drawAxes(chartArea, axes, scales, radius, angleSlice, tooltip);

    // Draw radar areas
    drawRadarAreas(chartArea, data, axes.map(a => a.id), scales, angleSlice);

    // Draw radar circles
    drawRadarCircles(chartArea, data, axes.map(a => a.id), scales, angleSlice, tooltip);

    // Add a legend
    addLegend(chartArea, width, height);
}

function createScales(data, axes, radius) {
    const scales = {};
    axes.forEach(axis => {
        const values = data.map(d => d[axis]);
        scales[axis] = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([0, radius]);
    });
    return scales;
}

function createTooltip(container, className) {
    return d3.select(container)
        .append("div")
        .attr("class", className)
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "#fff")
        .style("padding", "8px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
}

function drawCircularGrid(chartArea, radius, levels) {
    const axisGrid = chartArea.append("g").attr("class", "axisWrapper");
    for (let j = 0; j < levels; j++) {
        const levelFactor = (j + 1) / levels;
        axisGrid.append("circle")
            .attr("r", radius * levelFactor)
            .attr("class", "gridCircle")
            .style("fill", "none")
            .style("stroke", "#CDCDCD")
            .style("stroke-width", "0.5");
    }
}

function drawAxes(chartArea, axes, scales, radius, angleSlice, tooltip) {
    const axis = chartArea.selectAll(".axis")
        .data(axes)
        .enter()
        .append("g")
        .attr("class", "axis");

    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "#CDCDCD")
        .style("stroke-width", "1px");

    axis.append("text")
        .attr("class", "legend")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", (d, i) => radius * 1.15 * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => radius * 1.15 * Math.sin(angleSlice * i - Math.PI / 2))
        .style("font-size", "12px")
        .style("fill", "#333")
        .text(d => d.label)
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(getDescription(d.id))
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

function drawRadarAreas(chartArea, data, axes, scales, angleSlice) {
    const radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .radius((d, i) => scales[axes[i]](d.value))
        .angle((d, i) => i * angleSlice);

    const radarData = data.map(d => axes.map(axis => ({ axis, value: d[axis], name: d.name })));

    chartArea.selectAll(".radarArea")
        .data(radarData)
        .enter()
        .append("path")
        .attr("class", "radarArea")
        .attr("d", radarLine)
        .style("fill", (d, i) => d3.schemeCategory10[i % 10])
        .style("fill-opacity", 0.5)
        .style("stroke", (d, i) => d3.schemeCategory10[i % 10])
        .style("stroke-width", 2);
}

function drawRadarCircles(chartArea, data, axes, scales, angleSlice, tooltip) {
    const radarData = data.map(d => axes.map(axis => ({ axis, value: d[axis], name: d.name }))).flat();

    chartArea.selectAll(".radarCircle")
        .data(radarData)
        .enter()
        .append("circle")
        .attr("class", "radarCircle")
        .attr("r", 4)
        .attr("cx", (d, i) => scales[d.axis](d.value) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => scales[d.axis](d.value) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("fill", "orange")
        .style("fill-opacity", 0.8)
        .style("stroke", "#888")
        .style("stroke-width", 2)
        .on("mouseover", function(event, d) {
            console.log("Tooltip Data:", d); // Debugging statement
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>Case:</strong> ${d.name}<br><strong>${d.axis}:</strong> ${d.value}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

function getDescription(axis) {
    const descriptions = {
        "citations": "Number of citations this case has received.",
        "cites_to": "Number of cases this case references.",
        "decision_year": "Year of the case normalized for comparison."
    };
    return descriptions[axis] || "No description available.";
}

function addLegend(chartArea, width, height) {
    const legend = chartArea.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width / 2 - 50}, ${height / 2 + 20})`);

    const legendData = [
        { color: d3.schemeCategory10[0], label: "Citations" },
        { color: d3.schemeCategory10[1], label: "Cites To" },
        { color: d3.schemeCategory10[2], label: "Decision Year" }
    ];

    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => d.color);

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 9)
        .text(d => d.label)
        .style("font-size", "12px")
        .style("fill", "#333");
}
/**
 * Process and structure data for the parallel coordinates plot
 * @param {Array} data - Raw case data from JSON files
 * @returns {Array} - Processed data with required attributes
 */
function processParallelData(data) {
    const maxOpinionLength = d3.max(data, d => d.casebody.opinions.reduce((acc, op) => acc + op.text.length, 0));

    const maxCiteRatio = d3.max(data, d => {
        const citesCount = d.cites_to ? d.cites_to.length : 0;
        return citesCount > 0 ? (d.citations ? d.citations.length : 1) / citesCount : 0;
    });

    // Normalize data for each metric
    return data.map(d => {
        const opinionLength = d.casebody.opinions.reduce((acc, op) => acc + op.text.length, 0);
        
        const citationsCount = d.citations ? d.citations.length : 0;
        const citesToCount = d.cites_to ? d.cites_to.length : 0;

        // Conditional cite ratio calculation to handle empty cites_to arrays
        const citeRatio = citesToCount > 0 ? citationsCount / citesToCount : 0;

        // Determine jurisdiction level using the existing function
        const jurisdictionLevel = getJurisdictionLevel(d.jurisdiction);

        return {
            name: d.name || 'Unknown Case',
            opinion_length: opinionLength / maxOpinionLength,
            cite_ratio: citeRatio / maxCiteRatio, // Normalized cite ratio
            jurisdiction_level: jurisdictionLevel / 3 // Normalize with max level as 3
        };
    });
}

/**
 * Function to create a parallel coordinates plot with D3.js
 * @param {Array} data - Array of structured data objects for parallel plot
 */
function createParallelCoordinatesPlot(data) {
    const margin = { top: 40, right: 50, bottom: 10, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear any existing SVG in the container to prevent duplicates
    d3.select("#parallel-coordinates-area").selectAll("svg").remove();

    // Extract the dimensions for the parallel plot
    const dimensions = ["opinion_length", "cite_ratio", "jurisdiction_level"];

    // Create scales for each dimension
    const yScales = {};
    dimensions.forEach(dimension => {
        yScales[dimension] = d3.scaleLinear()
            .domain([0, 1]) // Since data is normalized to [0, 1]
            .range([height, 0]);
    });

    // Create an x scale for spacing each dimension
    const xScale = d3.scalePoint()
        .domain(dimensions)
        .range([0, width])
        .padding(1);

    // Create the SVG container for the parallel coordinates plot
    const svg = d3.select("#parallel-coordinates-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    // Add a legend container
    // Add an info icon for the legend
    if (d3.select(".legend-tooltip-trigger").empty()) {
        d3.select("#parallel-coordinates-area")
            .append("div")
            .attr("class", "legend-tooltip-trigger")
            .html(`<span>ℹ️</span>`); // Add the info icon
    }

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "legend-tooltip")
    
    d3.select(".legend-tooltip-trigger")
        .on("mouseover", function (event) {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
                <strong>Legend:</strong><br>
                <span style="color: #69b3a2;">Lines</span>: Represent cases normalized across dimensions.<br>
                <strong>Axes:</strong> Opinion Length, Cite Ratio, Jurisdiction Level.<br>
                <em>Hover over a line for detailed values.</em>
            `)
                .style("left", `${event.pageX + 15}px`)
                .style("top", `${event.pageY + 15}px`);
        })
        .on("mouseout", function () {
            tooltip.transition().duration(500).style("opacity", 0);
        });
    

    // Line generator for each case
    function path(d) {
        return d3.line()(dimensions.map(p => [xScale(p), yScales[p](d[p])]));
    }

    // Draw lines for each case
    svg.selectAll("myPath")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "#69b3a2") // Default color
        .style("stroke-width", 4)
        .style("opacity", 0.3) // Default opacity
        .on("mouseover", function (event, d) {
            d3.selectAll("path").style("opacity", 0.1); // Dim all lines
            d3.select(this).style("opacity", 1); // Highlight the hovered line

            // Add dynamic labels for each axis
            dimensions.forEach(dim => {
                svg.append("text")
                    .attr("class", "hover-label")
                    .attr("x", xScale(dim))
                    .attr("y", yScales[dim](d[dim]) - 10) // Position above the line
                    .style("text-anchor", "middle")
                    .style("fill", "black")
                    .style("font-size", "12px")
                    .text(d[dim].toFixed(2)); // Display value rounded to 2 decimals
            });

            // Show tooltip with case details
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
                <strong>Case Name:</strong> ${d.name}<br>
                <strong>Opinion Length:</strong> ${d.opinion_length.toFixed(2)}<br>
                <strong>Cite Ratio:</strong> ${d.cite_ratio.toFixed(2)}<br>
                <strong>Jurisdiction Level:</strong> ${d.jurisdiction_level.toFixed(2)}
            `);
        })
        .on("mousemove", function (event) {
            // Position the tooltip dynamically near the cursor
            tooltip.style("left", `${event.pageX + 15}px`)
                   .style("top", `${event.pageY + 15}px`);
        })
        .on("mouseout", function () {
            d3.selectAll("path").style("opacity", 0.3); // Reset all lines
            d3.selectAll(".hover-label").remove(); // Remove the labels

            // Hide the tooltip
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Draw the axes for each dimension
    dimensions.forEach(dimension => {
        svg.append("g")
            .attr("transform", `translate(${xScale(dimension)},0)`)
            .each(function () { d3.select(this).call(d3.axisLeft(yScales[dimension])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -20)
            .text(dimension.replace(/_/g, " ")) // Replace underscores with spaces for labels
            .style("fill", "black");
    });
}

// Add after existing functions but before loadData()

function calculateEnhancedSimilarity(case1, case2) {
    // Primary weighting on citations (more meaningful)
    const weights = {
        citations: 0.7,      // 70% weight for shared citations
        timeProximity: 0.3   // 30% weight for temporal relevance
    };

    // Citation Similarity using Jaccard coefficient
    const citations1 = new Set(case1.cites_to?.map(cite => cite.cite) || []);
    const citations2 = new Set(case2.cites_to?.map(cite => cite.cite) || []);
    const sharedCitations = new Set([...citations1].filter(x => citations2.has(x)));
    
    // Calculate citation score
    const citationScore = citations1.size && citations2.size ? 
        sharedCitations.size / (citations1.size + citations2.size - sharedCitations.size) : 0;

    // Temporal Proximity (cases closer in time might be more relevant)
    const year1 = new Date(case1.decision_date).getFullYear();
    const year2 = new Date(case2.decision_date).getFullYear();
    const yearDiff = Math.abs(year1 - year2);
    // Score decreases over 30 years
    const timeScore = Math.max(0, 1 - yearDiff / 30);

    // Calculate weighted total
    const totalScore = (citationScore * weights.citations) + 
                      (timeScore * weights.timeProximity);

    // Additional information about shared citations
    const sharedCitationsList = [...sharedCitations];

    return {
        totalScore,
        components: {
            citationScore,
            timeScore
        },
        details: {
            totalSharedCitations: sharedCitationsList.length,
            case1Citations: citations1.size,
            case2Citations: citations2.size,
            sharedCitationsList: sharedCitationsList,
            yearDifference: yearDiff
        }
    };
}

function createDetailedTooltip(simData) {
    return `
        <div class="similarity-tooltip">
            <h4>${simData.case1} vs ${simData.case2}</h4>
            <div class="citation-details">
                <strong>Shared Citations:</strong> ${simData.details.totalSharedCitations}
                <br>
                <strong>Citation Overlap:</strong> ${(simData.components.citationScore * 100).toFixed(1)}%
                <br>
                <strong>Time Difference:</strong> ${simData.details.yearDifference} years
            </div>
            <div class="total-score">
                <strong>Overall Similarity:</strong> ${(simData.totalScore * 100).toFixed(1)}%
            </div>
        </div>
    `;
}

function createSimilarityChart(selectedData) {
    const weights = {
        citations: 0.7,      // 70% weight for shared citations
        timeProximity: 0.3   // 30% weight for temporal relevance
    };
    // Clear any existing chart
    d3.select("#similarity-chart-area").selectAll("*").remove();
    
    // Need at least 2 cases to compare
    if (selectedData.length < 2) {
        d3.select("#similarity-chart-area")
            .append("div")
            .attr("class", "alert")
            .style("text-align", "center")
            .style("padding", "20px")
            .text("Select 2 or more cases to compare similarities");
        return;
    }

    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 160, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate similarities between selected cases
    const similarities = [];
    for (let i = 0; i < selectedData.length; i++) {
        for (let j = i + 1; j < selectedData.length; j++) {
            const similarity = calculateEnhancedSimilarity(selectedData[i], selectedData[j]);
            similarities.push({
                pair: `${selectedData[i].name_abbreviation || 'Case ' + i} vs ${selectedData[j].name_abbreviation || 'Case ' + j}`,
                case1: selectedData[i].name_abbreviation || 'Case ' + i,
                case2: selectedData[j].name_abbreviation || 'Case ' + j,
                ...similarity
            });
        }
    }

    // Sort by total similarity score
    similarities.sort((a, b) => b.totalScore - a.totalScore);

    // Create scales
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

    const xScale = d3.scaleBand()
        .domain(similarities.map(d => d.pair))
        .range([0, innerWidth])
        .padding(0.3);

    // Create SVG
    const svg = d3.select("#similarity-chart-area")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Case Similarity Based on Shared Citations");

    // Add bars with segments
    similarities.forEach((sim, i) => {
        const barGroup = g.append("g")
            .attr("transform", `translate(${xScale(sim.pair)},0)`);
        
        // Citation score segment (bottom)
        barGroup.append("rect")
            .attr("class", "bar-segment citation")
            .attr("x", 0)
            .attr("y", yScale(sim.components.citationScore * weights.citations))
            .attr("width", xScale.bandwidth())
            .attr("height", innerHeight - yScale(sim.components.citationScore * weights.citations))
            .attr("fill", "#2196F3")
            .attr("opacity", 0.8);

        // Time proximity segment (top)
        barGroup.append("rect")
            .attr("class", "bar-segment time")
            .attr("x", 0)
            .attr("y", yScale(sim.totalScore))
            .attr("width", xScale.bandwidth())
            .attr("height", innerHeight - yScale(sim.components.timeScore * weights.timeProximity))
            .attr("fill", "#4CAF50")
            .attr("opacity", 0.4);
    });

    // Add tooltip
    const tooltip = d3.select("#similarity-chart-area")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Update hover effects for bar segments
    g.selectAll(".bar-segment")
        .on("mouseover", function(event, d) {
            const xPos = parseFloat(d3.select(this).attr("x"));
            const parentTransform = d3.select(this.parentNode).attr("transform");
            const translateX = parseFloat(parentTransform.match(/translate\(([^,]+)/)[1]);
            
            // Find corresponding similarity data
            const simData = similarities.find(s => Math.abs(xScale(s.pair) - translateX) < 1);
            
            if (simData) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(`
                    <div style="padding: 10px;">
                        <strong>${simData.case1}</strong> vs <strong>${simData.case2}</strong><br/><br/>
                        <strong>Similarity Components:</strong><br/>
                        Citation Similarity: ${(simData.components.citationScore * 100).toFixed(1)}%<br/>
                        Time Relevance: ${(simData.components.timeScore * 100).toFixed(1)}%<br/><br/>
                        <strong>Total Similarity:</strong> ${(simData.totalScore * 100).toFixed(1)}%
                    </div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add axes
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(10, "%"));

    // Add y-axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -innerHeight / 2)
        .attr("text-anchor", "middle")
        .text("Citation-based Similarity");

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

    [
        { label: "Citation Similarity", color: "#2196F3" },
        { label: "Time Relevance", color: "#4CAF50" }
    ].forEach((item, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
        
        g.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", item.color);
        
        g.append("text")
            .attr("x", 15)
            .attr("y", 9)
            .text(item.label);
    });
}

// Load the data when the script is executed
loadData();
