/**
Create and display a bar chart showing the number of made/missed calls per year.

Inputs:
callDataPerYear: array of call data objects, indexed by year, including one entry per
	each year of the aggregate call data
jsonWorkbookEntries: JSON object of all the Excel entries
years: array of the years of data
*/
function visualizeYearLevel(callDataPerYear, jsonWorkbookEntries, years) {

	/*********************/
	/* Useful variables. */
	/*********************/

	// The width of the SVG element.
	var width = window.innerWidth - 100;
	// The height of the SVG element.
	var	height = window.innerHeight / 2;
	// Display padding for the horizontal axis.
	var	axisPadding = 25;
	// Display padding for call bar labels.
	var labelPadding = 13;
	// The maximum number of calls for any year in callDataPerYear.
	var	maxCalls = d3.max(callDataPerYear, function(d) { return d.numCallsTotal; });
	// A quantitative scale that maps call quantity to on-screen bar height.
	var	heightScale = d3.scale.linear()
		.domain([0, maxCalls])
		.range([0, height - axisPadding]);
	// An ordinal scale that maps entries in callDataPerYear to horizontal on-screen locations.
	var	xScale = d3.scale.ordinal()
		.domain(d3.range(callDataPerYear.length))
		.rangeRoundBands([0, width], 0.05);
	// The SVG element for year-level visualizations.
	var	svg = d3.select("#svg-year-level")
		.attr("width", width)
		.attr("height", height);
	// A boolean describing whether or not a lower-level chart has been displayed.
	var	expanded = false;

	/***********************/
	/* Visualize the data. */
	/***********************/

	// bind the data to new DOM elements (initially an empty selection of DOM elements, 
	// as no prior visualization has been made)
	var gEnter = svg.selectAll("g")
	    .data(callDataPerYear)
	    .enter()
	    .append("g")
	    .on("click", function(d, i) {
	    	if (!expanded) {
		    	// get the call data for the selected month
		    	var callDataPerMonth = getCallDataPerMonth(jsonWorkbookEntries, i, years);

		    	// show a month-level view of the call data for the selected year
		    	visualizeMonthLevel(callDataPerMonth, jsonWorkbookEntries, years);

		    	// scroll to the bottom of the page (for a nice visual effect)
				$("body").delay(100)
					.animate({ scrollTop: $(document).height() - $(window).height() }, 750);

				// month-level visualization has been created
				expanded = true;
			}
	    });

	/* create bars */

	// create bars for made calls
	gEnter.append("rect")
	    .attr("class", "made-call-bar")
	    .attr("x", function(d, i) { return xScale(i); })
	    .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls); })
	    .attr("width", xScale.rangeBand())
	    .attr("height", function(d) { return heightScale(d.numMadeCalls); })

	// create bars for missed calls
	gEnter.append("rect")
        .attr("class", "missed-call-bar")
        .attr("x", function(d, i) { return xScale(i); })
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) { return heightScale(d.numMissedCalls); })

	/* create bar labels */

	// create bar labels for made calls
	gEnter.append("text")
	    .text(function(d) { return d.numMadeCalls; })
        .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) + labelPadding; })
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("fill", "white")
        .style("font-size", "12px");

    // create bar labels for missed calls
	gEnter.append("text")
	    .text(function(d) { return d.numMissedCalls; })
        .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numCallsTotal) + labelPadding; })
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("fill", "white")
        .style("font-size", "12px");

    /* create the horizontal axis */
    var d = [];
	for (var i = 0; i < years.length; i++) {
		d.push(years[i]);
	}
	var xAxis = d3.svg.axis()
		.scale(xScale.domain(d))
		.orient("bottom");
	svg.append("g")
		.attr("transform", "translate(0," + (height - axisPadding) + ")")
		.call(xAxis);

}

/**
Create and display a bar chart showing the number of made/missed calls per month.

Inputs:
callDataPerMonth: array of call data objects, indexed by month, including an entry for
	all months of the year for each element of years
jsonWorkbookEntries: JSON object of all the Excel entries
years: array of years that the data spans
*/
function visualizeMonthLevel(callDataPerMonth, jsonWorkbookEntries, years) {

	/*********************/
	/* Useful variables. */
	/*********************/

	// The width of the SVG element.
	var width = window.innerWidth - 100;
	// The height of the SVG element.
	var	height = window.innerHeight / 2;
	// Display padding for the horizontal axis.
	var	axisPadding = 25;
	// Display padding for call bar labels.
	var labelPadding = 13;
	// The maximum number of calls for any month in callDataPerMonth.
	var	maxCalls = d3.max(callDataPerMonth, function(d) { return d.numCallsTotal; });
	// A quantitative scale that maps call quantity to on-screen bar height.
	var	heightScale = d3.scale.linear()
		.domain([0, maxCalls])
		.range([0, height - axisPadding]);
	// An ordinal scale that maps entries in callDataPerMonth to horizontal on-screen locations.
	var	xScale = d3.scale.ordinal()
		.domain(d3.range(callDataPerMonth.length))
		.rangeRoundBands([0, width], 0.05);
	// The SVG element for high-level visualizations.
	var	svg = d3.select("#svg-month-level")
		.attr("width", width)
		.attr("height", height);
	// A boolean describing whether or not a lower-level chart has been displayed.
	var	expanded = false;

	/***********************/
	/* Visualize the data. */
	/***********************/

	// bind the data to new DOM elements (initially an empty selection of DOM elements, 
	// as no prior visualization has been performed)
	var gEnter = svg.selectAll("g")
	    .data(callDataPerMonth)
	    .enter()
	    .append("g")
	    .on("click", function(d, i) {
	    	if (!expanded) {
	    		// convert i to a month index [0, 11]
	    		var month = i %= 12;

		    	// get the call data for the selected month
		    	var callDataPerDay = getCallDataPerDay(jsonWorkbookEntries, month, years);

		    	// show a day-level view of the call data for the selected month
		    	visualizeDayLevel(callDataPerDay, jsonWorkbookEntries, years);

		    	// scroll to the bottom of the page (for a nice visual effect)
				$("body").delay(100)
					.animate({ scrollTop: $(document).height() - $(window).height() }, 750);

				// mid-level visualization has been created
				expanded = true;
			}
	    });

	/* create bars */

	// create bars for made calls
	gEnter.append("rect")
	    .attr("class", "made-call-bar")
	    .attr("x", function(d, i) { return xScale(i); })
	    .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls); })
	    .attr("width", xScale.rangeBand())
	    .attr("height", function(d) { return heightScale(d.numMadeCalls); })

	// create bars for missed calls
	gEnter.append("rect")
        .attr("class", "missed-call-bar")
        .attr("x", function(d, i) { return xScale(i); })
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) { return heightScale(d.numMissedCalls); })

	/* create bar labels */

	// create bar labels for made calls
	gEnter.append("text")
	    .text(function(d) { return d.numMadeCalls; })
        .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) + labelPadding; })
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("fill", "white")
        .style("font-size", "12px");

    // create bar labels for missed calls
	gEnter.append("text")
	    .text(function(d) { return d.numMissedCalls; })
        .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numCallsTotal) + labelPadding; })
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("fill", "white")
        .style("font-size", "12px");

    /* create the horizontal axis */
    var d = [];
	for (var i = 0; i < years.length; i++) {
		d.push("Jan.");
		d.push("Feb.");
		d.push("Mar.");
		d.push("Apr.");
		d.push("May");
		d.push("June");
		d.push("July");
		d.push("Aug.");
		d.push("Sep.");
		d.push("Oct.");
		d.push("Nov.");
		d.push("Dec.");
	}
	var xAxis = d3.svg.axis()
		.scale(xScale.domain(d))
		.orient("bottom");
	svg.append("g")
		.attr("transform", "translate(0," + (height - axisPadding) + ")")
		.call(xAxis);
}

/**
Create and display a bar chart showing the number of made/missed calls per day in a selected
month. If there is more than one year of data, then the monthly charts for each year will be 
displayed side by side.

Inputs:
callDataPerDay: array of call data objects, indexed by day, including an entry for all
	days of the month for each element of years
jsonWorkbookEntries: JSON object of all the Excel entries
years: array of years that the data spans
*/
function visualizeDayLevel(callDataPerDay, jsonWorkbookEntries, years) {

	/*********************/
	/* Useful variables. */
	/*********************/

	// The width of the SVG element.
	var width = window.innerWidth - 100;
	// The height of the SVG element.
	var	height = window.innerHeight / 2;
	// Display padding for the horizontal axis.
	var	axisPadding = 25;
	// Display padding for call bar labels.
	var labelPadding = 13;
	// The maximum number of calls for any day in callDataPerDay.
	var	maxCalls = d3.max(callDataPerDay, function(d) { return d.numCallsTotal; });
	// A quantitative scale that maps call quantity to on-screen bar height.
	var	heightScale = d3.scale.linear()
		.domain([0, maxCalls])
		.range([0, height - axisPadding]);
	// An ordinal scale that maps entries in callDataPerDay to horizontal on-screen locations.
	var	xScale = d3.scale.ordinal()
		.domain(d3.range(callDataPerDay.length))
		.rangeRoundBands([0, width], 0.05);
	// The SVG element for mid-level visualizations.
	var	svg = d3.select("#svg-day-level")
		.attr("width", width)
		.attr("height", height);

	/***********************/
	/* Visualize the data. */
	/***********************/

	// bind the data to new DOM elements (initially an empty selection of DOM elements, 
	// as no prior visualization has been performed)
	var gEnter = svg.selectAll("g")
	    .data(callDataPerDay)
	    .enter()
	    .append("g")
	    .on("click", function(d, i) {
	    	// check if a lower-level visualization exists for any of the days in this month
	    	var visualExists = checkIfAnyExpanded(callDataPerDay);

	    	if (!visualExists) {   // no visualization exists yet, so create a new one
	    		// the month of the callDataPerDay entry
	    		var month = d.month;

	    		// convert i to a day index [0, 30]
	    		var day = i %= 31;

		    	// get the call data for the selected day
		    	var callDataPerHour = getCallDataPerHour(jsonWorkbookEntries, month, day, years);

		    	// show an hour-level view of the call data for the selected month
		    	visualizeHourLevel(callDataPerHour, jsonWorkbookEntries);

		    	// scroll to the bottom of the page
				$("body").delay(100)
					.animate({ scrollTop: $(document).height() - $(window).height() }, 750);

				// low-level visualization has been created for this month
				d.expanded = true;
				d3.select(this)
					.select(".made-call-bar")
					  .classed("selected-made-call-bar", true);
				d3.select(this)
					.select(".missed-call-bar")
					  .classed("selected-missed-call-bar", true);
			} else {   // a lower-level visualization already exists
				// whether or not the low-level visualization is for this month
	    		var expanded = d.expanded;

				if (expanded) {   // the present low-level visualization is for this month
					// delete the visualization (and any others below it)
					d3.select("#svg-hour-level")
					  .selectAll("g")
						.remove();
					d3.select("#svg-hour-level")
						.transition()
						.duration(1000)
						.attr("width", 0)
						.attr("height", 0);

					// lower-level visualization for this month has been removed
					d.expanded = false;
					d3.select(this)
						.select(".made-call-bar")
						  .classed("selected-made-call-bar", false);
					d3.select(this)
						.select(".missed-call-bar")
						  .classed("selected-missed-call-bar", false);
				} else {   // the present low-level visualization is not for this month
					// clear expanded of all entries
					clearExpanded(callDataPerDay);

					// the month of the callDataPerDay entry
		    		var month = d.month;

		    		// convert i to a day index [0, 30]
		    		var day = i %= 31;

			    	// get the call data for the selected day
			    	var callDataPerHour = getCallDataPerHour(jsonWorkbookEntries, month, day, years);

			    	// revisualize the data
			    	revisualizeHourLevel(callDataPerHour, jsonWorkbookEntries);

			    	// a visualization has been made for this month
			    	d.expanded = true;
			    	d3.select("#svg-day-level")
			    		.select(".selected-made-call-bar")
			    		  .classed("selected-made-call-bar", false);
			    	d3.select("#svg-day-level")
			    		.select(".selected-missed-call-bar")
			    		  .classed("selected-missed-call-bar", false);
			    	d3.select(this)
						.select(".made-call-bar")
						  .classed("selected-made-call-bar", true);
					d3.select(this)
						.select(".missed-call-bar")
						  .classed("selected-missed-call-bar", true);
		    	}
			}
	    });

	/* create bars */

	// create bars for made calls
	gEnter.append("rect")
	    .attr("class", "made-call-bar")
	    .attr("x", function(d, i) { return xScale(i); })
	    .attr("y", height)
	    .attr("width", xScale.rangeBand())
	    .attr("height", 0)
	    .transition()
	    .delay(function(d, i) { return 500 + (i / callDataPerDay.length) * 1000; })
	    .duration(500)
	    .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls); })
	    .attr("height", function(d) { return heightScale(d.numMadeCalls); })

	// create bars for missed calls
	gEnter.append("rect")
        .attr("class", "missed-call-bar")
        .attr("x", function(d, i) { return xScale(i); })
        .attr("y", height)
        .attr("width", xScale.rangeBand())
        .attr("height", 0)
	    .transition()
	    .delay(function(d, i) { return 500 + (i / callDataPerDay.length) * 1000; })
	    .duration(500)
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
        .attr("height", function(d) { return heightScale(d.numMissedCalls); })

	/* create bar labels */

	// create bar labels for made calls
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
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) + labelPadding; })
        .style("opacity", 1);

    // create bar labels for missed calls
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
        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numCallsTotal) + labelPadding; })
        .style("opacity", 1);

    /* create the horizontal axis */
	var xAxis = d3.svg.axis()
		.scale(xScale.domain(d3.range(1, callDataPerDay.length + 1)))
		.orient("bottom");
	svg.append("g")
		.attr("transform", "translate(0," + (height - axisPadding) + ")")
		.call(xAxis);
}

/**
Create and display a bar chart showing the number of made/missed calls per hour in a selected
day. If there is more than one year of data, then the daily charts for each year will be 
displayed side by side.

Inputs:
callDataPerHour: array of call data objects, indexed by day, including an entry for all
	hours in a day for each year
jsonWorkbookEntries: JSON object of all the Excel entries
*/
function visualizeHourLevel(callDataPerHour, jsonWorkbookEntries) {

	/*********************/
	/* Useful variables. */
	/*********************/

	// The width of the SVG element.
	var width = window.innerWidth - 100;
	// The height of the SVG element.
	var	height = window.innerHeight / 2;
	// Display padding for the horizontal axis.
	var	axisPadding = 25;
	// Display padding for the bar labels.
	var	labelPadding = 13;
	// The maximum number of calls per hour in callDataPerHour.
	var	maxCalls = d3.max(callDataPerHour, function(d) { return d.numCallsTotal; });
	// A quantitative scale that maps call quantity to on-screen bar height.
	var	heightScale = d3.scale.linear()
		.domain([0, maxCalls])
		.range([0, height - axisPadding]);
	// An ordinal scale that maps entries in callDataPerDay to horizontal on-screen locations.
	var	xScale = d3.scale.ordinal()
		.domain(d3.range(callDataPerHour.length))
		.rangeRoundBands([0, width], 0.05);
	// The SVG element for low-level visualizations.
	var	svg = d3.select("#svg-hour-level")
		.attr("width", width)
		.attr("height", height);

	/***********************/
	/* Visualize the data. */
	/***********************/

	// bind the data to new DOM elements (initially an empty selection of DOM elements, 
	// as no prior visualization has been performed)
	var gEnter = svg.selectAll("g")
		.data(callDataPerHour)
		.enter()
		.append("g");

	/* create bars */

	// create bars for made calls
	gEnter.append("rect")
		    .attr("class", "made-call-bar")
		    .attr("x", function(d, i) { return xScale(i); })
		    .attr("y", height)
		    .attr("width", xScale.rangeBand())
		    .attr("height", 0)
		    .transition()
		    .delay(function(d, i) { return 500 + (i / callDataPerHour.length) * 1000; })
		    .duration(500)
		    .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls); })
		    .attr("height", function(d) { return heightScale(d.numMadeCalls); });

	// create bars for missed calls
	gEnter.append("rect")
	        .attr("class", "missed-call-bar")
	        .attr("x", function(d, i) { return xScale(i); })
	        .attr("y", height)
	        .attr("width", xScale.rangeBand())
	        .attr("height", 0)
		    .transition()
		    .delay(function(d, i) { return 500 + (i / callDataPerHour.length) * 1000; })
		    .duration(500)
	        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
	        .attr("height", function(d) { return heightScale(d.numMissedCalls); });

	/* create bar labels */

	// create bar labels for made calls
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
	        .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) + labelPadding; })
	        .style("opacity", function(d) { return d.numMadeCalls < 2 ? 0 : 1; });

	// create bar labels for missed calls
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
	    	.attr("y", function(d) { return (height - axisPadding) - heightScale(d.numCallsTotal) + labelPadding; })
	    	.style("opacity", function(d) { return d.numMissedCalls < 2 ? 0 : 1; });

	/* create the horizontal axis */
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");
	svg.append("g")
		.attr("transform", "translate(0," + (height - axisPadding) + ")")
		.call(xAxis);
}

// Revisualize the hour-level data.
function revisualizeHourLevel(callDataPerHour, jsonWorkbookEntries) {
	var width = window.innerWidth - 100,
		height = window.innerHeight / 2,
		barpadding = 1,
		axisPadding = 25,
		labelPadding = 13,
		maxCalls = d3.max(callDataPerHour, function(d) { return d.numCallsTotal; }),
		heightScale = d3.scale.linear()
				  			  .domain([0, maxCalls])
				  			  .range([0, height - axisPadding]),
		xScale = d3.scale.ordinal()
						 .domain(d3.range(callDataPerHour.length))
						 .rangeRoundBands([0, width], 0.05),
		svg = d3.select("body")
				.select("#svg-hour-level");

	// bind the new data to the old DOM elements
	var gUpdate = svg.selectAll("g")
				     .data(callDataPerHour);

	// update bars
	gUpdate.select(".made-call-bar")
		  .transition()
		  .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
		  .duration(500)
		  .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls); })
		  .attr("height", function(d) { return heightScale(d.numMadeCalls); });

	gUpdate.select(".missed-call-bar")
		  .transition()
		  .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
		  .duration(500)
	      .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) - heightScale(d.numMissedCalls); })
	      .attr("height", function(d) { return heightScale(d.numMissedCalls); });

	// update bar labels
	gUpdate.select(".made-call-bar-label")
	      .transition()
	      .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
	      .duration(500)
		  .text(function(d) { return d.numMadeCalls; })
	      .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numMadeCalls) + labelPadding; })
	      .style("opacity", function(d) { return d.numMadeCalls < 2 ? 0 : 1; });

	gUpdate.select(".missed-call-bar-label")
	      .transition()
	      .delay(function(d, i) { return (i / callDataPerHour.length) * 1000; })
	      .duration(500)
		  .text(function(d) { return d.numMissedCalls; })
	      .attr("y", function(d) { return (height - axisPadding) - heightScale(d.numCallsTotal) + labelPadding; })
	      .style("opacity", function(d) { return d.numMissedCalls < 2 ? 0 : 1; });
}

/**
Check whether there is a lower-level visualization currently being displayed for
any of the entries in the given array.

Inputs:
callData: array of call data objects to search through

Outputs:
returns true if a lower-level visualization exists, false otherwise
*/
function checkIfAnyExpanded(callData) {
	for (var i = 0; i < callData.length; i++) {
		if (callData[i].expanded) {
			return true;
		}
	}
	return false;
}

/**
Set expanded to false for all entries in the given array.

Inputs:
callData: array of call data objects to go through
*/
function clearExpanded(callData) {
	for (var i = 0; i < callData.length; i++) {
		callData[i].expanded = false;
	}
}
