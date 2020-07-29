/*
    main.js
    Covid 19 d3 visualization
    Scatter Plot for fatality ratio vs confirmed cases
    UIUC - CS498 Data Visualization
    mmorsy2
*/

// Dimensions of chart area

function scatterPlot(){
    var margin = { left:80, right:20, top:50, bottom:100 };
    var height = 500 - margin.top - margin.bottom, 
        width = 800 - margin.left - margin.right;
    
    
    var svg = d3.select("#scatter-area")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + 
                ", " + margin.top + ")");
    
    // Labels
    var xLabel = svg.append("text")
        .attr("y", height + 50)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Confirmed Cases");
    var yLabel = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -170)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Fatality Ratio %")
    
    var timeLabel = svg.append("text")
        .attr("y", height - 300)
        .attr("x", width - 40)
        .attr("font-size", "25px")
        .attr("opacity", "0.4")
        .attr("text-anchor", "middle");
    
    // X Axis 
    var x = d3.scaleLog()
    .clamp(true)
    .domain([1,10000000])
    .range([0,width]);
    
    svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x).tickValues([1,10,100,1000,10000,100000,1000000,10000000]).tickFormat(d3.format(".2s")));
    
    // Y Axis 
    var y = d3.scaleLinear()
    .domain([0,40])
    .range([height,0]);
    
    svg.append("g").call(d3.axisLeft(y));
    
    // Continent Color 
    var continentColor = d3.scaleOrdinal(d3.schemeDark2);
    
    // Continent legends
    
    var continents = ["Africa", "Asia", "Europe",  "North America", "South America", "Oceania"];
    
    var legend = svg.append("g")
        .attr("transform", "translate(" + (width - 10) + 
            "," + (height - 280) + ")");
    
    continents.forEach(function(continent, i){
        var legendRow = legend.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");
    
        legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", continentColor(continent));
    
        legendRow.append("text")
            .attr("x", -10)
            .attr("y", 10)
            .attr("text-anchor", "end")
            .style("text-transform", "capitalize")
            .text(continent);
    });
    
    // Tooltip
    var div = d3.select("body").append("div").style("opacity",0).attr('class', 'd3-tip');
    
    // Transition setup 
    var transitionPer = 200;
    var interval;
    var dateIndex = 0;
    
    // Load Data & call to display data 
    d3.json("data/data.json").then(function(data){
        console.log(data);
        d3.select("#play-button").on("click", function(){
            var button = d3.select("#play-button");
                if (button.text() == "Play"){
                    button.text("Pause");
                    interval = setInterval(function(){
                        dateIndex = (dateIndex < data.length - 1) ? dateIndex+1 : 0
                        update(data[dateIndex]);
                    }, transitionPer);            
                }
                else {
                    button.text("Play");
                    clearInterval(interval);
                }
        });
        
        d3.select("#reset-button").on("click", function(){
            dateIndex = 0;
            update(data[dateIndex]);
        });
        update(data[data.length-1]);
    });
    
    // helper function to update data
    function update(data){
        // Update Date text 
        var t = d3.transition().duration(transitionPer);  
        timeLabel.text(data["date"]).transition(t);
    
        // Update circles of each country including tooltips
        var circles = svg.selectAll("circle").data(data["countries"], function(d){return d.country;});
        circles.exit().attr("class","exit").remove();
    
        circles.enter().append("circle")
        .attr("class","enter")
        .style("fill", function(d){return continentColor(d.continent);})
        .on("mouseover", function(d){
            div.transition().duration(200).style("opacity", 0.9);
            div.html(
                "<strong>Country:</strong> <span style='color:black'>" + d.country + "</span><br>" + 
                "<strong>Continent:</strong> <span style='color:black'>" + d.continent + "</span><br>" + 
                "<strong>Confirmed Cases:</strong> <span style='color:black'>" + d3.format(",.2r")(d.confirmed) + "</span><br>" +
                "<strong>Total Deaths:</strong> <span style='color:black'>" + d3.format(",.2r")(d.deaths) + "</span><br>" +
                "<strong>Recovered Cases:</strong> <span style='color:black'>" + d3.format(",.2r")(d.recovered) + "</span><br>" + 
                "<strong>Fatality Ratio:</strong> <span style='color:black'>" + d3.format(",.2f")(d.fatality_ratio) + "%</span><br>" +
                "<strong>Recovery Ratio:</strong> <span style='color:black'>" + d3.format(",.2f")(d.recovery_ratio) + "%</span><br>"
            ).style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px")
            .style('pointer-events', 'all');
        })
        .on("mouseout", function(){
            div.transition().duration(200).style("opacity", 0).style('pointer-events', 'none');})
        .merge(circles)
        .transition(t)
        .attr("cx", function(d){return x(d.confirmed);})
        .attr("cy",function(d){return y(d.fatality_ratio);})
        .attr("r",function(d){return d.fatality_ratio});
    };
}

scatterPlot();