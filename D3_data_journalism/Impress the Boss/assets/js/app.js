// @TODO: YOUR CODE HERE!

// Initial Params
var defaultXAxis = "poverty";
var defaultYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(data, defaultXAxis, chartWidth) {

    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[defaultXAxis]) * .8,
            d3.max(data, d => d[defaultXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, defaultYAxis, chartHeight) {

    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[defaultYAxis]) * .8,
            d3.max(data, d => d[defaultYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, defaultXAxis, defaultYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[defaultXAxis]))
        .attr("cy", d => newYScale(d[defaultYAxis]));
    return circlesGroup;
}

// function used for updating text group with a transition to
// new text
function renderText(circletextGroup, newXScale, newYScale, defaultXAxis, defaultYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[defaultXAxis]))
        .attr("y", d => newYScale(d[defaultYAxis]));
    return circletextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(defaultXAxis, defaultYAxis, circlesGroup, textGroup) {

    //conditioning x axis 
    if (defaultXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (defaultXAxis === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }

    //conditioning y axis
    if (defaultYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (defaultYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }

    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (defaultXAxis === "age") {

                // display Age without format for x axis
                return (`${d.state}<hr>${xlabel} ${d[defaultXAxis]}<br>${ylabel}${d[defaultYAxis]}%`);
                } else if (defaultXAxis !== "poverty" && defaultXAxis !== "age") {

                // display Income in dollars for x axis
                return (`${d.state}<hr>${xlabel}$${d[defaultXAxis]}<br>${ylabel}${d[defaultYAxis]}%`);
                } else {

                // display Poverty as percentage for x axis
                return (`${d.state}<hr>${xlabel}${d[defaultXAxis]}%<br>${ylabel}${d[defaultYAxis]}%`);
                }      
        });
    circlesGroup.call(toolTip);

    //onmouseover information
    circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
    
        // onmouseout event
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

function Scatter() {

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svgArea = d3.select("#scatter").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // create dimensions
    var svgWidth = 1000;
    var svgHeight = 750;

    var margin = {
        top: 40,
        right: 40,
        bottom: 100,
        left: 80
    };

    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    // add SVG elements
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // import data
    d3.csv("assets/data/data.csv").then(function(healthData, err) {
        if (err) throw err;

        // Parse Data/Cast as numbers
        healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });

        // xLinearScale function above csv import
        var xLinearScale = xScale(healthData, defaultXAxis, chartWidth);
        var yLinearScale = yScale(healthData, defaultYAxis, chartHeight);

        // Create initial axis functions
        var bottomAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // append y axis    
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData);
        var elemEnter = circlesGroup.enter();

        // create circles
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[defaultXAxis]))
            .attr("cy", d => yLinearScale(d[defaultYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);

        // create circle text
        var circleText = elemEnter.append("text")            
            .attr("x", d => xLinearScale(d[defaultXAxis]))
            .attr("y", d => yLinearScale(d[defaultYAxis]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);

        // Create group for three x-axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Create group for three y-axis labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("active", true)
            .text("Obese (%)");
        
        // update x axis
        xLabelsGroup.selectAll("text")
            .on("click", function() {

                // get value of selection
                defaultXAxis = d3.select(this).attr("value");

                // update xscale for new data
                xLinearScale = xScale(healthData, defaultXAxis, chartWidth);
                
                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);
                
                // update labels
                if (defaultXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (defaultXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                // updates circles with new x values
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);

                // update tooltip with new info
                circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);
                
                // update circletext
                circleText = renderText(circleText, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);
            });

        // update y axis
        yLabelsGroup.selectAll("text")
            .on("click", function() {

                // get value of selection
                defaultYAxis = d3.select(this).attr("value");
                
                // updates y scale for new data
                yLinearScale = yScale(healthData, defaultYAxis, chartHeight);
                
                // updates x axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);
                
                // update labels
                if (defaultYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (defaultYAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                // updates circles with new x values
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);
                
                // updates tooltips with new info
                circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);
                
                // update circletext
                circleText = renderText(circleText, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);

            });
    }).catch(function(err) {
        console.log(err);
    });
}
Scatter();