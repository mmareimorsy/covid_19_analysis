/*
    scatter.js
    Covid 19 d3 visualization
    Gantt chart virus spread
    UIUC - CS498 Data Visualization
    mmorsy2
*/

// Continent Color global variable 
// var continentColor = d3.scaleOrdinal(d3.schemeDark2);
var continentColor = d3.scaleOrdinal(d3.schemeSet1);
// var continentColor = d3.scaleOrdinal(["red","green","blue","","yellow","orange"]);
var continents = ["Africa", "Asia", "Europe",  "North America", "South America", "Oceania"];

// Entry function to draw the gantt chart 
function ganttChart(){
    // Dimensions of chart area
    var margin = { left:80, right:20, top:20, bottom:100 };
    var height = 500 - margin.top - margin.bottom, 
        width = 800 - margin.left - margin.right;

    
    // svg for gantt chart 
    var svg = d3.select("#gantt-area")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + 
                ", " + margin.top + ")");
    
    // line for annotation when it is triggered 
    svg.append("line")
        .attr("id", "annotation-line")
        .attr("x1",0)
        .attr("x2",0)
        .attr("y1",0)
        .attr("y2",0);
    
    // text for annotation when triggered
    svg.append("text")
        .attr("id", "annotation-text")
        .attr("x",0)
        .attr("y",0);

    // X Scale 
    var x = d3.scaleLinear().range([0, width]);
    // Y Scale 
    var y = d3.scaleBand().range([0, height]).padding(0.2);

    // create x & y axis 
    var xAxisGroup = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")");
    
    var yAxisGroup = svg.append("g")
        .attr("class", "y axis");

        
    // X Label
    svg.append("text")
        .attr("y", height + 65)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Confirmed cases");

    // Y Label confirmed cases
    svg.append("text")
        .attr("y", -60)
        .attr("x", -(height / 2))
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Country");

    // Text for date 
    var timeLabel = svg.append("text")
        .attr("y", height - 100)
        .attr("x", width - 40)
        .attr("font-size", "25px")
        .attr("opacity", "0.4")
        .attr("text-anchor", "middle");

    // Legend for continents
    var margin_legend = { left:40, right:20, top:10, bottom:10 };
    var height_legend = 30 - margin_legend.top - margin_legend.bottom, 
        width_legend = 800 - margin_legend.left - margin_legend.right;
    
    var legend = d3.select("#continent-legend").append("svg")
        .attr("width", width_legend + margin_legend.left + margin_legend.right)
        .attr("height", height_legend + margin_legend.top + margin_legend.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_legend.left + 
        ", " + margin_legend.top + ")");
    
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
        d3.csv("data/confirmed.csv"),
        d3.csv("data/continents.csv")
    ];

    Promise.all(promises).then(function(allData){
        var confirmed = allData[0];
        var continentsMap = allData[1];
        var dates = confirmed.columns.slice(1,);

        // annotation section 
        var annotate = false;
                

        // Initial update of Data
        update(confirmed, dates[0], continentsMap, annotate);
        var interval;
        var dateIndex = 0;

        d3.select("#play-gantt").on("click", function(){
            var button = d3.select("#play-gantt");
            if (button.text() == "Start"){
                button.text("Stop");
                interval = d3.interval(function(){
                    if (dateIndex < dates.length - 1){
                        annotate = true;
                        dateIndex = dateIndex + 1;
                        update(confirmed, dates[dateIndex], continentsMap, annotate);
                    }
                    else{
                        button.text("Start");
                        dateIndex = 0;
                        interval.stop();
                    }
                },200);
            }
            else{
                button.text("Start");
                interval.stop();
            }
        });
        
        d3.select("#reset-gantt").on("click", function(){
            dateIndex = 0;
            update(confirmed, dates[dateIndex], continentsMap, annotate);
        });
        
    }).catch(function(error){
        console.log(error);
    })

    function update(data, dateInput, continentsMap, annotate){
        // console.log(annotate);
        data = data.sort(function(a,b){
            return d3.descending(+a[dateInput], +b[dateInput]);
        })
        data = data.slice(0,10);

        //get Continents
        var countriesToShow = Array.from(data, function(d){return d.country;});
        function getContinent(countryInput){
            var row = continentsMap.filter(function(d){return d.country == countryInput;});
            return row[0].continent;
        }
        var continentsToShow = Array()
        for (i = 0 ; i < countriesToShow.length; i++){
             continentsToShow.push(getContinent(countriesToShow[i]));
        }
        // Define transition 
        var t = d3.transition().duration(500);
        
        timeLabel.text(dateInput).transition(t);

        // Define extents of data for x & y axis
        var xDomain = [0,d3.max(data, function(d){return +d[dateInput];})];
        var yDomain = Array.from(data, function(d){return d.country;});
        
        x.domain(xDomain);
        y.domain(yDomain);
        
        // X Axis
        var xAxisCall = d3.axisBottom(x);
        xAxisGroup.transition(t).call(xAxisCall);
        
        // Y Axis
        var yAxisCall = d3.axisLeft(y);
        yAxisGroup.transition(t).call(yAxisCall);

        var toolTipText = Array.from(data, function(d){
            return ("<strong>Confirmed Cases:</strong> <span style='color:yellow'>" + d3.format(",")(d[dateInput]) + "</span><br>")
        })
        // remove & add elements in the bar chart
        var rects = svg.selectAll("rect").data(toolTipText);
        rects.exit()
            .transition(t)
            .attr("x",x(0))
            .attr("width",0)
            .remove();

        rects.enter()
            .append("rect")
            .on("mouseover", function(d,i){
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
            .attr("x", x(0))
            .attr("width", function(d,i){return x(+data[i][dateInput]);})
            .attr("y", function(d,i){return y(data[i].country); })
            .attr("height", y.bandwidth())
            .attr("fill", function(d,i){return continentColor(continentsToShow[i]);});
        
        // trigger annotation once the graph reaches the last step
        if (annotate == true){
            svg.append("marker")
                .attr("id", "arrowhead")
                .attr("refX", 6)
                .attr("refY", 6)
                .attr("markerWidth", 30)
                .attr("markerHeight", 30)
                .attr("markerUnits", "userSpaceOnUse")
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M 0 0 12 6 0 12 3 6")
                .style("fill",continentColor(continentsToShow[0]));

            var line = d3.select("#annotation-line");

            line.transition(t)
                .attr("x1", x(+data[0][dateInput])-150)
                .attr("y1", y(data[0].country)+280)
                .attr("x2", x(+data[0][dateInput])-5)
                .attr("y2", y(data[0].country)+(y.bandwidth())+5)
                .attr("stroke-width", 3)
                .attr("marker-end", "url(#arrowhead)")
                .attr("stroke", continentColor(continentsToShow[0]));
            
            var annotationText = d3.select("#annotation-text");
            annotationText
                .attr("class", "annotation")
                .transition(t)
                .attr("x",x(+data[0][dateInput])-150)
                .attr("y",y(data[0].country)+280)
                .attr("font-family","sans-serif")
                .attr("font-size",15)
                .style("fill",continentColor(continentsToShow[0]))
                .style("text-decoration","underline")
                .attr("text-anchor", "end")
            
            var annotation = d3.select(".annotation")
                .html("Top country for confirmed cases is " + data[0].country + " at " + d3.format(",")(+data[0][dateInput]) + " cases");
        }
    }
}

ganttChart();
