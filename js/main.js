var file;                           // the file to be processed
var workbook;                       // the workbook
var defaultDropColor = "#bc0033"    // default color of drop-area
var highlightedDropColor = "gray"   // color of drop-area when a file is being dragged over it
var jsonWorkbookEntries;
var checkedMonths;
var years;

$(document).ready(function() {
	var expanded = false;

	// toggle the visualization upon clicking the submit button
	$("#submit-btn").click(function() {
		if (jsonWorkbookEntries && !expanded) {
			var userOptions = processUserOptions();
			if (typeof(userOptions) != "string") { // if type IS a string, that means it's an error message. DON'T generate graphs.
				console.debug(userOptions);
				labelMissed(jsonWorkbookEntries, userOptions["missedCallRule"], false);
				// convert workbook to JSON
				var missedCounter = 0;
				var i = 0;
				for (var int = 0; i < jsonWorkbookEntries.length; i++) {
					if (jsonWorkbookEntries[i].Missed) {
						missedCounter++;
					}
				}
				// display total number of missed calls
				d3.select("#initial-info")
				.append("h1")
				.text("Number of missed calls in this data: " + missedCounter);

				// display date information of first entry
				var e1 = jsonWorkbookEntries[0];
				var e1Date = e1.Date.getDate();
				var e1Month = convertMonth(e1.Date.getMonth());
				var e1Year = e1.Date.getFullYear();
				var e1String = e1Date + " " + e1Month + " " + e1Year;
				d3.select("#initial-info")
				.append("h1")
				.text("Date of first entry: " + e1String);

				// get the call data per year
				years = getActiveYears(jsonWorkbookEntries);
				var callDataPerYear = getCallDataPerYear(jsonWorkbookEntries, years);

				// visualize the data at the year level
				visualizeYearLevel(callDataPerYear, jsonWorkbookEntries);

				// scroll to the bottom of the page
				$("body").delay(100).animate({ scrollTop: $(document).height()-$(window).height() }, 750);

				expanded = true;
			} else {
				d3.select("#initial-info")
				.append("h1")
				.text("Error: " + userOptions);
			}
		} else if (!expanded) {
			alert("No file selected!");
		}
	});

	// alert user of possible loss of functionality due to outdated browser
	if (!window.File || !window.FileReader || !window.FileList) {
		alert("The File APIs are not fully supported in this browser.");
	}
});

// handle events
var dropListener = {
	handleEvent: function(event) {
		if (event.type === 'dragenter') { this.onDragEnter(event); }
		if (event.type === 'dragleave') { this.onDragExit(event); }
		if (event.type === 'dragover') { this.onDragOver(event); }
		if (event.type === 'drop') { this.onDragDrop(event); }
	},

	onDragEnter: function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.currentTarget.style.backgroundColor = highlightedDropColor;
	},

	onDragExit: function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.currentTarget.style.backgroundColor = defaultDropColor;
	},

	onDragOver: function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy"   // copy the dragged file, do not move it
	},

	onDragDrop: function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.currentTarget.style.backgroundColor = defaultDropColor;

		file = event.dataTransfer.files[0];   // File object

		// read the file
		var reader = new FileReader();
		var name = file.name;
		reader.onload = function(event) {
			$("#list")[0].innerHTML = "<strong>Loading file...</strong>";

			workbook = XLSX.read(event.target.result, {type: 'binary'});
			var json_workbook = to_json(workbook);
			var sheetName = workbook.SheetNames[0];
			jsonWorkbookEntries = json_workbook[sheetName]; // Init main array of JSON call objects
			cleanJSONWorkbook(jsonWorkbookEntries); // clean the data
			var activeMonths = getActiveMonths(jsonWorkbookEntries);
			for (var i = 0; i < activeMonths.length; i++) {
				var monthName = convertMonth(i);
				var monthCheckbox = $("#" + monthName)
				if (!activeMonths[i]) { // month is not active
					monthCheckbox.attr("disabled", true)
				} else { // month is active
					monthCheckbox.prop("checked", true);
					//monthCheckbox.attr("") make bold
				}
			}
			checkedMonths = activeMonths;
			jsonWorkbookEntries = sortByDate(jsonWorkbookEntries);
			var minDate = dateToDashString(jsonWorkbookEntries[0].Date);
			var maxDate = dateToDashString(jsonWorkbookEntries[jsonWorkbookEntries.length - 1].Date);

			//console.debug(minDate);
			//console.debug(maxDate);
			$("#start-calendar").attr("min", minDate);
			$("#start-calendar").attr("max", maxDate);
			$("#end-calendar").attr("min", minDate);
			$("#end-calendar").attr("max", maxDate);
			name_li = "<li><strong>Name: " + file.name + "</strong></li>";
			type_li = "<li><strong>Type: " + file.type + "</strong</li>";
			size_li = "<li><strong>Size: " + file.size + " bytes</strong></li>";
			$("#list")[0].innerHTML = "<ul>" + name_li + type_li + size_li + "</ul>";
		};
		reader.readAsBinaryString(file);
	}
};

// setup drag and drop listeners
var dropArea = $("#drop-area")[0];
dropArea.addEventListener('dragenter', dropListener, false);
dropArea.addEventListener('dragleave', dropListener, false);
dropArea.addEventListener('dragover', dropListener, false);
dropArea.addEventListener('drop', dropListener, false);

// convert given workbook to JSON
function to_json(workbook) {
	var result = {};
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
		if(roa.length > 0){
			result[sheetName] = roa;
		}
	});
	return result;
}

/**
Validates user input from month checkboxes, start and end date calendars, and the missed call rule input box.
Returns an object with the following structure if ALL input is valid:
{
"checkedMonths" : [array of booleans (indices 0 to 11) indicating if a month was checked by the user].
"missedCallRule" : integer (40 if not selected by user).
"startDate" : Date object indicating the date (inclusive) from which the data should be analyzed.
"endDate" : Date object indicating the date (inclusive) up to which data should be analyzed.
}
}
**/
function processUserOptions() {
	var userOptions = {};
	var errorMessage;
	// Process month checkboxes
	for (var i = 0; i < checkedMonths.length; i++) {
		var monthName = convertMonth(i);
		var isChecked = $("#" + monthName).is(":checked");
		checkedMonths[i] = isChecked;
	}
	userOptions["checkedMonths"] = checkedMonths;
	// At this point, checkedMonths contains valid info about which checkbox is checked
	var missedCallRule = $("#missed-call-rule").val();
	// checking missedCallRule is valid
	if (missedCallRule != "" && missedCallRule <= 0) { // "" is when the form is not filled out
	errorMessage = "Missed call rule is less than 0.";
	return errorMessage;
} else {
	var defaultMissedCallRule = 40;
	userOptions["missedCallRule"] = (missedCallRule == "") ? defaultMissedCallRule : parseInt(missedCallRule);
}
// Checking calendar for validity of selected start and end dates
var selectedStartDate = new Date($("#start-calendar").val());
var startDateStamp = Date.parse(selectedStartDate);
var selectedEndDate = new Date($("#end-calendar").val());
var endDateStamp = Date.parse(selectedEndDate)
var startMin = new Date($("#start-calendar").attr("min"));
var startMax = new Date($("#start-calendar").attr("max"));
var endMin = new Date($("#end-calendar").attr("min"));
var endMax = new Date($("#end-calendar").attr("max"));
if (isNaN(selectedStartDate) ^ isNaN(selectedEndDate)) {
	errorMessage = "Both or neither start and end dates much be selected.";
	return errorMessage;
} else if (isNaN(selectedStartDate) && isNaN(selectedEndDate)) { // both dates are invalid or not selected
	userOptions["startDate"] = startMin;
	userOptions["endDate"] = endMax;
} else {
	if (selectedStartDate.getTime() < startMin.getTime() || selectedStartDate.getTime() > startMax.getTime()) {
		errorMessage = "The start date selected is not in the range of data provided.";
		return errorMessage;
	} else if (selectedEndDate.getTime() < endMin.getTime() || selectedEndDate.getTime()  > endMax.getTime()) {
		errorMessage = " The end date selected is not in the range of data provided."
		return errorMessage;
	} else if (selectedStartDate.getTime() > selectedEndDate.getTime()) {
		errorMessage = "The selected start date is later than the selected end date."
		return errorMessage;
	} else {
		userOptions["startDate"] = selectedStartDate;
		userOptions["endDate"] = selectedEndDate
	}
}
return userOptions;
}


function dateToDashString(date) {
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	if (day < 10) {
		day = "0" + day
	}
	if (month < 10) {
		month = "0" + month;
	}
	var dateString = year + "-" + month + "-" + day;
	return dateString;
}
