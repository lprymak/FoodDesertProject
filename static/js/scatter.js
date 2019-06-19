// SVG wrapper dimensions
var svgScatterWidth = 900;
var svgScatterHeight = 660;

var smargin = {
    top: 50,
    right: 60,
    bottom: 100,
    left: 120
};

var sheight = svgScatterHeight - smargin.top - smargin.bottom;
var swidth = svgScatterWidth - smargin.left - smargin.right;

// Creates an svg wrapper, appends an svg group that will hold our chart
var svgScatter = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgScatterWidth)
    .attr("height", svgScatterHeight)
    .style("background-color", " rgb(37, 37, 37)");

// Creates empty rect to use as a clear button if clicked
svgScatter.append('rect').style('width', '100%').style('height', '100%').attr('fill', 'rgb(37, 37, 37)').classed('scatterBack', true);

// Appends an SVG group
var sChartGroup = svgScatter.append("g")
    .attr("transform", `translate(${smargin.left}, ${smargin.top})`);

// Defines active labels for initial graph
var chosenXAxis = "plow_access";
var chosenYAxis = "gini";
var chosenYear = "2015";

// Creates dictionary of labels and label text
var labelValues = {
    "plow_access": "Low Food Access (%):", "gini": "Gini Index (Inequality):",
    "poverty": "Poverty Rate (%):", "age": "Median Age:",
    "income": "Household Income:", "home": "Home Value:", "low_access": "Low Food Access Total:",
    "pop": "Population (2015):"
};
// Creates dictionary to match years with array location in dataset
var yrs = { '2015': 0, '2014': 1, '2013': 2, '2012': 3, '2011': 4, '2010': 5 };

// Function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // Creates and returns x scale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis][0] * 1.8),
        d3.max(censusData, d => d[chosenXAxis][0] * 1.1)
        ])
        .range([0.5, swidth]);

    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis, chosenYear) {
    // Creates and returns y scale
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis][yrs[chosenYear]] * 0.9),
        d3.max(censusData, d => d[chosenYAxis][yrs[chosenYear]] * 1.1)
        ])
        .range([sheight, 0]);

    return yLinearScale;
}

// Function used for updating year var upon choice
function yrScale(censusData, chosenYAxis, chosenYear) {
    // Creates and returns year scale
    var yearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis][yrs[chosenYear]]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis][yrs[chosenYear]] * 0.8)
        ])
        .range([0, swidth]);

    return yearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circleGroup, newXScale, chosenXAxis, newYScale, chosenYAxis, censusData, chosenYear, data, scale) {

    // Transitions circles
    circleGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis][0]))
        .attr("cy", d => newYScale(d[chosenYAxis][yrs[chosenYear]]));

    // Updates tooltips with new info
    rollOver(circleGroup, chosenXAxis, chosenYAxis, censusData, chosenYear, data);

    return circleGroup;
}

// Function to update tooltips on mouseover
function rollOver(circleGroup, chosenXAxis, chosenYAxis, censusData, chosenYear, data) {

    xlabel = labelValues[chosenXAxis];
    ylabel = labelValues[chosenYAxis];

    clickChange(circleGroup, data);

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([90, 65])
        .html(function (d) {
            return (`${d.county[0]}, ${d.state[0]}<br>${xlabel} ${d[chosenXAxis][yrs[chosenYear]]}<br>${ylabel} ${d[chosenYAxis][yrs[chosenYear]]}`);
        });

    circleGroup.call(toolTip);

    circleGroup.on("mouseover", function (labels) {
        toolTip.show(labels, this);
    })
        .on("mouseout", function (labels) {
            toolTip.hide(labels);
        });
}

// Function to change the opacity when a circle is clicked on
function clickChange(circleGroup, data) {
    // Clears table, county name, resets colors and opacity
    function clearSummary() {
        d3.select('#summary').html("");
        d3.select('#ctName').html("");
        circleGroup.classed('allunselected', true).classed('selected', false).classed('unselected', false);
        d3.selectAll('.counties').style('stroke', 'transparent');
        chooseText();
    }

    // Resets scatter plot colors and opacity when background clicked
    d3.selectAll('.scatterBack').on('click', function () {
        // Resets fills and opacities to all circles
        clearSummary();
    })

    circleGroup.on('click', function () {

        var className = d3.select(this).nodes()[0].classList[1];
        var tract = +d3.select(this).nodes()[0].__data__.id[0];

        // If none selected, change classes to selected and unselected for appropriate circles
        if (className === "allunselected") {
            clearSummary();
            circleGroup
                .classed('allunselected', false).classed('selected', false).classed('unselected', true);

            d3.select(this)
                .classed('allunselected', false).classed('selected', true).classed('unselected', false)
                .raise();
            d3.select('#summary').html("");
            findChosenCounty(tract, data);
        }
        // If one selected already
        else if (className === "unselected") {
            // If one circle selected and click on different circle, 
            // change opacities and fills of respective circles
            clearSummary();
            circleGroup
                .classed('allunselected', false).classed('selected', false).classed('unselected', true);

            d3.select('#ctName').html("");
            d3.select('#summary').html("");

            findChosenCounty(tract, data);
            d3.select(this)
                .classed('allunselected', false).classed('selected', true).classed('unselected', false).raise();
        }
        // If one circle selected and click on same circle, reset fills and opacities
        else {
            clearSummary();
        }
        // Prevents from propagating to the parent svg event
        d3.event.stopPropagation();
    })
}

// Function to match chosen circle with corresponding county on map
function findChosenCounty(id, data) {
    // Selects all counties as data to be filtered
    var paths = d3.select("#map").selectAll(".counties");
    var chosenCounty = "";

    // For each path, if county tract from circle matches id from path, 
    // change stroke color of county on map, add table
    paths.nodes().forEach(county => {
        var tract = +county.__data__.id;
        if (tract === +id) {

            d3.selectAll('.counties').style('stroke', 'transparent');
            d3.select(county).style('stroke', 'white');
            var color = d3.select(county).nodes()[0].style.fill;

            drawTable(data, id);

            d3.select('#ctName').html("");
            d3.select('#ctName').append('h4').html(`${data[+id].county}, ${data[+id].state}`)
                .classed('align-self-center', true)
                .style('color', color);
        }
    })

    return chosenCounty;
}

// Function setting label to inactive
function inactiveLabel(label) {
    d3.select(`.${label}`).classed("active", false).classed("inactive", true);
}

// Function setting label to active
function activeLabel(label) {
    d3.select(`.${label}`).classed("active", true).classed("inactive", false);
}

function rolloverLabel() {
    d3.select('#scatter').append('p').style('float', 'right').style('font-size', '12px').html('*Rollover marker for county info');
    d3.select('#scatter').append('p').style('float', 'right').style('font-size', '12px').html('*Select marker for county summary above and to see location on map');
}

// Creates scatter plot
function createScatter(data) {

    // Creates scale
    var scale2 = d3.scaleSqrt()
        .domain([d3.min(data, d => (d.plow_access[0])), d3.max(data, d => (d.plow_access[0]))])
        .range(['#0000ff', '#FF0000']);

    // console.log(data);
    countyData = Object.values(data);

    // Sets initial active axis labels
    var chosenXAxis = "plow_access";
    var chosenYAxis = "gini";
    var chosenYear = "2015";

    // Creates x scale function
    var xLinearScale = xScale(countyData, chosenXAxis);

    // Creates y scale function
    var yLinearScale = yScale(countyData, chosenYAxis, chosenYear);

    // Adds main circles - main color
    var circleGroup = sChartGroup.selectAll("circle")
        .data(countyData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis][0]))
        .attr("cy", d => yLinearScale(d[chosenYAxis][yrs[chosenYear]]))
        .attr("r", 6)
        .style("stroke", "rgb(37, 37, 37)")
        .classed("stateCircle", true)
        .classed("allunselected", true)
        .classed("selected", false)
        .classed("unselected", false);

    // Calls initial rollover tooltips
    rollOver(circleGroup, chosenXAxis, chosenYAxis, countyData, chosenYear, data);

    // Creates initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Appends x axis
    var xAxis = sChartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${sheight})`)
        .call(bottomAxis);

    // Appends y axis
    var yAxis = sChartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Createa group for  2 x- axis labels
    var labelsGroup = sChartGroup.append("g")

    // Creates x axis labels
    var xValues = [{ 'value': 'plow_access', 'text': 'Low Food Access (%)' }, { 'value': 'low_access', 'text': 'Low Food Access Total' }];
    xValues.map((entry, i) => {
        labelsGroup.append("text")
            .attr("transform", `translate(${swidth / 2}, ${sheight})`)
            .attr("x", 0)
            .attr("y", (20 * i) + 40)
            .attr("value", entry.value) // value to grab for event listener
            .classed("inactive", true)
            .classed(entry.value, true)
            .text(entry.text);
    })

    // Creates y axis labels
    var yValues = [{ 'value': 'gini', 'text': 'Estimated Gini Index' },
    { 'value': 'poverty', 'text': 'Poverty Rate (%)' },
    { 'value': 'income', 'text': 'Income Per Capita' },
    { 'value': "age", 'text': "Median Age" },
    { 'value': 'pop', 'text': 'Population' }
    ];
    yValues.map((entry, i) => {
        labelsGroup.append('text')
            .attr("transform", `translate(${0}, ${sheight / 2})`)
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - sheight / 2)
            .attr("y", (i * -15) - 45)
            .attr("value", entry.value) // value to grab for event listener
            .classed("inactive", true)
            .classed(entry.value, true)
            .text(entry.text);
    })

    // Sets current chosen axis labels to active
    activeLabel(chosenXAxis);
    activeLabel(chosenYAxis);

    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function () {

        // Gets value of selection
        var value = d3.select(this).attr("value");

        // If change in y axis
        if (value === "poverty" || value === "gini" || value === "income" || value === 'age' || value === 'pop') {
            if (value !== chosenYAxis) {

                // Replaces chosenYaxis with value
                chosenYAxis = value;

                // Updates y scale for new data
                yLinearScale = yScale(countyData, chosenYAxis, chosenYear);

                // Updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Updates circles with new y values
                circleGroup = renderCircles(circleGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis, countyData, chosenYear, data, scale2);

                // Changes classes to change bold text
                Object.keys(labelValues).map(key => {
                    inactiveLabel(key);
                })
                activeLabel(value);
                activeLabel(chosenXAxis);
            }
        }
        // // If change in x axis
        else {
            if (value !== chosenXAxis) {

                // Replaces chosenXaxis with value
                chosenXAxis = value;

                // Updates x scale for new data
                xLinearScale = xScale(countyData, chosenXAxis);

                // Updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Updates circles with new x values
                circleGroup = renderCircles(circleGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis, countyData, chosenYear, data, scale2);

                // Changes classes to change bold text
                Object.keys(labelValues).map(key => {
                    inactiveLabel(key);
                })
                activeLabel(value);
                activeLabel(chosenYAxis);
            };
        };
    })
}