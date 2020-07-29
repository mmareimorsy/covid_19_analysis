/*
    scatter.js
    Covid 19 d3 visualization
    Gantt chart virus spread
    UIUC - CS498 Data Visualization
    mmorsy2
*/

function ganttChart(){
    // Dimensions of chart area
    var margin = { left:80, right:20, top:50, bottom:100 };
    var height = 500 - margin.top - margin.bottom, 
        width = 800 - margin.left - margin.right;

    // 3 different svgs for 3 different charts 
    var svg = d3.select("#gantt-area")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + 
                ", " + margin.top + ")");
            
        
        // X Scale
        var x = d3.scaleLinear().range([0, width]);
        // Y Scale
        var y = d3.scaleBand().range([0, height]).padding(0.2);

        // create x & y axis 
        var xAxisGroup = svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height +")");
        var yAxisGroup = svg.append("g").attr("class", "y axis");

        
    // X Label
    svg.append("text")
        .attr("y", height + 65)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Confirmed cases");

    // Y Label
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
    // Load all 3 CSV files via promises
    var promises = [
        d3.csv("data/confirmed.csv"),
    ];

    Promise.all(promises).then(function(allData){
        var confirmed = allData[0];
        var dates = confirmed.columns.slice(1,);
        // Initial update of Data
        update(confirmed, svg, x, y, xAxisGroup, yAxisGroup, dates[0]);
        var dateIndex = 0;
        var interval = d3.interval(function(){
            if (dateIndex < dates.length - 1){
                dateIndex = dateIndex + 1;
                update(confirmed, svg, x, y, xAxisGroup,yAxisGroup, dates[dateIndex]);
            }
            else{
                interval.stop();
            }
        },200)
    }).catch(function(error){
        console.log(error);
    })

    function update(data, svg, x, y ,xAxisGroup, yAxisGroup,dateInput){
        data = data.sort(function(a,b){
            return d3.descending(+a[dateInput], +b[dateInput]);
        })
        data = data.slice(0,10);
        
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

        // remove & add elements in the bar chart
        var rects = svg.selectAll("rect").data(data);
        rects.exit().transition(t).attr("x",x(0)).attr("width",0).remove();
        rects.enter()
            .append("rect")
            .attr("fill", "steelblue")
            // .attr("x", x(0))
            // .attr("width", function(d){return x(+d[dateInput]);})
            // .attr("y", function(d){return y(d.country); })
            // .attr("height", y.bandwidth())
            .merge(rects)
            .transition(t)
            .attr("x", x(0))
            .attr("width", function(d){return x(+d[dateInput]);})
            .attr("y", function(d){return y(d.country); })
            .attr("height", y.bandwidth());
    }
}

ganttChart();