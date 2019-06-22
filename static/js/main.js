// SELECT CensusTract as tract, County as county, State as state, Population_17 as pop_17, Population_16 as pop_16, Population_15 as pop_15, Population_14 as pop_14, Population_13 as pop_13, Population_12 as pop_12, Population_11 as pop_11, Population_10 as pop_10, `Median Age_17` as age_17, `Median Age_16` as age_16, `Median Age_15` as age_15, `Median Age_14` as age_14, `Median Age_13` as age_13, `Median Age_12` as age_12, `Median Age_11` as age_11, `Median Age_10` as age_10, `Estimate Gini Index_17` as gini_17, `Estimate Gini Index_16` as gini_16, `Estimate Gini Index_15` as gini_15, `Estimate Gini Index_14` as gini_14, `Estimate Gini Index_13` as gini_13, `Estimate Gini Index_12` as gini_12, `Estimate Gini Index_11` as gini_11, `Estimate Gini Index_10` as gini_10, `Poverty Rate_17` as povert_17, `Poverty Rate_16` as povert_16, `Poverty Rate_15` as povert_15, `Poverty Rate_14` as povert_14, `Poverty Rate_13` as povert_13, `Poverty Rate_12` as povert_12, `Poverty Rate_11` as povert_11, `Poverty Rate_10` as povert_10, `Commutes with Vehicle_17` as vehicle_17, `Commutes with Vehicle_16` as vehicle_16, `Commutes with Vehicle_15` as vehicle_15, `Commutes with Vehicle_14` as vehicle_14, `Commutes with Vehicle_13` as vehicle_13, `Commutes with Vehicle_12` as vehicle_12, `Commutes with Vehicle_11` as vehicle_11, `Commutes with Vehicle_10` as vehicle_10, `Per Capita Income_17` as income_17, `Per Capita Income_16` as income_16, `Per Capita Income_15` as income_15, `Per Capita Income_14` as income_14, `Per Capita Income_13` as income_13, `Per Capita Income_12` as income_12, `Per Capita Income_11` as income_11, `Per Capita Income_10` as income_10, `Median Home Value_17` as home_17, `Median Home Value_16` as home_16, `Median Home Value_15` as home_15, `Median Home Value_14` as home_14, `Median Home Value_13` as home_13, `Median Home Value_12` as home_12, `Median Home Value_11` as home_11, `Median Home Value_10` as home_10 FROM census_tract_coords_2017_10;

// SVG wrapper dimensions
var svgWidth = 960;
var svgHeight = 660;
var vsvgWidth = 300;
var vsvgHeight = 300;

// Sets margins for map svg
var margin = {
    top: 50,
    right: 60,
    bottom: 100,
    left: 220
};

// Sets map svg width, height
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Creates an SVG wrapper, appends an SVG group that will hold our chart
var svg = d3
    .select("#map")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

svg.append('rect').style('width', '100%').style('height', '100%').attr('fill', 'rgb(37,37,37)').classed('chartBack', true);

// Creates path for geojson
var path = d3.geoPath();

// Finds and returns low_access/population value
function findDesert(data, id) {
    // Define empty value variable
    var value = '';
    // Loop through to find matching county id and tract number
    data.forEach(county => {
        if (county.CensusTract === +id) {
            // Save low_access/population value
            value = +county["FD_vs_POP(lapop1_10)"];
        }
    })
    return value;
}

// Finds low and returns low_access percentage
function findDesert2(data, id) {
    var value = '';
    if (data[id]) {
        var value = data[id].plow_access[0]
    }
    return value;
}

// Uses defined scale and low access number to return fill color
function fillColor(scale, plow_access) {
    // If there is a low access number associated with county
    if (plow_access) {
        return scale(plow_access);
    }
    // If there is no low_access number associated with county
    else {
        return 'rgb(65, 64, 64)'
    }
}

// Function to create packed bubble chart by poplation
function choosePackedBubbles(data, scale) {

    // var chosenText = "Population";
    var btns = d3.selectAll('.bubblebtn');
    bubblePackChoice(data, scale, "Population");

    btns.on("click", function () {

        d3.selectAll('.d3-tip_bubble').remove();
        var drdnText = d3.select(".bubblebtngr").text();
        chosenText = d3.select(this).text();

        if (chosenText != drdnText) {

            // d3.selectAll('.d3-tip .n').remove();

            d3.select("#bubbles").html("");

            d3.select(".bubblebtngr").html(chosenText);
            d3.select(this).classed('inactiveDropDown', true).classed('activeDropDown', false);

            bubblePackChoice(data, scale, chosenText);
            var u = d3.select('#bubbles').select('svg')
                .selectAll('circle')
                .attr('pointer-events', 'fill');
        }

        btns.nodes().forEach((button, i) => {
            var text = d3.select(button).text();
            if (text === drdnText) {
                d3.select(button).classed('inactiveDropDown', false).classed('activeDropDown', true);
            }
        })
    });
}

// Function to create packed bubble chart by low_access percentage
function bubblePackChoice(countyData, scale, chosenText) {
    var labels = {
        "Population": "pop", "Density": "pop_den", "Poverty Rate (%)": "poverty",
        "Estimated Gini Index": "gini", "Median Age": "age", "Per Capita Income": "pcincome",
        "Home Value": "home", "Household Income": "income"
    };

    var topic = labels[chosenText];

    // Filters dataset with best and worst low_access percentages
    var sortedValues = Object.values(countyData).sort(function (a, b) { return (b.plow_access[0]) - (a.plow_access[0]); });
    extremes = [];

    // Saves data and index for worst counties
    for (var i = 0; i < 75; i++) {
        extremes.push([sortedValues[i], i + 1]);
    }
    // Saves data and index for best counties
    for (var i = sortedValues.length - 1; i > (sortedValues.length - 75); i--) {
        extremes.push([sortedValues[i], i + 1]);
    }

    var Pscale = scales(countyData, topic);

    // Height, width for packed bubble plot
    var width = 650, height = 550;

    // Data to bind with bubbles
    var laccess = [];
    Object.values(extremes).forEach((county, i) => {

        var color = scale(county[0].plow_access[0]);

        // Creates data to bind
        laccess.push({
            'size': Pscale(+county[0][topic][0]), 'id': county[0].id[0], 'den': (+county[0].pop_den[0]).toFixed(2),
            'la': (+county[0].low_access[0]).toFixed(0), 'pla': (+county[0].plow_access[0]).toFixed(2), 'home': (+county[0].home[0]).toFixed(0),
            'fill': scale(county[0].plow_access[0]), 'county': county[0].county[0], 'inc': (+county[0].pcincome[0]).toFixed(0),
            'state': county[0].state[0], 'pop': (+county[0].pop[0]).toFixed(0), 'name': county[0].name[0], 'rank': county[1],
            'gini': (+county[0].gini[0]).toFixed(2), 'age': (+county[0].age[0]).toFixed(2), 'pov': (+county[0].poverty[0]).toFixed(2),
            'income': (+county[0].income[0]).toFixed(0)
        });
    })

    // Defines nodes for bubbles and binds data
    var nodes = laccess.map(function (d) {
        return {
            radius: d.size, id: d.id, la: d.la, pla: d.pla, fill: d.fill, county: d.county,
            state: d.state, pop: d.pop, name: d.name, rank: d.rank, pop_den: d.den, pcincome: d.inc, home: d.home,
            age: d.age, gini: d.gini, poverty: d.pov, income: d.income
        }
    });

    // Defines svg element
    var bsvg = d3.select("#bubbles").append("svg")
        .attr("width", 600)
        .attr("height", 550)
        .attr("class", "bubble");

    // Creates force simulation to create bubble layout
    var simulation = d3.forceSimulation(nodes)
        .alpha(0.5)
        .force('charge', d3.forceManyBody().strength(10))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(function (d) {
            return d.radius
        }))
        .on('tick', ticked);

    // Speeds the simulation
    simulation.alphaDecay(0.1);

    // Function to initalize bubbles and simulation
    function ticked() {
        var u = d3.select('#bubbles').select('svg')
            .selectAll('circle')
            .data(nodes);

        // Creates bubbles
        u.enter()
            .append('circle')
            .classed('bubble', true)
            .attr('r', function (d) {
                return d.radius
            })
            .merge(u)
            .attr('cx', function (d) {
                return d.x
            })
            .attr('cy', function (d) {
                return d.y
            })
            .style('fill', function (d) {
                return d.fill
            })
            .style('fill-opacity', 0.9);

        u.exit().remove();

        bubblePlotHoverChoice(u, chosenText, topic);
    }
    drawColorScale2(bsvg);
}

// Creates scales to use for different data
function scales(data, topic) {

    var scales = {
        "age": d3.scaleLinear()
            .domain([d3.min([d3.min(Object.values(data), d => +d.age[0])]),
            d3.max([d3.max(Object.values(data), d => +d.age[0])])])
            .range([5, 40]),
        "pcincome": d3.scaleLinear()
            .domain([d3.min([d3.min(Object.values(data), d => +d.pcincome[0])]),
            d3.max([d3.max(Object.values(data), d => +d.pcincome[0])])])
            .range([8, 45]),
        "gini": d3.scaleLinear()
            .domain([d3.min([d3.min(Object.values(data), d => +d.gini[0])]),
            d3.max([d3.max(Object.values(data), d => +d.gini[0])])])
            .range([5, 40]),
        "pop": d3.scaleSqrt()
            .domain([d3.min([d3.min(Object.values(data), d => +d.pop[0])]),
            d3.max([d3.max(Object.values(data), d => +d.pop[0])])])
            .range([14, 95]),
        'pop_den': d3.scaleSqrt()
            .domain([d3.min([d3.min(Object.values(data), d => +d.pop_den)]),
            d3.max([d3.max(Object.values(data), d => +d.pop_den)])])
            .range([15, 60]),
        'home': d3.scaleLinear()
            .domain([d3.min([d3.min(Object.values(data), d => +d.home[0])]),
            d3.max([d3.max(Object.values(data), d => +d.home[0])])])
            .range([10, 50]),
        'income': d3.scaleLinear()
            .domain([d3.min([d3.min(Object.values(data), d => +d.income[0])]),
            d3.max([d3.max(Object.values(data), d => +d.income[0])])])
            .range([10, 50])
    };

    scale = scales[topic];

    return scale;
}

// Function to display tooltips on map hover
function stateHover(objs, data, scale) {
    var selectedCounty = '';

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([90, 65])
        .html(function (d) {
            var formId = +d.id;
            return (`${data[formId].county}, ${data[formId].state}<br>${(data[formId].low_access / data[formId].pop[0] * 100).toFixed(2)}% Low Food Access`);
        });

    objs.call(toolTip);

    // County click event
    objs.on("mouseover", function (labels) {

        // If fill does not equal gray, show tooltip on mouseover - hide on mouseoout
        var color = d3.select(this).nodes()[0].style.fill;
        if (color !== "rgb(65, 64, 64)") {
            toolTip.show(labels, this);
            d3.select(this).style("stroke", "white").raise();
        }
    })
        .on("mouseout", function (labels) {
            toolTip.hide(labels);

            if (d3.select(this).nodes()[0].classList[1] != 'selectedCounty') {
                d3.select(this).style("stroke", "transparent");
            }
            // If clicked on, create summary table, highlight corresponding circle in scatter plot
        }).on("click", function () {
            var color = d3.select(this).nodes()[0].style.fill;
            var circles = d3.select('#Scatter').selectAll('circle');
            // console.log(scale);
            d3.selectAll('.counties').classed('selectedCounty', false).classed('unselectedCounty', true);
            d3.selectAll('.counties').style('stroke', 'transparent');
            d3.select(this).style("stroke", "white").raise();

            d3.select('#summary').html("");

            if (color !== "rgb(65, 64, 64)") {
                var id = +d3.select(this).nodes()[0].__data__.id;
                d3.select(this).classed('selectedCounty', true).classed('unselectedCounty', false);

                // 
                d3.select('#summary').html("");
                d3.select('#ctName').html("");
                d3.select('#ctName').append('h4').html(`${data[id].county}, ${data[id].state}`)
                    .classed('align-self-center', true)
                    .style('color', color);

                drawTable(data, id);

                circles
                    .classed('allunselected', false).classed('selected', false).classed('unselected', true);

                var chosencircle = findChosenCircle(id);
                d3.select(chosencircle)
                    .classed('allunselected', false)
                    .classed('selected', true).classed('unselected', false).raise();

                d3.event.stopPropagation();
            }

            // If clicked county has gray fill, clear all
            else {
                d3.select('#map').selectAll('.counties').classed('selectedCounty', false).classed('unselectedCounty', true);
                d3.select('#summary').html("");
                d3.select('#ctName').html("");
                circles
                    .classed('allunselected', true).classed('selected', false).classed('unselected', false);
                d3.selectAll('.counties').classed('selectedCounty', false).classed('unselectedCounty', true);
                d3.selectAll('.counties').style('stroke', 'transparent');
                chooseText();
            }
        });

    // When clicking on background
    d3.select('.chartBack').on('click', function () {
        // Resets scatter circles
        var circles = d3.select('#Scatter').selectAll('circle');
        circles
            .classed('allunselected', true).classed('selected', false).classed('unselected', false);
        d3.selectAll('.counties').classed('selectedCounty', false).classed('unselectedCounty', true);
        d3.selectAll('.counties').style('stroke', 'transparent');

        // Clears table and county name
        d3.select('#summary').html("");
        d3.select('#ctName').html("");
        chooseText();
    })
}

// Function to call tooltips on dynamic packed bubble hover
function bubblePlotHoverChoice(objs, choice, value) {

    objs.attr('pointer-events', 'none');
    setTimeout(function () {
        objs.attr('pointer-events', 'auto');
    }, 1800);

    var toolTip = d3.tip()
        .attr("class", "d3-tip_bubble")
        .offset([-10, -95])
        .html(function (d) {
            return (`${d.county}, ${d.state}<br>Low Access: ${d.pla}%<br>${choice}: ${d[value]}<br>County Rank: ${1822 - +d.rank}`);
        });

    objs.call(toolTip);

    objs.on("mouseover", function (labels) {
        toolTip.show(labels, this);
        d3.select(this).style("stroke", "white").style('fill-opacity', 1);
        d3.event.stopPropagation();
    }).on("mouseout", function (labels) {
        toolTip.hide(labels);
        d3.select(this).style("stroke", "transparent").style('fill-opacity', 0.9);
    });
}

// Function to create summary table
function drawTable(arr, id) {
    var Indexes = {
        'Population': "pop", 'Low Access %': "plow_access", 'Low Access Count': "low_access",
        'Household Income': 'income', 'Per Capita Income': "pcincome", 'Poverty Rate %': "poverty",
        'Gini Index': 'gini', 'Home Value': 'home', 'Median Age': 'age'
    };

    var pnl = d3.select('#summary').append('div').classed("card", true).classed('border-0', true).append('div').classed("card-body", true);
    var tbl = pnl.append('table');

    Object.keys(Indexes).map(i => {
        tbl.append("tbody")
            .selectAll("tr").data([arr[id]])
            .enter().append("tr")
            .html(d => `<th class="sumtable" style='color: white;'>${i}:</th><td class="sumtable" style='color: #e3e3e3'>${arr[id][Indexes[i]][0]}</td>`)
            .classed('sumtable', true);
        // .html(d => `<th style='color: white;'>${i}:</th><td style='color: ${fillColor(scale, arr[id]['plow_access'][0])}'>${arr[id][Indexes[i]][0]}</td>`);
    });
}

// Function to match scatter circle to chosen county, returns corresponding scatter circle element
function findChosenCircle(countyid) {
    var scatterplots = d3.select('#Scatter').selectAll('circle');
    var chosenCircle = '';

    scatterplots.nodes().forEach(circle => {

        if (circle.__data__.id[0] === countyid) {
            chosenCircle = circle;
        }
    });
    return chosenCircle;
}

// Function to add label text
function chooseText() {
    d3.select('#summary').append('p').style('opacity', 0.5).style('margin-top', '20%').style('margin-left', '10%').style('text-indent', 0).style('font-size', '12px').html('* Rollover county for food desert info. Select county for summary and corresponding marker in scatter plot');
}

// Legend color scale
function drawColorScale() {
    var pallete = svg.append('g')
        .attr('id', 'pallete')
    var swatch = pallete.selectAll('rect')
        .data(['#ff0000', '#e6001a', '#bf0040', '#a60059', '#800080', '#660099', '#4000bf', '#2600d9', '#0000ff']);
    swatch.enter().append('rect')
        .attr('fill', function (d) {
            return d;//return rgb
        })
        .attr('x', function (d, i) {
            return (width - 12) + '';
        })
        .attr('y', function (d, i) {
            return (i * 4) + '';
        })
        .attr('width', '20')
        .attr('height', '20')
        .attr("transform", `translate(${margin.left}, ${svgHeight / 2 + 200})`);

    pallete.append('text').style('color', '#c9c9c9').style('text-anchor', 'end').style('opacity', 0.6).style('font-size', '10px').style('fill', '#c9c9c9').attr("transform", `translate(${width + margin.left + 10}, ${svgHeight / 2 + 200 - 5})`).html('High %');
    pallete.append('text').style('color', '#c9c9c9').style('text-anchor', 'end').style('opacity', 0.6).style('font-size', '10px').style('fill', '#c9c9c9').attr("transform", `translate(${width + margin.left + 10}, ${svgHeight / 2 + 252 + 10})`).html('Low %');
}
function drawColorScale2(bsvg) {
    var pallete = bsvg.append('g')
        .attr('id', 'pallete')
    var swatch = pallete.selectAll('rect')
        .data(['#ff0000', '#e6001a', '#bf0040', '#a60059', '#800080', '#660099', '#4000bf', '#2600d9', '#0000ff']);
    swatch.enter().append('rect')
        .attr('fill', function (d) {
            return d;//return rgb
        })
        .attr('x', 10)
        .attr('y', function (d, i) {
            return (i * 4) + '';
        })
        .attr('width', '20')
        .attr('height', '20')
        .attr("transform", `translate(0, ${svgHeight / 2 + 100})`);

    pallete.append('text').style('color', '#c9c9c9').style('opacity', 0.6).style('font-size', '10px').style('fill', '#c9c9c9').attr("transform", `translate(10, ${svgHeight / 2 + 100 - 5})`).html('High %');
    pallete.append('text').style('color', '#c9c9c9').style('opacity', 0.6).style('font-size', '10px').style('fill', '#c9c9c9').attr("transform", `translate(10, ${svgHeight / 2 + 152 + 11})`).html('Low %');
}

// url for app.py endpoint
var url = `/api/fullconvert`;

// Reads d3 map data
d3.json("https://d3js.org/us-10m.v1.json", function (error, us) {
    if (error) throw error;

    // Reads data from app.py
    d3.json(url, function (data) {

        console.log(data);

        // Creates smaller object to bind with map counties
        var countyData = {};
        Object.values(data).forEach(county => {

            countyData[county.CensusTract] = {
                "id": [+county.CensusTract],
                "poverty": [(+county.PovertyRate_15).toFixed(2), (+county.PovertyRate_14).toFixed(2), (+county.PovertyRate_13).toFixed(2), (+county.PovertyRate_12).toFixed(2)],
                "age": [+county.MedianAge_15, +county.MedianAge_14, +county.MedianAge_13, +county.MedianAge_12],
                "county": [county.County], "state": [county.State], "name": [county.Name],
                "gini": [+county.EstimateGiniIndex_15, +county.EstimateGiniIndex_14, +county.EstimateGiniIndex_13, +county.EstimateGiniIndex_12],
                "pcincome": [+county.PerCapitaIncome_15, +county.PerCapitaIncome_14, +county.PerCapitaIncome_13, +county.PerCapitaIncome_12],
                "income": [+county.HouseholdIncome_15, +county.HouseholdIncome_14, +county.HouseholdIncome_13, +county.HouseholdIncome_12],
                "low_access": [(+county.LAPOP1_10_y15).toFixed(2)], "plow_access": [(+county["FD_vs_POP(lapop1_10)"] * 100).toFixed(2)],
                "pop": [+county.Population_15, +county.Population_14, +county.Population_13, +county.Population_12],
                "home": [+county.MedianHomeValue_15, +county.MedianHomeValue_14, +county.MedianHomeValue_13, +county.MedianHomeValue_12],
                "AllEmplPerPop": [+county["ALL_Employee/Pop_15"]],
                "pov_ch": [+county.PVRTY_RT_CHG_15_10],
                'emp_ch': [+county["ALL_Employee/change_15_10"]],
                "snap": [+county.SNAP_15_PERCAPS * 100],
                "coordinates": [[+county.Lat, +county.Lng]],
                "pop_den": [+county.population_density_15],
                "pop_den_ch": [+county.population_density_CHG_10_15]
            };

        })

        // Color scale
        var scale = d3.scaleSqrt()
            .domain([d3.min(data, d => (+d["FD_vs_POP(lapop1_10)"] * 100)), d3.max(data, d => (+d["FD_vs_POP(lapop1_10)"] * 100))])
            .range(['#0000ff', '#FF0000']);

        var scale2 = d3.scaleSqrt()
            .domain([0.00, d3.max(data, d => (+d["FD_vs_POP(lapop1_10)"]))])
            .range(['#0000ff', '#FF0000']);

        // Calls legend function
        drawColorScale();

        // Draws county outlines
        var cys = svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("d", path)
            .style('fill', d => fillColor(scale2, findDesert(data, d.id)))
            .classed('selectedCounty', false)
            .classed('unselectedCounty', true)
            .attr("class", "counties");

        // Draws state outlines
        var sts = svg.append('g').selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style('fill', 'none')
            .style('stroke-width', 1)
            .style('stroke', 'rgb(37, 37, 37)')
            .attr("class", "states");

        // Stores all county outlines in one array
        var countyForms = d3.selectAll(".counties");

        // Filters counties that have food deserts
        var desertCounties = [];

        countyForms.nodes().forEach(county => {
            var color = county.style.fill;
            if (color !== "rgb(65, 64, 64)") {
                desertCounties.push(county);
            }
        })

        chooseText();

        // Calls function for tooltips over map counties
        stateHover(countyForms, countyData, scale);

        // Calls function for packed bubbles
        choosePackedBubbles(countyData, scale);

        // Calls function for scatter plot
        createScatter(countyData);

        // Calls functions for comaprison chart and table
        boxDropDownClick(countyData);
        comparisonTable(countyData);

        // Calls functions to create locator map and table
        createMap(countyData);

        // Adds back to top button
        window.onscroll = function () { scrollFunction() };
        document.getElementById("myBtn").onclick = function () { topFunction() };

        function scrollFunction() {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                document.getElementById("myBtn").style.display = "block";
            } else {
                document.getElementById("myBtn").style.display = "none";
            }
        }

        // When the user clicks on the button, scroll to the top of the document
        function topFunction() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
    });

})