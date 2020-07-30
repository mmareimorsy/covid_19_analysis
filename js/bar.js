/*
    main.js
    Covid 19 d3 visualization
    line chart showing confirmed cases, death, recovery cases per country
    UIUC - CS498 Data Visualization
    mmorsy2
*/

function barChart(){
    // Dimensions of chart area
    var margin = { left:80, right:20, top:50, bottom:100 };
    var height = 500 - margin.top - margin.bottom, 
        width = 800 - margin.left - margin.right;

    // 3 different svgs for 3 different charts 
    var svgConfirmed = d3.select("#bar-area1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
            
    var svgDeaths = d3.select("#bar-area2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    var svgRecovery = d3.select("#bar-area3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // X Scale
    var xConfirmed = d3.scaleBand().range([0, width]).padding(0.2);
    // Y Scale
    var yConfirmed = d3.scaleLinear().range([height, 0]);

    // create x & y axis 
    var xAxisGroupConfirmed = svgConfirmed
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")");

    var yAxisGroupConfirmed = svgConfirmed
        .append("g")
        .attr("class", "y axis");

    // X Scale
    var xDeaths = d3.scaleBand()
        .range([0, width])
        .padding(0.2);
    // Y Scale
    var yDeaths = d3.scaleLinear().range([height, 0]);

    // create x & y axis 
    var xAxisGroupDeaths = svgDeaths
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")");
    var yAxisGroupDeaths = svgDeaths
        .append("g")
        .attr("class", "y axis");

    // X Scale
    var xRecovered = d3.scaleBand().range([0, width]).padding(0.2);
    // Y Scale
    var yRecovered = d3.scaleLinear().range([height, 0]);

    // create x & y axis 
    var xAxisGroupRecovered = svgRecovery
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")");
    var yAxisGroupRecovered = svgRecovery
        .append("g")
        .attr("class", "y axis");

    // X Label
    svgConfirmed.append("text")
        .attr("y", height + 65)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Date");

    // Y Label
    svgConfirmed.append("text")
        .attr("y", -60)
        .attr("x", -(height / 2))
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Confirmed Cases");

    // X Label
    svgDeaths.append("text")
        .attr("y", height + 65)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Date");

    // Y Label
    svgDeaths.append("text")
        .attr("y", -60)
        .attr("x", -(height / 2))
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Death Cases");

    // X Label
    svgRecovery.append("text")
        .attr("y", height + 65)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Date");

    // Y Label
    svgRecovery.append("text")
        .attr("y", -60)
        .attr("x", -(height / 2))
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Recovery Cases");

    // Legend for continents
    var margin_legend = { left:40, right:20, top:10, bottom:10 };
    var height_legend = 30 - margin_legend.top - margin_legend.bottom, 
        width_legend = 800 - margin_legend.left - margin_legend.right;
    
    var legend = d3.select("#continent-legend-bar")
        .append("svg")
        .attr("width", width_legend + margin_legend.left + margin_legend.right)
        .attr("height", height_legend + margin_legend.top + margin_legend.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_legend.left + ", " + margin_legend.top + ")");
    
    continents.forEach(function(continent, i){
        var legendCol = legend.append("g")
            .attr("transform", "translate(" + (i*(800/continents.length)) + ",0)");
    
        legendCol.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", continentColor(continent));
    
        legendCol.append("text")
            .attr("x", 12)
            .attr("y", 10)
            .attr("text-anchor", "start")
            .style("text-transform", "capitalize")
            .text(continent);
    });

    // Tooltip
    var div = d3.select("body")
        .append("div")
        .style("opacity",0)
        .attr('class', 'd3-tip');

    // Load all 3 CSV files via promises
    var promises = [
        d3.csv("data/confirmed_t.csv"),
        d3.csv("data/deaths_t.csv"),
        d3.csv("data/recovered_t.csv"),
        d3.csv("data/continents.csv")
    ];

    Promise.all(promises).then(function(allData){
        var confirmed = allData[0];
        var deaths = allData[1];
        var recovered = allData[2];
        var continentsMap = allData[3];
        
        // Populate drop down list
        var countryList = Object.keys(confirmed[0]).slice(1);
        d3.select("#country-list")
            .selectAll("option")
            .data(countryList)
            .enter()
            .append("option")
            .text(function(d){return d;});

        // Initial update of Data
        var countryInput = d3.select("#country-list").property("value");
        update(confirmed, svgConfirmed, xConfirmed, yConfirmed, xAxisGroupConfirmed, yAxisGroupConfirmed, countryInput,continentsMap);
        
        update(deaths, svgDeaths, xDeaths, yDeaths, xAxisGroupDeaths, yAxisGroupDeaths, countryInput,continentsMap);
        
        update(recovered, svgRecovery, xRecovered, yRecovered, xAxisGroupRecovered, yAxisGroupRecovered, countryInput,continentsMap);
        
        d3.select("#country-list").on("change", function(){
            var countryInput = d3.select("#country-list").property("value");
            
            update(confirmed, svgConfirmed, xConfirmed, yConfirmed, xAxisGroupConfirmed, yAxisGroupConfirmed, countryInput,continentsMap);
            
            update(deaths, svgDeaths, xDeaths, yDeaths, xAxisGroupDeaths, yAxisGroupDeaths, countryInput,continentsMap);
            
            update(recovered, svgRecovery, xRecovered, yRecovered, xAxisGroupRecovered, yAxisGroupRecovered, countryInput,continentsMap);
        })

    }).catch(function(error){
        console.log(error);
    })

    function update(data, svg, x, y ,xAxisGroup, yAxisGroup, countryInput, continentsMap){
        var continentFilter = continentsMap.filter(function(d){return d.country == countryInput});
        
        var continentInput = continentFilter[0].continent; 
        
        // Define transition 
        var t = d3.transition().duration(1000);

        // Define extents of data for x & y axis 
        var xDomain = Array.from(data, function(d){return d.date;});
        var yDomain = [0, d3.max(data, function(d){return +d[countryInput];})]
        
        x.domain(xDomain);
        y.domain(yDomain);
        
        // X Axis
        var xAxisCall = d3.axisBottom(x);
        xAxisGroup.transition(t).call(xAxisCall.tickValues(x.domain().filter(function(d,i){ return !(i%8);}))).selectAll("text").attr("x", 9).attr("y",0).attr("dy",".35em").attr("transform","rotate(90)").style("text-anchor","start");

        // Y Axis
        var yAxisCall = d3.axisLeft(y);
        yAxisGroup.transition(t).call(yAxisCall);

        var tootTipText = Array.from(data, function(d,i){
            return ("<strong>Date:</strong> <span style='color:yellow'>" + (d.date) + "</span><br>" + 
            "<strong>Cases:</strong> <span style='color:yellow'>" + d3.format(",")(+(d[countryInput])) + "</span><br>");
        });

        // remove & add elements in the bar chart
        var rects = svg.selectAll("rect").data(tootTipText);
        rects.exit()
            .attr("class", "exit")
            .transition(t)
            .attr("y",y(0))
            .attr("height",0)
            .remove();
        
        rects.enter()
            .append("rect")
            .attr("class", "enter")
            .on("mouseover", function(d){
                div.transition().style("opacity", 0.9);
                div.html(
                    d
                ).style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px")
                .style('pointer-events', 'all');
            })
            .on("mouseout", function(){
                div.transition().style("opacity", 0).style('pointer-events', 'none');})
            .merge(rects)
            .transition(t)
            .attr("fill", continentColor(continentInput))
            .attr("x", function(d,i){ return x(data[i].date); })
            .attr("width", x.bandwidth())
            .attr("y", function(d,i){ return y(+data[i][countryInput]); })
            .attr("height", function(d,i){ return height- y(+data[i][countryInput]); });
    }
}

barChart();