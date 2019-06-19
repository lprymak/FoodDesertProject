// Defines object to match values with extents and ids for each slider
// Makes it easy to use in filtering the data
var filterValues = {
    "plow_access": ["sildervar_fd", ["input_fd_min", "input_fd_max"], ["fd_low_bnd", "fd_up_bnd"], ["input_min_fd", "input_max_fd"], "fd_slider",  "Food Desert Ratio"],
    "pop": ["sildervar_pop", ["input_pop_min", "input_pop_max"], ["pop_low_bnd", "pop_up_bnd"], ["input_min_pop", "input_max_pop"], "pop_slider", "Population"],
    "pop_den": ["sildervar_popden", ["input_popden_min", "input_popden_max"], ["popden_low_bnd", "popden_up_bnd"], ["input_min_popden", "input_max_popden"], "popden_slider", "Population Density"],
    "pcincome": ["sildervar_pcincome", ["input_pcincome_min", "input_pcincome_max"], ["pcincome_low_bnd", "pcincome_up_bnd"], ["input_min_pcincome", "input_max_pcincome"], "pcincome_slider", "Per Capita Income"],
    "income": ["sildervar_hhincome", ["input_hhincome_min", "input_hhincome_max"], ["hhincome_low_bnd", "hhincome_up_bnd"], ["input_min_hhincome", "input_max_hhincome"], "hhincome_slider", "Household Income"],
    "age": ["sildervar_medage", ["input_medage_min", "input_medage_max"], ["medage_low_bnd", "medage_up_bnd"], ["input_min_medage", "input_max_medage"], "medage_slider", "Median Age"],
    "gini": ["sildervar_gini", ["input_gini_min", "input_gini_max"], ["gini_low_bnd", "gini_up_bnd"], ["input_min_gini", "input_max_gini"], "gini_slider", "Estimated Gini Index"],
    "home": ["sildervar_home", ["input_home_min", "input_home_max"], ["home_low_bnd", "home_up_bnd"], ["input_min_home", "input_max_home"], "home_slider", "Home Value"],
    "snap": ["sildervar_snap", ["input_snap_min", "input_snap_max"], ["snap_low_bnd", "snap_up_bnd"], ["input_min_snap", "input_max_snap"], "snap_slider", "Snap Recipients"],
    "poverty": ["sildervar_pov", ["input_pov_min", "input_pov_max"], ["pov_low_bnd", "pov_up_bnd"], ["input_min_pov", "input_max_pov"], "pov_slider", "Poverty Rate (%)"]
}

// Defines object to use to match label text with values to use in filtering
var filterLabels = {
    "Food Desert Ratio": "plow_access", "Population": "pop", "Population Density": "pop_den", "Per Capita Income": "pcincome",
    "Household Income": "income", "Median Age": "age", "Estimated Gini Index": "gini", "Home Value": "home", "Snap Recipients": "snap",
    "Poverty Rate (%)":"poverty"
}

// Creates sliders
function makeSliders(data) {

    // Loops through each filter type in previously defined object
    Object.keys(filterValues).forEach((filter, i) => {
        // Finds inputs and divs for sliders
        var inputMin = document.getElementById(filterValues[filter][3][0]);
        var slider = document.getElementById(filterValues[filter][0]);
        var inputMax = document.getElementById(filterValues[filter][3][1]);

        // Finds extents to use and replaces values in main object to call later
        var min = [];
        Object.values(data).forEach(county => {
            min.push(+county[filter][0]);
        })
        filterValues[filter][1][0] = (d3.min(min)).toFixed(0);
        filterValues[filter][1][1] = (d3.max(min)).toFixed(0);

        // Sets input values as min and max
        inputMin.setAttribute("value", +filterValues[filter][1][0]);
        inputMax.setAttribute("value", +filterValues[filter][1][1]);

        // Creates slider
        noUiSlider.create(slider, {
            connect: true,
            animate: false,
            behaviour: 'snap',
            start: [+filterValues[filter][1][0], +filterValues[filter][1][1]],
            range: {
                min: +filterValues[filter][1][0],
                max: +filterValues[filter][1][1]
            }
        });

        // Adds event listener for any changs to input, changes sliders
        inputMin.addEventListener('change', function () {
            slider.noUiSlider.set([this.value, null]);
        });
        inputMax.addEventListener('change', function () {
            slider.noUiSlider.set([null, this.value]);
        });
    })

    // Hides and deactivates all sliders
    allInactiveSliders();
    // Shows and activates active filter
    activeSlider("plow_access");
    filterTerms();
}

// Filters data
function filtering(data) {

    // Creates empty object to store filtered data
    var newData = {};

    // Loops through each filter in main object and filters data
    Object.keys(filterValues).forEach(filter => {
        var keys = [];
        Object.entries(data).forEach(d => {
            if (d[1][filter][0] >= +filterValues[filter][2][0] && d[1][filter][0] <= +filterValues[filter][2][1]) {
                // Holds keys of each filtered county to call from main data source
                keys.push(d[0]);
            }
        })

        // Adds filtered county data to the empty object 
        keys.forEach(key => {
            newData[key] = data[key];
        })

        // Sets filtered data as the data set to reuse for the next filter
        data = newData;

        // Empties object to hold the filtered data for each individual filter value
        newData = {};
    });

    if (Object.keys(data).length === 0) {
        d3.select('.filterResultTotal').selectAll('h5').remove();
        d3.select('.filterResultTotal').append('h5').html('No Results').classed('order-0');
    }
    else {
        d3.select('.filterResultTotal').selectAll('h5').remove();
        d3.select('.filterResultTotal').append('h5').html(Object.keys(data).length + ' Results').classed('order-0');

        d3.select(".resultsbtn").on("click", function () {
            // Removes results table
            if (d3.select(this).text() === "Close") {
                d3.select('.filterTable').html("");
                d3.select(".resultsbtn").html("See Results")
            }
            // Displays results table
            else {
                // console.log(Object.entries(data).length);
                filteredResults(data);
                d3.select(this).html("Close");
            }
        })
    }
    // Displays results total
    // d3.selectAll('.filterResultTotal').selectAll('h5').style('color', '#d4002b');
    d3.selectAll('.filterResultTotal').selectAll('h5').style('color', '#0000ff');
    
    // Returns the filtered counties
    return data;
}

// Creates map and calls functions for sliders, filtering, markers
function createMap(data) {

    var scale = d3.scaleSqrt()
    .domain([0, d3.max(Object.values(data), d => (+d.plow_access[0]))])
    .range(['#0000ff', '#FF0000']);

    // Calls function to create sliders
    makeSliders(data);

    // Defines active filter before anything is clicked
    var filter = "plow_access";

    var countyLocations = [];

    // Creates map tile layer 
    L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoibGl6cCIsImEiOiJjandjcTk1ZWwwM3l3NGFvYWljbGgzcXJiIn0." +
        "EYxl9BUTmckjbHA2kq8HuQ");

    // Creates a baseMaps object to hold the base map
    var baseMaps = {
        Dark: darkmap,
    };

    // Creates the map object with options
    var myMap = L.map("locator", {
        center: [39.6, -93.8],
        zoom: 4,
        layers: [darkmap]
    });

    // Creates marker layer for full data at start
    countyLocations = L.layerGroup(createMarks(data, scale));
    countyLocations.addTo(myMap);

    // Calls function to acivate and deactive slider based on dropdown choice
    dropDownChange(filter);

    d3.select('.resetbtn').on("click", function () {
        clearAllFilters();
    });

    // Loops through main object defined at the top  to define listening events for each slider
    Object.keys(filterValues).forEach(filter => {

        var slider = document.getElementById(filterValues[filter][0]);
        slider.noUiSlider.on('update', function (values, handle) {
            d3.select('#filterNumbers').html("");

            if (handle == 0) {
                document.getElementById(filterValues[filter][3][0]).value = values[0];
            } else {
                document.getElementById(filterValues[filter][3][1]).value = values[1];
            }

            // Sets main object values to use in filtering as values from inputs
            filterValues[filter][2][0] = document.getElementById(filterValues[filter][3][0]).value;
            filterValues[filter][2][1] = document.getElementById(filterValues[filter][3][1]).value;

            // Removes existing markers
            myMap.removeLayer(countyLocations);
            d3.select('.filterTable').html("");
            d3.select(".resultsbtn").html("See Results");

            // Creates new markers and adds to map
            filterTerms();
            countyLocations = L.layerGroup(createMarks(filtering(data), scale));
            countyLocations.addTo(myMap);
            
        });
    });
}

// Creates circle markers for counties in filtered data
function createMarks(data, scale) {

    var countyMarkers = [];

    Object.values(data).forEach(county => {

        countyMarkers.push(
            L.circleMarker(county.coordinates[0], {
                stroke: false,
                fillOpacity: 0.5,
                color: "transparent",
                fillColor: scale(county.plow_access[0]),
                // fillColor: "#0000ff",
                radius: 10,
            }).bindPopup("<h3>" + county.county[0] + ", " + county.state[0] + "</h3> <hr>"
                + "Low Food Access: " + county.plow_access[0] + " %" + "<br>"
                + "Population: " + numberWithCommas(county.pop[0]) + "<br>"
                + "Population Density: " + (+county.pop_den).toFixed(2) + " ppl/sq mi<br>"
                + "PerCapita Income: " + numberWithCommas(county.pcincome[0]) + "<br>"
                + "Household Income: " + numberWithCommas(county.income[0]) + "<br>"
                + "Gini Index: " + (county.gini[0]).toFixed(2) + "<br>"
                + "Median Age: " + (+county.age[0]).toFixed(1) + "</h4>"
            )
        );
    });

    return countyMarkers;
}

// Formats numbers
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// Function to turn active slider visible
function activeSlider(filter) {
    d3.select(`#${filterValues[filter][4]}`).classed("inactiveInput", false).classed("activeInput", true);
}

// Function to turn all sliders invisible
function allInactiveSliders() {
    Object.keys(filterValues).forEach(key => {
        d3.select(`#${filterValues[key][4]}`).classed("inactiveInput", true).classed("activeInput", false);
    })
}

// Function to change the active slider based on dropdown choice
function dropDownChange(filter) {

    var btns = d3.selectAll('.mapbtn');

    var chosenText = filter;

    btns.on("click", function () {
        var dropdownText = d3.select('.mapbtngp').text();
        chosenText = d3.select(this).text();

        if (chosenText != dropdownText) {
            d3.select(".mapbtngp").html(chosenText);
            d3.select(this).classed('inactiveDropDown', true).classed('activeDropDown', false);
            // d3.select(this).html(chosenText);

            var filter = filterLabels[chosenText];

            allInactiveSliders();
            activeSlider(filter);
        }

        btns.nodes().forEach((button, i) => {
            var text = d3.select(button).text();
            if (text === dropdownText) {
                d3.select(button).classed('inactiveDropDown', false).classed('activeDropDown', true);
            }
        })
    })
}

// Function to reset values and sliders
function clearAllFilters() {
    
    // Loops through each filter type in previously defined object
    Object.keys(filterValues).forEach((filter) => {
        // Finds inputs and divs for sliders
        var slider = document.getElementById(filterValues[filter][0]);
        filterValues[filter][2][0] = filterValues[filter][1][0];
        filterValues[filter][2][1] = filterValues[filter][1][1];

        // Sets sliders back to inital values
        slider.noUiSlider.set([filterValues[filter][1][0], filterValues[filter][1][1]]);
    })
}

// Function that displays filter terms
function filterTerms() {

    var table = d3.select('#filterNumbers').append('table').classed('table-striped table-dark', true).classed('border-0', true);
    table.selectAll('tr')
        .data(Object.entries(filterValues))
        .enter()
        .append('tr')
        .html(d => `<th>${[d[1][5]]}:</th><td></td><td>${d[1][2][0]} - ${d[1][2][1]}</td>`)
        .classed('order-1');
    
}

// Filter that creates results table
function filteredResults(data) {
    d3.select('.filterTable').html("");
    var table = d3.select('.filterTable').append('table').classed('table table-striped table-dark', true);

    table.append('tr')
        .html('<th>County</th><th>Coordinates</th><th>Low Food Access %</th><th>Population</th><th>Density</th><th>Per Capita Income</th><th>Household Income</th><th>Home Value</th><th>Median Age</th><th>Snap Recipients</th><th>Poverty Rate (%)</th><th>Estimated Gini Index</th>');
    table
        .selectAll('tr')
        .enter()
        .data(Object.values(data))
        .enter()
        .append('tr')
        .html(d => `<td>${d.name[0]}</td><td>${(d.coordinates[0][0]).toFixed(2)}, ${(d.coordinates[0][1]).toFixed(2)}</td><td>${(+d.plow_access[0]).toFixed(2)}</td><td>${(+d.pop[0]).toFixed(0)}</td><td>${(d.pop_den[0]).toFixed(2)}</td><td>${(d.pcincome[0]).toFixed(0)}</td><td>${(d.income[0]).toFixed(0)}</td><td>${(d.home[0]).toFixed(0)}</td><td>${(d.age[0]).toFixed(0)}</td><td>${(d.snap[0]).toFixed(2)}</td><td>${(+d.poverty[0]).toFixed(2)}</td><td>${(d.gini[0]).toFixed(2)}</td>`);
}