// Fetch the data from a JSON file or API
d3.json("data/cases.json").then(function(data) {
    // Call function to create the table
    createTable(data);

    // Call function to create the parallel coordinates plot
    createParallelCoordinatesPlot(data);
}).catch(function(error) {
    console.error('Error loading the data:', error);
});

/**
 * Function to create the table
 * @param {Array} data - The case data loaded from the JSON file
 */
function createTable(data) {
    // Define the columns (headers)
    const columns = ['Case', 'Case Duration (Months)', 'Legal Precedents Cited', 'Jurisdiction Complexity', 'Case Complexity'];

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
        const tr = tbody.append("tr");  // Create a row
        tr.append("td").text(row.case);  // Case column
        tr.append("td").text(row.duration);  // Case duration column
        tr.append("td").text(row.precedents);  // Legal precedents column
        tr.append("td").text(row.jurisdiction);  // Jurisdiction complexity column
        tr.append("td").text(row.complexity);  // Case complexity column
    });
}

/**
 * Function to create the parallel coordinates plot
 * @param {Array} data - The case data loaded from the JSON file
 */
function createParallelCoordinatesPlot(data) {
    // Define the dimensions for parallel coordinates
    const dimensions = ['duration', 'precedents', 'jurisdiction', 'complexity'];

    // Create an SVG element for the parallel coordinates plot
    const margin = { top: 30, right: 50, bottom: 10, left: 50 },
          width = 900 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#parallel-coordinates")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add a background rectangle (white) before the plot elements
    // svg.append("rect")
    //    .attr("width", width)
    //    .attr("height", height)
    //    .attr("fill", "white");

    // Define the scales for each dimension
    const yScales = {};
    dimensions.forEach(d => {
        yScales[d] = d3.scaleLinear()
                       .domain([d3.min(data, p => +p[d]), d3.max(data, p => +p[d])])
                       .range([height, 0]);
    });

    // Create an X scale for the dimensions
    const xScale = d3.scalePoint()
                     .domain(dimensions)
                     .range([0, width])
                     .padding(1);

    // Draw the lines for each case
    svg.selectAll("myPath")
       .data(data)
       .enter()
       .append("path")
       .attr("d", function(d) {
            return d3.line()(dimensions.map(dim => [xScale(dim), yScales[dim](d[dim])]));
       })
       .style("fill", "none")
       .style("stroke", "#69b3a2")
       .style("opacity", 0.7);

    // Add axes for each dimension
    dimensions.forEach(function(dim) {
        svg.append("g")
           .attr("transform", `translate(${xScale(dim)}, 0)`)
           .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yScales[dim])); })
           .append("text")
           .style("text-anchor", "middle")
           .attr("y", -9)
           .text(dim)
           .style("fill", "black");
    });
}
