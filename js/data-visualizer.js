// Create a bar chart showing the number of made/missed calls per month.
// Display the chart at the bottom of the page.
function visualizeHighLevel(callDataPerMonth, jsonWorkbookEntries, years) {
	var width = window.innerWidth - 100,
		height = window.innerHeight / 2,
		barpadding = 1,
		maxCalls = d3.max(callDataPerMonth, function(d) { return d.numCallsTotal; }),
		heightScale = d3.scale.linear()
				  			  .domain([0, maxCalls])
				  			  .range([0, height]),
		xScale = d3.scale.ordinal()
						 .domain(d3.range(callDataPerMonth.length))
						 .rangeRoundBands([0, width], 0.05),
		svg = d3.select("body")
				.append("svg")
				  .attr("width", width)
				  .attr("height", height),
		expanded = false;

	// bind the data to screen elements
	var gEnter = svg.selectAll("g")
				    .data(callDataPerMonth)
				    .enter()
				    .append("g")
				    .on("click", function(d, i) {
				    	if (!expanded) {
				    		// convert i to a month index [0, 11]
				    		i %= 12;

					    	// get the call data for the selected month
					    	var callDataPerDay = getCallDataPerDay(jsonWorkbookEntries, i, years);

					    	// show a low-level view of the call data for the selected month
					    	visualizeMidLevel(callDataPerDay, jsonWorkbookEntries, years);

					    	// scroll to the bottom of the page
							$("body").delay(100).animate({ scrollTop: $(document).height()-$(window).height() }, 750);

							expanded = true;
						}
				    });

	// create bars
	gEnter.append("rect")
		    .attr("class", "made-call-bar")
		    .attr("x", function(d, i) { return xScale(i); })
		    .attr("y", function(d) { return height - heightScale(d.numMadeCalls); })
		    .attr("width", xScale.rangeBand())
		    .attr("height", function(d) { return heightScale(d.numMadeCalls); })

	gEnter.append("rect")
	        .attr("class", "missed-call-bar")
	        .attr("x", function(d, i) { return xScale(i); })
	        .attr("y", function(d) { return height - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
	        .attr("width", xScale.rangeBand())
	        .attr("height", function(d) { return heightScale(d.numMissedCalls); })

	// create bar labels
	gEnter.append("text")
		  .text(function(d) { return d.numMadeCalls; })
	      .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
	      .attr("y", function(d) { return height - heightScale(d.numMadeCalls) + 13; })
	      .attr("text-anchor", "middle")
	      .style("font-family", "sans-serif")
	      .style("fill", "white")
	      .style("font-size", "12px");

	gEnter.append("text")
		  .text(function(d) { return d.numMissedCalls; })
	      .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
	      .attr("y", function(d) { return height - heightScale(d.numCallsTotal) + 13; })
	      .attr("text-anchor", "middle")
	      .style("font-family", "sans-serif")
	      .style("fill", "white")
	      .style("font-size", "12px");
}

// Create a bar chart showing the number of made/missed calls per day in a given month.
// Display the chart at the bottom of the page, beneath any other charts.
function visualizeMidLevel(callDataPerDay, jsonWorkbookEntries, years) {
	var width = window.innerWidth - 100,
		height = window.innerHeight / 2,
		barpadding = 1,
		maxCalls = d3.max(callDataPerDay, function(d) { return d.numCallsTotal; }),
		heightScale = d3.scale.linear()
				  			  .domain([0, maxCalls])
				  			  .range([0, height]),
		xScale = d3.scale.ordinal()
						 .domain(d3.range(callDataPerDay.length))
						 .rangeRoundBands([0, width], 0.05),
		svg = d3.select("body")
				.append("svg")
				  .attr("width", width)
				  .attr("height", height),
		expanded = false;

	// bind the data to screen elements
	var gEnter = svg.selectAll("g")
				    .data(callDataPerDay)
				    .enter()
				    .append("g")
				    .on("click", function(d, i) {
				    	if (!expanded) {
				    		// the month of the callDataPerDay entry
				    		var month = d.month;

				    		// convert i to a day index [0, 30]
				    		i %= 31;

					    	// get the call data for the selected day
					    	var callDataPerHour = getCallDataPerHour(jsonWorkbookEntries, month, i, years);

					    	// show a low-level view of the call data for the selected month
					    	visualizeLowLevel(callDataPerHour, jsonWorkbookEntries);

					    	// scroll to the bottom of the page
							$("body").delay(100).animate({ scrollTop: $(document).height()-$(window).height() }, 750);

							expanded = true;
						} else {   // DOM elements already exists, just bind the new data to them
							// the month of the callDataPerDay entry
				    		var month = d.month;

				    		// convert i to a day index [0, 30]
				    		i %= 31;

					    	// get the call data for the selected day
					    	var callDataPerHour = getCallDataPerHour(jsonWorkbookEntries, month, i, years);

					    	// revisualize the data
					    	revisualizeLowLevel(callDataPerHour, jsonWorkbookEntries);
						}
				    });

	// create bars
	gEnter.append("rect")
		    .attr("class", "made-call-bar")
		    .attr("x", function(d, i) { return xScale(i); })
		    .attr("y", height)
		    .attr("width", xScale.rangeBand())
		    .attr("height", 0)
		    .transition()
		    .delay(function(d, i) { return 500 + (i / callDataPerDay.length) * 1000; })
		    .duration(500)
		    .attr("y", function(d) { return height - heightScale(d.numMadeCalls); })
		    .attr("height", function(d) { return heightScale(d.numMadeCalls); })

	gEnter.append("rect")
	        .attr("class", "missed-call-bar")
	        .attr("x", function(d, i) { return xScale(i); })
	        .attr("y", height)
	        .attr("width", xScale.rangeBand())
	        .attr("height", 0)
		    .transition()
		    .delay(function(d, i) { return 500 + (i / callDataPerDay.length) * 1000; })
		    .duration(500)
	        .attr("y", function(d) { return height - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
	        .attr("height", function(d) { return heightScale(d.numMissedCalls); })

	// create bar labels
	gEnter.append("text")
		  .text(function(d) { return d.numMadeCalls; })
	      .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
	      .attr("y", height)
	      .attr("text-anchor", "middle")
	      .style("font-family", "sans-serif")
	      .style("fill", "white")
	      .style("font-size", "12px")
	      .style("opacity", 0)
	      .transition()
	      .delay(function(d, i) { return 500 + (i / callDataPerDay.length) * 1000; })
	      .duration(500)
	      .attr("y", function(d) { return height - heightScale(d.numMadeCalls) + 13; })
	      .style("opacity", 1);

	gEnter.append("text")
		  .text(function(d) { return d.numMissedCalls; })
	      .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
	      .attr("y", height)
	      .attr("text-anchor", "middle")
	      .style("font-family", "sans-serif")
	      .style("fill", "white")
	      .style("font-size", "12px")
	      .style("opacity", 0)
	      .transition()
	      .delay(function(d, i) { return 500 + (i / callDataPerDay.length) * 1000; })
	      .duration(500)
	      .attr("y", function(d) { return height - heightScale(d.numCallsTotal) + 13; })
	      .style("opacity", 1);
}

// Create a bar chart showing the number of made/missed calls per hour in a given day.
// Display the chart at the bottom of the page, beneath any other charts.
function visualizeLowLevel(callDataPerHour, jsonWorkbookEntries) {
	var width = window.innerWidth - 100,
		height = window.innerHeight / 2,
		barpadding = 1,
		scalePadding = 25;
		maxCalls = d3.max(callDataPerHour, function(d) { return d.numCallsTotal; }),
		heightScale = d3.scale.linear()
				  			  .domain([0, maxCalls])
				  			  .range([0, height - scalePadding]),
		xScale = d3.scale.ordinal()
						 .domain(d3.range(callDataPerHour.length))
						 .rangeRoundBands([0, width], 0.05),
		svg = d3.select("body")
				.append("svg")
				  .attr("id", "svg-low-level")
				  .attr("width", width)
				  .attr("height", height);

	// bind the data
	var gEnter = svg.selectAll("g")
				    .data(callDataPerHour)
				    .enter()
				    .append("g");

	// create bars
	gEnter.append("rect")
		    .attr("class", "made-call-bar")
		    .attr("x", function(d, i) { return xScale(i); })
		    .attr("y", height)
		    .attr("width", xScale.rangeBand())
		    .attr("height", 0)
		    .transition()
		    .delay(function(d, i) { return 500 + (i / callDataPerHour.length) * 1000; })
		    .duration(500)
		    .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numMadeCalls); })
		    .attr("height", function(d) { return heightScale(d.numMadeCalls); });

	gEnter.append("rect")
	        .attr("class", "missed-call-bar")
	        .attr("x", function(d, i) { return xScale(i); })
	        .attr("y", height)
	        .attr("width", xScale.rangeBand())
	        .attr("height", 0)
		    .transition()
		    .delay(function(d, i) { return 500 + (i / callDataPerHour.length) * 1000; })
		    .duration(500)
	        .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
	        .attr("height", function(d) { return heightScale(d.numMissedCalls); });

	// create bar labels
	gEnter.append("text")
		  .attr("class", "made-call-bar-label")
		  .text(function(d) { return d.numMadeCalls; })
	      .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
	      .attr("y", height)
	      .attr("text-anchor", "middle")
	      .style("font-family", "sans-serif")
	      .style("fill", "white")
	      .style("font-size", "12px")
	      .style("opacity", 0)
	      .transition()
	      .delay(function(d, i) { return 500 + (i / callDataPerHour.length) * 1000; })
	      .duration(500)
	      .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numMadeCalls) + 13; })
	      .style("opacity", function(d) { return d.numMadeCalls < 2 ? 0 : 1; });

	gEnter.append("text")
		  .attr("class", "missed-call-bar-label")
		  .text(function(d) { return d.numMissedCalls; })
	      .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
	      .attr("y", height)
	      .attr("text-anchor", "middle")
	      .style("font-family", "sans-serif")
	      .style("fill", "white")
	      .style("font-size", "12px")
	      .style("opacity", 0)
	      .transition()
	      .delay(function(d, i) { return 500 + (i / callDataPerHour.length) * 1000; })
	      .duration(500)
	      .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numCallsTotal) + 13; })
	      .style("opacity", function(d) { return d.numMissedCalls < 2 ? 0 : 1; });

	// create the horizontal axis
	var xAxis = d3.svg.axis()
					  .scale(xScale)
					  .orient("bottom")
	svg.append("g")
		.attr("transform", "translate(0," + (height - scalePadding) + ")")
		.call(xAxis);
}

// Revisualize the low-level data.
function revisualizeLowLevel(callDataPerHour, jsonWorkbookEntries) {
	var width = window.innerWidth - 100,
		height = window.innerHeight / 2,
		barpadding = 1,
		scalePadding = 25;
		maxCalls = d3.max(callDataPerHour, function(d) { return d.numCallsTotal; }),
		heightScale = d3.scale.linear()
				  			  .domain([0, maxCalls])
				  			  .range([0, height - scalePadding]),
		xScale = d3.scale.ordinal()
						 .domain(d3.range(callDataPerHour.length))
						 .rangeRoundBands([0, width], 0.05),
		svg = d3.select("body")
				.select("#svg-low-level");

	// bind the new data to the old DOM elements
	var gUpdate = svg.selectAll("g")
				     .data(callDataPerHour);

	// update bars
	gUpdate.select(".made-call-bar")
		  .transition()
		  .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
		  .duration(500)
		  .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numMadeCalls); })
		  .attr("height", function(d) { return heightScale(d.numMadeCalls); });

	gUpdate.select(".missed-call-bar")
		  .transition()
		  .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
		  .duration(500)
	      .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
	      .attr("height", function(d) { return heightScale(d.numMissedCalls); });

	// update bar labels
	gUpdate.select(".made-call-bar-label")
	      .transition()
	      .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
	      .duration(500)
		  .text(function(d) { return d.numMadeCalls; })
	      .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numMadeCalls) + 13; })
	      .style("opacity", function(d) { return d.numMadeCalls < 2 ? 0 : 1; });

	gUpdate.select(".missed-call-bar-label")
	      .transition()
	      .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
	      .duration(500)
		  .text(function(d) { return d.numMissedCalls; })
	      .attr("y", function(d) { return (height - scalePadding) - heightScale(d.numCallsTotal) + 13; })
	      .style("opacity", function(d) { return d.numMissedCalls < 2 ? 0 : 1; });
}
