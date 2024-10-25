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
        
        const jurisdictionData = countCasesByJurisdiction(allData);
        createBarChart(jurisdictionData);
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

// Load the data when the script is executed
loadData();
