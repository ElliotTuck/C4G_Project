/*
"Date/Time": "2/28/17 23:38",
"Direction": "IN",
"Duration": "0",
"Phone Number": "XXXX",
"Extension": "0",
"Call Line": "1",
"Trunk Type": "Unknown",
"Call Status": "RNA",
"End Time": "2/28/17 23:38",
"isTAProc": "0",
"Call HoldDuration": "0",
"Source Country Code": "1",
"ACDExt": "0",
"Transfer Ext": "0",
"AgentName": "                                ",
"Termtime": "                                ",
"Party Duration": "0",
"PartyIPPort": "0",
"PartyType": "1",
"PartyCodeType": "0",
"WaitDuration": "0",
"VMDuration": "0",
"RecDuration": "0",
"AADuration": "0",
"HoldDuration": "0",
"RingDuration": "0",
"PartyWrapDuration": "0"
*/

function deleteRedundantFields(jsonWorkbookEntry) {
    var entry = jsonWorkbookEntry;
    delete entry["Trunk Type"];
    delete entry.isTAProc;
    delete entry["Call HoldDuration"]
    delete entry["Source Country Code"]
    delete entry.ACDExt
    delete entry["Transfer Ext"]
    delete entry.AgentName
    delete entry.Termtime
    delete entry["Party Duration"]
    delete entry.PartyIPPort
    delete entry.PartyType
    delete entry.PartyCodeType
    delete entry.WaitDuration
    delete entry.VMDuration
    delete entry.RecDuration
    delete entry.AADuration
    delete entry.HoldDuration
    delete entry.RingDuration
    delete entry.PartyWrapDuration
}

function cleanJSONWorkbook(jsonWorkbookEntries) {
    var entry;
    for (var i = 0; i < jsonWorkbookEntries.length; i++) {
        entry = jsonWorkbookEntries[i];
        deleteRedundantFields(entry);
        cleanDates(entry);
        cleanDuration(entry);
    }
}

function cleanDates(jsonWorkbookEntry) {
    jsonWorkbookEntry.Date = new Date(jsonWorkbookEntry["Date/Time"]);
    delete jsonWorkbookEntry["Date/Time"];
    jsonWorkbookEntry["End Time"] = new Date(jsonWorkbookEntry["End Time"]);
}

function cleanDuration(jsonWorkbookEntry) {
    var parsedDuration = parseFloat(jsonWorkbookEntry.Duration);
    if (parsedDuration != NaN) {
        jsonWorkbookEntry.Duration = parsedDuration;
    } else {
        delete jsonWorkbookEntry.Duration;
    }
}
/**
Labels each as missed or not missed by creating/modifying a boolean attribute "Missed", based on the
missedDurationRule parameter. The parameter "inclusive" specifies whether to label an entry as missed when its
duration == missedDurationRule. If inclusive is true, then the entry is labeled as missed.
**/
function labelMissed(jsonWorkbookArray, missedDurationRule, inclusive) {
    var entry;
    for (var i = 0; i < jsonWorkbookArray.length; i++) {
        entry = jsonWorkbookArray[i];
        if (entry.Direction == "IN" && entry.Duration >= 0) {
          var duration = entry.Duration;
          if (duration != undefined) { // Duration exists
              if (duration < missedDurationRule) {
                  entry.Missed = true;
              } else if (duration > missedDurationRule) {
                  entry.Missed = false;
              } else { // duration == missedDurationRule
                  if (inclusive) {
                      entry.Missed = true;
                  } else {
                      entry.Missed = false;
                  }
              }
          }
        } else {
          if (entry.Duration <= 0) {
            delete jsonWorkbookArray[i];
          }
        }
    }
}



/**
Convert the given month number to its corresponding month string. Input ranges
between 0 and 11, inclusive, where 0 maps to January and 11 maps to December.
**/
function convertMonth(monthNum) {
    switch(monthNum) {
        case 0: return "January"; break;
        case 1: return "February"; break;
        case 2: return "March"; break;
        case 3: return "April"; break;
        case 4: return "May"; break;
        case 5: return "June"; break;
        case 6: return "July"; break;
        case 7: return "August"; break;
        case 8: return "September"; break;
        case 9: return "October"; break;
        case 10: return "November"; break;
        case 11: return "December"; break;
        default: return null;
    }
}

/**
Get total number of made/missed calls per month. Return an array of objects in the
following format:

[
    {
        "month": "January",
        "year": 2016,
        "numCallsTotal": 555,
        "numMissedCalls", 100,
        "numMadeCalls", 455
    },

    {
        "month": "February",
        "year": 2017,
        "numCallsTotal": 0,
        "numMissedCalls", 0,
        "numMadeCalls", 0
    },

    ...
]

This array will be of size 12 * (number of years), with one entry per unique month.
For example, if there is two years worth of data, then this will return an array of
size 24.
Note: It might make sense to edit this function to specify which
months should be analyzed based on the user's input.
**/
function getCallDataPerMonth(jsonWorkbookEntries, years) {
    // array of objects
    var callDataPerMonth = [];

    // create array of months for each year of data
    for (var j = 0; j < years.length; j++) {
        // initialize each month's aggregate data
        for (var i = 0; i < 12; i++) {
            var obj = new Object();
            obj.month = convertMonth(i);
            obj.year = years[j];
            obj.numCallsTotal = 0;
            obj.numMissedCalls = 0;
            obj.numMadeCalls = 0;
            callDataPerMonth.push(obj);
        }
    }

    // aggregate the call data
    for (var j = 0; j < years.length; j++) {
        for (var i = 0; i < jsonWorkbookEntries.length; i++) {
            var entry = jsonWorkbookEntries[i];
            var entryMonth = entry.Date.getMonth();
            var entryYear = entry.Date.getFullYear();
            // only add the proper data to each entry of the array
            if (entryYear == years[j]) {
                var index = 12 * j + entryMonth;
                callDataPerMonth[index].numCallsTotal++;        // increment the total number of calls by one
                if (entry.Missed) {
                    callDataPerMonth[index].numMissedCalls++;   // if the call was missed, increment total number of missed calls
                } else {
                    callDataPerMonth[index].numMadeCalls++;     // else increment total number of made calls
                }
            }
        }
    }

    return callDataPerMonth;
}

function getActiveMonths(jsonWorkbookEntries) {
  var monthArray = [];
  var entry;
  for (var i = 0; i < jsonWorkbookEntries.length; i++) {
    entry = jsonWorkbookEntries[i];
    monthArray[entry.Date.getMonth()] = true
  }
  return monthArray;
}

/**
Get total number of made/missed calls per day for a given month. Return array
of objects in the following format:

[
    {
        "day": 1,
        "month": 1,
        "year": 2017,
        "numCallsTotal": 100,
        "numMissedCalls": 10,
        "numMadeCalls": 90
    },

    {
        "day": 2,
        "month": 1,
        "year"; 2017,
        "numCallsTotal": 0,
        "numMissedCalls": 0,
        "numMadeCalls": 0
    },

    ...
]

This array will be of variable size depending on the years of data. For example,
if years = [2016, 2017], then this array will be of size 62 (= 2 years * 31 days per month).
**/
function getCallDataPerDay(jsonWorkbookEntries, month) {
    // array of objects
    var callDataPerDay = [];

    // create initial objects (assumes 31 days for each month)
    for (var j = 0; j < years.length; j++) {
        for (var i = 0; i < 31; i++) {
            var obj = new Object();
            obj.day = i + 1;
            obj.month = month;
            obj.year = years[j];
            obj.numCallsTotal = 0;
            obj.numMissedCalls = 0;
            obj.numMadeCalls = 0;
            callDataPerDay.push(obj);
        }
    }

    // aggregate call data
    for (var i = 0; i < jsonWorkbookEntries.length; i++) {
        var entry = jsonWorkbookEntries[i];
        var entryMonth = entry.Date.getMonth();
        if (entryMonth === month) {
            var entryDate = entry.Date.getDate();
            var callObj = callDataPerDay[entryDate - 1];
            callObj.numCallsTotal++;        // increment total number of calls on this day by one
            if (entry.Missed) {
                callObj.numMissedCalls++;   // if call was missed, increment total number of missed calls
            } else {
                callObj.numMadeCalls++;     // else increment total number of made calls
            }
        }
    }

    return callDataPerDay;
}

/**
Get total number of made/missed calls per day for a given day in a given month 
over all years of data. Return array of objects in the following format:

[
    {
        "hour": 0,
        "numCallsTotal": 7,
        "numMissedCalls": 1,
        "numMadeCalls": 6
    },

    {
        "hour": 1,
        "numCallsTotal": 0,
        "numMissedCalls": 0,
        "numMadeCalls": 0
    },

    ...
]

This array will be of variable size depending on the years of data. For example,
if years = [2016, 2017], then this array will be of size 48 (= 2 years * 24 hours in a day).
**/
function getCallDataPerHour(jsonWorkbookEntries, month, date, years) {
    // array of objects
    var callDataPerHour = [];

    // create initial objects
    for (var i = 0; i < years.length; i++) {
        for (var j = 0; j < 24; j++) {
            var obj = new Object();
            obj.hour = j;
            obj.numCallsTotal = 0;
            obj.numMissedCalls = 0;
            obj.numMadeCalls = 0;
            callDataPerHour.push(obj);
        }
    }

    // aggregate call data
    for (var i = 0; i < years.length; i++) {
        for (var j = 0; j < jsonWorkbookEntries.length; j++) {
            var entry = jsonWorkbookEntries[j];
            var entryDate = entry.Date.getDate() - 1;
            var entryMonth = entry.Date.getMonth();
            var entryYear = entry.Date.getFullYear();
            if (entryDate === date && entryMonth === month && entryYear === years[i]) {
                var entryHour = entry.Date.getHours();
                var index = 24 * i + entryHour;
                var callObj = callDataPerHour[index];
                callObj.numCallsTotal++;        // increment total number of calls on this day by one
                if (entry.Missed) {
                    callObj.numMissedCalls++;   // if call was missed, increment total number of missed calls
                } else {
                    callObj.numMadeCalls++;     // else increment total number of made calls
                }
            }
        }
    }

    return callDataPerHour;
}
