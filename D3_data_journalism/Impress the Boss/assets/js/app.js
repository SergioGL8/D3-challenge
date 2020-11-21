// @TODO: YOUR CODE HERE!

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis, width) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
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

// Initial Params
var chosenYAxis = "obesity";

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis, height) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
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
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// function used for updating text group with a transition to
// new text
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return circletextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

    //conditioning x axis 
    if (chosenXAxis === "poverty") {
      var xlabel = "Poverty: ";
    } else if (chosenXAxis === "income") {
      var xlabel = "Median Income: "
    } else {
      var xlabel = "Age: ";
    }
    
    //conditioning y axis
    if (chosenYAxis === "healthcare") {
      var ylabel = "Lacks Healthcare: ";
    } else if (chosenYAxis === "smokes") {
      var ylabel = "Smokers: "
    } else {
      var ylabel = "Obesity: ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        if (chosenXAxis === "age") {

            // display Age without format for x axis
            return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
            } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
            
            // display Income in dollars for x axis
            return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
            } else {
            
            // display Poverty as percentage for x axis
            return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
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
    
    textGroup.on("mouseover", function(data){
        toolTip.show(data, this);
    })
    .on("mouseout", function(data){
        toolTip.hide(data);
    });
  
    return circlesGroup;
}

function scatter(){
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svgA = d3.select("#scatter")
    .select("svg");
    if (!svgA.empty()) {
        svgA.remove();
    }
    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // add SVG elements
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import Data
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
    var xLinearScale = xScale(healthData, chosenXAxis, height);
    var yLinearScale = yScale(healthData, chosenXAxis, width);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
    var elEnter = circlesGroup.enter()
    var circle = elEnter.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenXAxis]))
        .attr("r", 15)
        .attr("fill", "blue")
        .attr("opacity", ".5")
        .classed("stateCircle", true);

    // create circle text
    var circleText = elEnter.append("text")            
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", ".35em") 
    .text(d => d.abbr)
    .classed("stateText", true);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");
    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
     .attr("x", 0 - (height / 2))
     .attr("y", 40 - margin.left)
     .attr("dy", "1em")
     .attr("value", "healthcare")
     .classed("inactive", true)
     .text("Lacks Healthcare (%)");
    var smokeLabel = ylabelsGroup.append("text")
     .attr("x", 0 - (height / 2))
     .attr("y", 20 - margin.left)
     .attr("dy", "1em")
     .attr("value", "smokes")
     .classed("inactive", true)
     .text("Smokes (%)");
    var obeseLabel = ylabelsGroup.append("text")
     .attr("x", 0 - (height / 2))
     .attr("y", 0 - margin.left)
     .attr("dy", "1em")
     .attr("value", "obesity")
     .classed("active", true)
     .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);

    // update x axis 
    xlabelsGroup.selectAll("text")
    .on("click", function() {

        // get value of selection
        chosenXAxis = d3.select(this).attr("value");
        
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis, width);
        
        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        //updates labels
        if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        } else if (chosenXAxis === "age") {
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
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);

        // updates circletext
        circleText =  renderText(circleText, xLinearScale, yLinearScale, chosenYAxis, chosenXAxis);
    });

    // update y axis 
    ylabelsGroup.selectAll("text")
    .on("click", function() {

        // get value of selection
        chosenYAxis = d3.select(this).attr("value");
        
        // updates x scale for new data
        yLinearScale = xScale(healthData, chosenXAxis, chosenYAxis, height);
        
        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        //updates labels
        if (chosenYAxis === "healthcare") {
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            smokeLabel
                .classed("active", false)
                .classed("inactive", true);
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
        } else if (chosenYAxis === "smokes"){
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokeLabel
                .classed("active", true)
                .classed("inactive", false);
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
        } else {
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokeLabel
                .classed("active", false)
                .classed("inactive", true);
            obeseLabel
                .classed("active", true)
                .classed("inactive", false);
        
        }

        // updates circles with new x values
        circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);

        // updates circletext
        circleText = renderText(circleText, xLinearScale, yLinearScale, chosenYAxis, chosenXAxis);

    });

  }).catch(function(error) {
    console.log(error);
  });

