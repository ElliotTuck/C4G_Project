// Create a bar chart showing the number of made/missed calls per month.
// Display the chart at the bottom of the page.
function visualizeHighLevel(callDataPerMonth, jsonWorkbookEntries) {
	console.log(callDataPerMonth);

	var width = window.innerWidth - 20,
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
				  .attr("height", height);

	// bind the data to screen elements
	var gEnter = svg.selectAll("g")
				    .data(callDataPerMonth)
				    .enter()
				    .append("g")
				    .on("click", function(d, i) {
				    	// get the call data for the selected month
				    	var callDataPerDay = getCallDataPerDay(jsonWorkbookEntries, i);

				    	// show a low-level view of the call data for the selected month
				    	visualizeLowLevel(callDataPerDay, jsonWorkbookEntries);

				    	// scroll to the bottom of the page
						$("body").delay(100).animate({ scrollTop: $(document).height()-$(window).height() }, 750);
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
function visualizeLowLevel(callDataPerDay, jsonWorkbookEntries) {
	console.log(callDataPerDay);

	var width = window.innerWidth - 20,
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
				  .attr("height", height);

	// bind the data to screen elements
	var gEnter = svg.selectAll("g")
				    .data(callDataPerDay)
				    .enter()
				    .append("g");

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
