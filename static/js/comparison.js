// Sets initial value to plot
var chosenText = "Poverty Rate Change";

// Function to change box plot on dropdown choice
function boxDropDownClick(data) {

    // Creates comparison table of top and bottom 30 counties
    createComaprisonPlot(data, chosenText);
    var buttons = d3.selectAll('.bxbtn');

    // On click, if not the active value plotted, changes boxplot
    buttons.on("click", function () {
        var dpdnText = d3.select(".bxbtngp").text();
        chosenText = d3.select(this).text();

        // Replaces text in dropdown button and changes class if chosen label to inactive
        if (chosenText != dpdnText) {
            createComaprisonPlot(data, chosenText);
            d3.select(".bxbtngp").text(chosenText);
            d3.select(this).classed('inactiveDropDown', true).classed('activeDropDown', false);
        }
        
        // Changes class of previous label to active
        buttons.nodes().forEach((button, i) => {
            var text = d3.select(button).text();
            if (text === dpdnText) {
                d3.select(button).classed('inactiveDropDown', false).classed('activeDropDown', true);
            }
        })
    })
}

// Function to create box plot
function createComaprisonPlot(data, label) {

    // Creates object to match label text with value
    var topics = {};
    topics = {
        "Poverty Rate Change": "pov_ch",
        "Median Age": "age",
        "Estimated Gini Index": "gini",
        "Snap Recipients": "snap",
        "Home Value": "home",
        "Per Capita Income": "pcincome",
        "Household Income": "income",
        "Density": "pop_den"
    }

    // Sets value
    var value = topics[label];

    // Sorts data on low access %
    var data = Object.values(data).sort(function (a, b) { return (+b.plow_access[0]) - (+a.plow_access[0]); });

    // Creates arrays of best and worst county keys(or tracts)
    var topCounties = data.slice(0, 31);
    var bottomCounties = data.reverse().slice(0, 31);
    var best = [], worst = [];

    topCounties.forEach(county => {
        worst.push(+county[value][0]);
    })
    bottomCounties.forEach(county => {
        best.push(+county[value][0]);
    })

    // Sets data to be used in plotly
    var trace1 = {
        y: best,
        type: 'box',
        name: 'Low % Food Desert',
        marker: {
            color: '#cccccc'
        },
        fillcolor: '#0000ff'
    };

    var trace2 = {
        y: worst,
        type: 'box',
        name: 'High % Food Desert',
        marker: {
            color: '#cccccc'
        },
        fillcolor: '#d4002b',
    };

    var data0 = [trace1, trace2];

    // Sets layout for map
    var layout = {
        responsive: true,
        autosize: true,
        title: `${label} vs Food Desert %`,
        paper_bgcolor: '#252525',
        plot_bgcolor: '#252525',
        font: {
            color: '#999999'
        }

    };

    // Plots box plot
    Plotly.newPlot("one", data0, layout);
}

// Function to create comparisons table
function comparisonTable(data) {

    // Sorts data on low access %
    var data = Object.values(data).sort(function (a, b) { return (b.plow_access[0]) - (a.plow_access[0]); });

    // Slices of top and bottom 30 counties
    var worst = data.slice(0, 31);
    var best = data.reverse().slice(0, 31);

    // Define container to append table
    var container = d3.select('#two');

    // Add table using data and d3
    var th = container.append('table').classed('comptable', true).append('div').classed("card", true).classed('border-0', true).classed('comptable', true).append('div').classed("card-body", true).classed('comptable', true);
    th.append('tr')
        .html('<th class="comptable" style="color: #0000ff">Best Food Access %</th><th class="comptable" style="color: #d4002b">Worst Food Access %</th>')
        .style('color', 'white');

    th.selectAll('tr')
        .data(best).enter()
        .append('tr')
        .html((d, i) => `<td class="comptable">${i}. ${best[i - 1].name}</td><td class="comptable">${i}. ${worst[i - 1].name}</td>`)
        .style('color', '#c9c9c9');
    
}

