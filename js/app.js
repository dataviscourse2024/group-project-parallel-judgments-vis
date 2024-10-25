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
        
        const jurisdictionData = countCasesByJurisdiction(allData);
        createBarChart(jurisdictionData);
        createRadarChart(radarData);
    }).catch(function(error) {
        console.error('Error loading the data:', error);
    });
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
 * Function to count the number of cases per jurisdiction
 * @param {Array} data - The case data loaded from JSON files
 * @returns {Array} - Array of objects with jurisdiction name and case count
 */
function countCasesByJurisdiction(data) {
    // Use a Map to count occurrences of each jurisdiction
    const jurisdictionCount = d3.rollup(data, v => v.length, d => d.jurisdiction?.name);

    // Convert Map to an array of objects: [{ jurisdiction: 'Jurisdiction Name', count: N }, ...]
    return Array.from(jurisdictionCount, ([jurisdiction, count]) => ({ jurisdiction, count }));
}

/**
 * Function to create a bar chart showing the number of cases per jurisdiction
 * @param {Array} jurisdictionData - Array of objects with jurisdiction names and case counts
 */
function createBarChart(jurisdictionData) {
    const margin = { top: 40, right: 20, bottom: 60, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    const x = d3.scaleBand()
        .domain(jurisdictionData.map(d => d.jurisdiction))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(jurisdictionData, d => d.count)])
        .nice()
        .range([height, 0]);

    // Create the bars
    svg.selectAll(".bar")
        .data(jurisdictionData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.jurisdiction))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#69b3a2");

    // Add X axis
    svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));


    // Add chart title
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("class", "chart-title")  // Add this class
    .text("Number of Cases by Jurisdiction");
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

// Load the data when the script is executed
loadData();
