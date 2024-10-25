// Fetch the data from the JSON files
function loadData() {
    Promise.all([
        d3.json('data/0478-01.json'),
        d3.json('data/0742-01.json'),
        d3.json('data/0466-01.json'),
        d3.json('data/0296-01.json'),
        d3.json('data/0643-01.json'),
    ]).then(function(data) {
        // Consolidate the data from all JSON files
        let allData = [].concat(...data);
        
        // Call function to create table
        createTable(allData);  // Create the table

        // Process and normalize data for radar chart
        let radarData = processRadarData(allData);
        
        // Process data for parallel coordinates plot
        let parallelData = processParallelData(allData);
       
        createRadarChart(radarData);
        createParallelCoordinatesPlot(parallelData);
    }).catch(function(error) {
        console.error('Error loading the data:', error);
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
 * Function to create the table
 * @param {Array} data - The case data loaded from the JSON files
 */
function createTable(data) {
    // Define the columns (headers) for the table
    const columns = ['Case Name', 'Decision Date', 'Jurisdiction', 'Court', 'Citations', 'Cites To'];

    // Select the table area and append the table structure
    const table = d3.select("#table-area")
        .append("table");

    // Append the table headers (thead)
    const thead = table.append("thead");
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(d => d);  // Set header text

    // Append the table body (tbody)
    const tbody = table.append("tbody");

    // Append rows and cells with data for each row in the JSON
    data.forEach(row => {
        const tr = tbody.append("tr");

        // Case Name
        tr.append("td").text(row.name || 'N/A');  

        // Decision Date
        tr.append("td").text(row.decision_date || 'N/A');

        // Jurisdiction (Display short name, with full name as tooltip)
        tr.append("td").html(`<span title="${row.jurisdiction?.name_long || ''}">${row.jurisdiction?.name || 'N/A'}</span>`);

        // Court
        tr.append("td").text(row.court?.name || 'N/A');

        // Citations (List all citations, separated by line breaks)
        const citations = row.citations ? row.citations.map(c => c.cite).join("<br>") : 'N/A';
        tr.append("td").html(citations);

        // Cites To (List all 'Cites To' entries, with a limit to show the first few and scroll for the rest)
        const citesToList = row.cites_to || [];
        const limitedCitesTo = citesToList.slice(0, 3).map(c => c.cite).join("<br>");
        const fullCitesTo = citesToList.map(c => c.cite).join("<br>");
        tr.append("td").html(`<div style="max-height: 100px; overflow-y: auto;" title="${fullCitesTo}">${limitedCitesTo}${citesToList.length > 3 ? '... more' : ''}</div>`);
    });
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
            decision_year: (year - minYear) / (maxYear - minYear)
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

    // Create SVG container for radar chart
    const chartArea = d3.select("#radar-chart-area")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const axes = ['citations', 'cites_to', 'decision_year'];
    const numAxes = axes.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Scale for radius
    const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, 1]);

    // Draw grid circles (levels)
    const axisGrid = chartArea.append("g").attr("class", "axisWrapper");
    const levels = 5;
    for (let i = 0; i < levels; i++) {
        const r = (i + 1) / levels * radius;
        axisGrid.append("circle")
            .attr("r", r)
            .attr("fill", "none")
            .attr("stroke", "#CDCDCD")
            .attr("stroke-width", 0.5);
    }

    // Append each axis line and label
    const axis = axisGrid.selectAll(".axis")
        .data(axes)
        .enter()
        .append("g")
        .attr("class", "axis");

    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(1) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("stroke", "#CDCDCD")
        .attr("stroke-width", 1);

    axis.append("text")
        .attr("x", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("dy", "0.35em")
        .style("font-size", "10px")
        .attr("text-anchor", "middle")
        .text(d => d);

    // Radar line generator function
    const radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);

    // Format data for radar chart plotting
    const radarData = data.map(caseData => {
        return axes.map((axis, i) => {
            return { axis, value: caseData[axis] };
        });
    });

    // Draw radar chart for each case
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

    // Draw points on the radar chart
    chartArea.selectAll(".radarCircle")
        .data(radarData)
        .enter()
        .append("g")
        .selectAll(".radarCircle")
        .data(d => d)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("cx", d => rScale(d.value) * Math.cos(angleSlice * axes.indexOf(d.axis) - Math.PI / 2))
        .attr("cy", d => rScale(d.value) * Math.sin(angleSlice * axes.indexOf(d.axis) - Math.PI / 2))
        .style("fill", "orange")
        .style("fill-opacity", 0.8);
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

    // Line generator for each case
    function path(d) {
        return d3.line()(dimensions.map(p => [xScale(p), yScales[p](d[p])]));
    }

    // Draw lines for each case in the data
    svg.selectAll("myPath")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.7);

    // Draw the axes for each dimension
    dimensions.forEach(dimension => {
        svg.append("g")
            .attr("transform", `translate(${xScale(dimension)},0)`)
            .each(function(d) { d3.select(this).call(d3.axisLeft(yScales[dimension])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(dimension.replace(/_/g, " "))  // Replace underscores with spaces for labels
            .style("fill", "black");
    });
}


// Load the data when the script is executed
loadData();
