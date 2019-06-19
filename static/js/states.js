// api endpoint for data
var stateurl = '/api/stateconvert';

// Function for hovering on stat namess
function hoverStates(objs, scaleLP, scaleP, mask, data) {

    // Chosen objects on mouseover
    objs.on("mouseover", function () {
        // Defines chosenState
        var chosenState = d3.select(this).nodes()[0];

        // Calls function to show dots on hover
        showDots(chosenState, scaleLP, scaleP);
        d3.event.stopPropagation();

    }).on("mouseout", function () {
        // Removes dots, text from container. Changes classes of stats to spent for easier removal later
        d3.selectAll('.infoDot').remove();
        d3.selectAll('.infoLine').remove();
        d3.selectAll('.infoText').remove();
        d3.selectAll('.statSquare').classed('spent', true);

        // d3.selectAll('#stat_mask').classed('spent', true);

    }).on("click", function () {
        // Defines chosenState
        var chosenState = d3.select(this).nodes()[0];
        d3.selectAll('.avgSquare').remove();

        // Removes existing stats, creates state stats
        d3.selectAll('.spent').remove();
        d3.selectAll('.statSquare').remove();
        createStats(chosenState.__data__, mask);

        // Stops event from propagating to parent element
        d3.event.stopPropagation();
    })

    // Clears all stats and adds national averages on body click
    d3.select('body').on('click', function () {
        d3.selectAll('.spent').remove();
        d3.selectAll('.statSquare').remove();
        crateAverageValues(data, mask);
    }).on("mouseover", function () {
        // Changes all stats to class spent for easier removal
        d3.selectAll('.statSquare').classed('spent', true);
    })
}

// Function to create curves
function createMainLine(objs, scale) {
    // Defines empty array for use 
    var xys = [];
    var svg = d3.select('#st').select('.lines').append('g');

    objs.nodes().forEach(obj => {
        var low_access = obj.__data__.low_access;
        var xvalue = scale(low_access) + 40;
        var yvalue = obj.attributes.y.value;
        console.log(xvalue);
        xys.push([xvalue, +yvalue + 5]);

    });

    var lineGenerator = d3.line().curve(d3.curveBasis);
    var points = lineGenerator(xys);

    svg
        .append('path')
        .attr('d', points)
        .style('stroke', '#c9c9c9')
        .style('fill', 'transparent')
        .classed('laline', true);

}

function createStats(state, mask) {
    var stats = {
        'Rank': ['State', 'Rank', 52 - +state.rank],
        'Low Access': ['Low Food', 'Access (%)', (+state.low_access / +state.pop_15 * 100).toFixed(2)],
        'Population': ['Population', (+ state.pop_15).toFixed(0)],
        'Househole Income': ['Household', 'Income', (+state.HouseholdIncome_15).toFixed(0)],
        'Per Capita Income': ['Per Capita', 'Income', (+state.PerCapitaIncome_15).toFixed(0)],
        'Home Value': ['Home Value', (+state.MedianHomeValue_15).toFixed(0)],
        'Median Age': ['Median Age', (+state.MedianAge_15).toFixed(1)],
        'Poverty Rate': ['Poverty', 'Rate (%)', (+state.PovertyRate_15).toFixed(2)],
        'Gini Index': ['Gini Index', (+state.EstimateGiniIndex_15).toFixed(2)]
    };

    mask.append('text').attr('x', 527).attr('y', 90)
        .attr("text-anchor", "middle")
        .style("font-size", 34)
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .text(state.State)
        .classed('statSquare', true);

    Object.entries(stats).forEach((entry, i) => {

        var height = 100;
        var width = 96;
        var space = 20;
        var yloc = 100;

        var title1 = entry[1][0];
        var value = '';

        mask.append('text')
            .attr('x', (width + space) * i + 65).attr('y', yloc + 20)
            .attr("text-anchor", "middle")
            .style("font-size", 16)
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .text(title1)
            .classed('statSquare', true);

        if (entry[1].length > 2) {
            var title2 = entry[1][1];
            value = +entry[1][2];

            mask.append('text')
                .attr('x', (width + space) * i + 65).attr('y', yloc + 35)
                .attr("text-anchor", "middle")
                .style("font-size", 16)
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .text(title2)
                .classed('statSquare', true);
        }
        else {
            value = +entry[1][1];
        }

        mask.append('text')
            .attr('x', (width + space) * i + 65).attr('y', yloc + 75)
            .attr("text-anchor", "middle")
            .style("font-size", 24)
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .text(value)
            .classed('statSquare', true);
    })
}

// Function to create national average stats
function crateAverageValues(data, mask) {

    // Creates object for easier loop to calculate averages
    var averages = {
        "low_access": ["Low Food", "Access Total"],
        "pop_15": ["Population", "Average"],
        "HouseholdIncome_15": ["Household", "Income"],
        "PerCapitaIncome_15": ["Per Capita", "Income"],
        "MedianHomeValue_15": ["Median", "Home Value"],
        "MedianAge_15": ["Median Age"],
        "PovertyRate_15": ["Poverty", "Rate (%)"],
        "EstimateGiniIndex_15": ["Gini Index"]
    }

    // Find average low food acces % for each state
    var avgLow_AcessP = 0;
    Object.keys(averages).forEach(key => {
        var keyData = [];
        var pla = [];

        data.forEach(county => {
            keyData.push(+county[key]);
            pla.push(+county.low_access / +county.pop_15 * 100)
        })
        averages[key].push(d3.mean(keyData).toFixed(2));
        avgLow_AcessP = d3.mean(pla).toFixed(2);
    })

    // Add to defined object
    averages["plow_access"] = ["Low Food", "Access (%)", avgLow_AcessP];

    // Adds header to mask on main rect - use mask to prevent cursor and keeps as one element
    mask.append('text').attr('x', 527).attr('y', 90)
        .attr("text-anchor", "middle")
        .style("font-size", 34)
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .text("National")
        .classed('avgSquare', true)
        .classed('statSquare', true);

    // For each object entry, adds national stats to mask
    Object.entries(averages).forEach((entry, i) => {

        var height = 100;
        var width = 96;
        var space = 20;
        var yloc = 100;

        var title1 = entry[1][0];
        var value = '';

        // Adds top line for each stat
        mask.append('text')
            .attr('x', (width + space) * i + 70).attr('y', yloc + 20)
            .attr("text-anchor", "middle")
            .style("font-size", 14)
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .text(title1)
            .classed('avgSquare', true)
            .classed('statSquare', true);

        // If there is a separate line, adds below, sets value
        if (entry[1].length > 2) {
            var title2 = entry[1][1];
            value = +entry[1][2];

            // Adds second line to mask
            mask.append('text')
                .attr('x', (width + space) * i + 70).attr('y', yloc + 35)
                .attr("text-anchor", "middle")
                .style("font-size", 14)
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .text(title2)
                .classed('avgSquare', true)
                .classed('statSquare', true);
        }
        // If only one line, sets value
        else {
            value = +entry[1][1];
        }

        // Add values to mask
        mask.append('text')
            .attr('x', (width + space) * i + 70).attr('y', yloc + 75)
            .attr("text-anchor", "middle")
            .style("font-size", 20)
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .text(value)
            .classed('avgSquare', true)
            .classed('statSquare', true);
    })
}

// Function to create dots shown on hover
function showDots(state, scaleLP, scaleP) {

    // Defines state values to use
    var low_access = +state.__data__.low_access;
    var plow_access = (+state.__data__.low_access / +state.__data__.pop_15) * 100;
    var pop = +state.__data__.pop_15;

    // Defines x and y axis values to use
    var xvalue = +state.attributes.x.value + 12;
    var yvalueLA = -1 * (scaleP(low_access) + 40) - 20;
    var yvaluePLA = -1 * (scaleLP(plow_access)) - 20;
    var yvalueP = -1 * (scaleP(pop) + 40) - 20;
    // Creates an array for line points that connects dots
    var xy = [[xvalue - 0.5, yvaluePLA + 520], [xvalue - 0.5, yvalueLA + 510], [xvalue - 0.5, yvalueP + 450]];

    // Generates line data from points
    var lineGenerator = d3.line();
    var points = lineGenerator(xy);

    // Selects container for placement
    var svg = d3.select('#st').select('.lines');

    // Adds line
    svg.append('path').attr('d', points)
        .style('stroke', '#c9c9c9').style('fill', 'transparent').style('opacity', 0.5)
        .classed('infoLine', true);

    // Adds dot for total low access
    svg.append('circle').attr('cx', +xvalue).attr('cy', +yvalueLA).attr('r', 3)
        .style('fill', '#d4002b')
        .classed('infoDot', true).classed('lacircle', true)
        .attr('transform', 'translate(0, 510)');

    // Adds dot for low access %
    svg.append('circle').attr('cx', +xvalue).attr('cy', +yvaluePLA).attr('r', 3)
        .style('fill', '#d4002b')
        .classed('infoDot', true).classed('placircle', true)
        .attr('transform', 'translate(0, 520)');

    // Adds dot for population
    svg.append('circle').attr('cx', +xvalue).attr('cy', +yvalueP).attr('r', 3)
        .style('fill', '#d4002b')
        .classed('infoDot', true).classed('pcircle', true)
        .attr('transform', 'translate(0, 450)');

    // 
    if (state.State === "" || state.State === "") {
        // 
        svg.append('text').attr('x', +xvalue + 10).attr('y', +yvalueLA)
            .style('fill', '#c9c9c9').style('font-size', '12px')
            .html(`Low Access Total: ${low_access.toFixed(0)}`)
            .classed('infoText', true)
            .attr('transform', 'translate(0, 510)');

        svg.append('text').attr('x', +xvalue + 10).attr('y', +yvaluePLA)
            .style('fill', '#c9c9c9').style('color', '#c9c9c9').style('font-size', '12px')
            .html(`Low Access: ${plow_access.toFixed(0)}%`)
            .classed('infoText', true)
            .attr('transform', 'translate(0, 520)');

        svg.append('text').attr('x', +xvalue + 10).attr('y', +yvalueP)
            .style('fill', '#c9c9c9').style('color', '#c9c9c9').style('font-size', '12px')
            .html(`Population: ${pop}`)
            .classed('infoText', true)
            .attr('transform', 'translate(0, 450)');
    }
    else {
        svg.append('text').attr('x', +xvalue + 10).attr('y', +yvalueLA)
            .style('fill', '#c9c9c9').style('font-size', '12px')
            .html(`Low Access Total: ${low_access.toFixed(0)}`)
            .classed('infoText', true)
            .attr('transform', 'translate(0, 510)');

        svg.append('text').attr('x', +xvalue + 10).attr('y', +yvaluePLA)
            .style('fill', '#c9c9c9').style('color', '#c9c9c9').style('font-size', '12px')
            .html(`Low Access: ${plow_access.toFixed(0)}%`)
            .classed('infoText', true)
            .attr('transform', 'translate(0, 520)');

        svg.append('text').attr('x', +xvalue + 10).attr('y', +yvalueP)
            .style('fill', '#c9c9c9').style('color', '#c9c9c9').style('font-size', '12px')
            .html(`Population: ${pop}`)
            .classed('infoText', true)
            .attr('transform', 'translate(0, 450)');
    }
}

// Function to create curves
function createMainLineH(objs, scaleLP, scaleP, mask) {
    // Defines arrays to use for line points
    var xysLA = [];
    var xysLAP = [];
    var xysP = [];
    // Selects container to append
    var svg = d3.select('#st').select('.lines').append('g');

    // Creates line data for base axis
    var xaxis = [[10, 500], [1160, 500]];
    var lineGenerator = d3.line();

    // Generate base line, adds to mask
    var coords = lineGenerator(xaxis);
    baseline = mask
        .append('path')
        .attr('d', coords)
        .style('stroke', '#000000')
        .style('fill', 'transparent')
        .style('stroke-width', 0.5);

    // For each object entry (state), defines values to use for curves
    objs.nodes().forEach(obj => {

        var low_access = +obj.__data__.low_access;
        var pop = +obj.__data__.pop_15;
        var yvalueLA = -1 * (scaleP(low_access) + 40);
        var yvalueLAP = -1 * (scaleLP(low_access / pop * 100));
        var yvalueP = -1 * (scaleP(pop) + 40);
        var xvalue = +obj.attributes.x.value + 6;

        // Adds points to array
        xysLA.push([+xvalue + 5, +yvalueLA]);
        xysLAP.push([+xvalue + 5, +yvalueLAP]);
        xysP.push([+xvalue + 5, +yvalueP]);
    });

    // Defines line generator, generates line data for each curve
    var lineGenerator = d3.line().curve(d3.curveCatmullRom);
    var pointsLA = lineGenerator(xysLA);
    var pointsLAP = lineGenerator(xysLAP);
    var pointsP = lineGenerator(xysP);

    // Adds curves to container, styles
    // Low Access Total Line
    svg
        .append('path')
        .attr('d', pointsLA)
        .style('stroke', '#ffffff')
        .style('fill', 'transparent')
        .style('stroke-width', 0.5)
        .style('opacity', 0.5)
        .classed('laline', true)
        .attr('transform', 'translate(0, 490)');
    // Low Access Percentage Line
    svg
        .append('path')
        .attr('d', pointsLAP)
        .style('stroke', '#ffffff')
        .style('fill', 'transparent')
        .style('stroke-width', 0.5)
        .style('opacity', 0.5)
        .classed('lapline', true)
        .attr('transform', 'translate(0, 500)');
    // Population Line
    svg
        .append('path')
        .attr('d', pointsP)
        .style('stroke', '#ffffff')
        .style('fill', 'transparent')
        .style('stroke-width', 0.5)
        .style('opacity', 0.5)
        .classed('pline', true)
        .attr('transform', 'translate(0, 430)');
}

// Fuction to calculate rankings
function sortData(data, originalData) {
    // Sorts data based on low food access % of population, adds rank to dataset
    var sortedData = data;
    sortedData.sort(function (a, b) {
        return (+b.low_access / +b.pop_15 * 100) - (+a.low_access / +a.pop_15 * 100);
    })
    sortedData.forEach((sortedstate, i) => {
        originalData.forEach(state => {
            if (sortedstate.State === state.State) {
                state['rank'] = i + 1;
            }
        })
    })
}

// On reading the data
d3.json(stateurl, function (data) {

    // Change data entry for DC
    data.forEach(state => {
        if (state.State === "District of ") {
            state.State = "DC";
        }
    })

    // Define scales to use
    var stateScaleLAP = d3.scaleLinear().domain([d3.min(data, d => (d.low_access / d.pop_15 * 100)), d3.max(data, d => (d.low_access / d.pop_15 * 100))])
        .range([0, 25]);
    var stateScalePop = d3.scaleLinear().domain([d3.min(data, d => d.pop_15), d3.max(data, d => d.pop_15)])
        .range([0, 200]);

    // Calls acd creates containers to use for stats and lines
    var nameContainer = d3.select('#st').append('svg').attr('width', 1070).attr('height', 120)
        .classed('stateContainer', true)
        .attr("transform", `translate(0, 430)`);
    var rectGroup = nameContainer.append('g').attr('width', 1100);

    var linesContainer = d3.select('#st').append('svg').attr('width', 1100).attr('height', 520)
        .attr("transform", `translate(0, -220)`);
    var lineGroup = linesContainer.append('g').classed('lines', true);

    // FUnction to create chart
    function horizontalChart() {

        // Creates masked rects as elements for pointer events
        var stateBoxes = rectGroup.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('width', 21)
            .attr('height', 140)
            .attr('x', (d, i) => (i * 21))
            .attr('y', 0)
            .style('fill', 'rgb(37, 37, 37)')
            .classed('stateNameBoxes', true)
            .attr("mask", "url(#text_mask)");

        var mask = rectGroup.append('mask').attr('id', 'text_mask');

        rectMasks = mask.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('width', 21)
            .attr('height', 140)
            .attr('x', (d, i) => (i * 21))
            .attr('y', 0)
            .style('fill', '#ffffff');

        textMasks = mask.selectAll("rect").select('text')
            .data(data)
            .enter()
            .append("text")
            .attr("x", 0)
            .attr("y", (d, i) => (i * 21) + 16)
            .attr("text-anchor", "end")
            .style("font-size", 14)
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .attr('width', 22)
            .text((d) => d.State)
            .attr("transform", "rotate(-90)");
    }

    // Calls function to create chart
    horizontalChart();

    // Selects all created state elements
    stateBoxes = d3.selectAll('.stateNameBoxes');

    // Creates container and mask for stats
    var statContainer = d3.select('.lines').append('g');
    var sectionRect = statContainer.append('rect').attr('x', 10).attr('y', 50).attr('width', 1051).attr('height', 560)
        .attr('rx', 10).attr('ry', 10)
        .style('fill', 'rgb(65, 64, 64)')
        .style('stroke', 'transparent')
        .attr("mask", "url(#st_mask)");

    var statMask = statContainer.append('mask').attr('id', 'st_mask');

    statMask.append('rect').attr('x', 10).attr('y', 50).attr('width', 1051).attr('height', 460)
        .attr('rx', 10).attr('ry', 10)
        .style('fill', 'f2f2f2');
    
    // Creates curves
    createMainLineH(stateBoxes, stateScaleLAP, stateScalePop, statMask);

    // Creates initial average stats
    crateAverageValues(data, statMask);

    // Enables hovering actions
    hoverStates(stateBoxes, stateScaleLAP, stateScalePop, statMask, data);

    // Sorts data for ranks
    sortData(data, data);
})
