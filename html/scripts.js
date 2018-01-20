//List all drops history
let m_DropDataList = [];
// let m_currentChart; //Current chart in view
let m_activeDropIndex; //Index of the active tab

// For production with egg
let urlEndPoint = "/functions";
// For Development without egg
// let urlEndPoint = "http://localhost:3000";

$(document).ready(function() {
	//setup
	//TODO: Put into on load complete method
	// Hide the stop button on load
	$("#stop").hide();
	$("#loading-btn").hide();

	//TODO: only disable if no runs exist
	$("#download-btn").hide();

	//TODO: update drop list on load
	updateDropList();

});

function startRecord() {
  // Toggle start and stop button
  $("#record").hide();
  $("#stop").show();

  let curDropName = m_DropDataList[m_activeDropIndex].name;
  // HTTPRequest("functions/startRecord()", function(response) {});
  let requestStr = urlEndPoint+"/recordStart/" + curDropName;
  //HTTPRequest(requestStr, function(response) {});

  //Call ajax start record
  ajaxStartRecord();
  
}

function ajaxStartRecord(){
  let requestStr = urlEndPoint+"/recordStart/" + curDropName;
  return $.ajax({
    dataType: 'text',
    url: requestStr
  }).done(function(response) {
    // If successful
      console.log(response);
      if(response != 0 ){
        //bad record force start and alert
        alert("Bad Record, forcing stop");
        HTTPRequest(urlEndPoint+"/recordStop", function(response) {
          console.log("recordStop Status: " + response);
        });
      }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    // If fail
    console.log(textStatus + ': ' + errorThrown);
  })
}

function stopRecord() {
  //Disable and show loading of stop button
  $("#stop").prop("disabled", true).addClass("is-loading");;

  // Stop the recording then get the drop data
  ajaxStopRecord().then(ajaxGetDropData);
  
}

function ajaxStopRecord(){
  return $.ajax({
    dataType: 'text',
    url: urlEndPoint+'/recordStop'
  }).done(function(data) {
    // If successful
    console.log("stopping status: " + data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    // If fail
    console.log(textStatus + ': ' + errorThrown);
  });
}

// Ajax request to get and plot the data
function ajaxGetDropData() {
  let curDrop = m_DropDataList[m_activeDropIndex]
  let getDataUrl = urlEndPoint+"/recordGetAxes/" + curDrop.name;

  return $.ajax({
    dataType: 'text',
    url: getDataUrl
  }).done(function(data) {
    // If successful
    console.log("data retrieved: " + data);

    //Plot data
    let magnitudeData = parseData(data);
    curDrop.chartData = magnitudeData;
    buildChart(curDrop.chartData);

    $("#stop").prop("disabled", false).removeClass("is-loading").hide();
    
    // Data is now available to download
    $("#download-btn").show();
  }).fail(function(jqXHR, textStatus, errorThrown) {
    // If fail
    console.log(textStatus + ': ' + errorThrown);
  });
}

function downloadCsv(){
  let curDrop = m_DropDataList[m_activeDropIndex]
  // split the comma sep data to insert new lines instead
  const rows = curDrop.chartData.split(',');
  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(function(rowArray){
    csvContent += row + "\r\n"; // add carriage return
  }); 

  // Create a hidden ele and click it to download the data
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".

}

//Delete the drop on confirmed delete
function deleteDrop(){
  // TODO: confirm delte works
  let dropName = m_DropDataList[m_activeDropIndex].name;
	// HTTPRequest(urlEndPoint+"/recordDelete/"+dropName, function(response) {});
  ajaxDeleteDrop();
  //TDODO currently deletes all... dont do that
   // HTTPRequest("/functions/recordDeleteAll", function(response) {});

   // Remove tab of item 
   $("#Drop-"+dropName).remove();
	closeModal();
}

function ajaxDeleteDrop(){
  let dropName = m_DropDataList[m_activeDropIndex].name;
  let requestString = urlEndPoint+"/recordDelete/"+dropName;
  return $.ajax({
            dataType: 'text',
            url: requestStr
          }).done(function(response) {
            // If successful
              console.log("Delete Status: " + response);
              
          }).fail(function(jqXHR, textStatus, errorThrown) {
            // If fail
            console.log(textStatus + ': ' + errorThrown);
          });
}

// Show confirm delete dialog 
function openConfirmDeleteDialog(){
	buildModal();
	$(".modal").addClass("is-active");

}

// Close open modal
function closeModal() {
		$(".modal").removeClass("is-active");
		$("#modal-area").val("");
}

function createDrop(name, valuesArray){
	return {name: name, chartData: valuesArray};
}

//Pull all existing drop names from the egg and populate the tabs with them
function updateDropList() { 
	//Get all Drops from API
  ajaxUpdateDropList();

  //load all the data up front for each one
  for(let i=0; i<m_DropDataList.length; i++){
    let curDrop = m_DropDataList[i];
    ajaxSimpleGetData(curDrop);
  }
}

function ajaxSimpleGetData(drop) {
  let getDataUrl = urlEndPoint+"/recordGetAxes/" + drop.name;

  return $.ajax({
    dataType: 'text',
    url: getDataUrl
  }).done(function(data) {
    // If successful
    console.log("data retrieved: " + data);

    //Plot data
    let magnitudeData = parseData(data);
    drop.chartData = magnitudeData;

  }).fail(function(jqXHR, textStatus, errorThrown) {
    // If fail
    console.log(textStatus + ': ' + errorThrown);
  });
}

function ajaxUpdateDropList() {
  let requestStr = urlEndPoint+"/recordList"
  return  $.ajax({
      dataType: 'text',
      url: requestStr
    }).done(function(response) {
    response = devToPrdResponseConverter(response);

    //Check that names exist to avoid adding empty tabs
    console.log("recordList:\n" + response);
    if(response != ""){
      let dropNames = response.split('\n');
      for(let i=0; i<dropNames.length; i++){
        // Add a drop and a tab with no data because it hasn't been pulled yet
        addDrop(dropNames[i], []);
      }
    }
    }).fail(function(jqXHR, textStatus, errorThrown) {
      // If fail
      console.log(textStatus + ': ' + errorThrown);
    });
}

// Adds a drop to the drop list and the tabs
function addDrop(dropName, data) {

  let eggDrop = {id: m_DropDataList.length, name: dropName, chartData: data };
  m_DropDataList.push(eggDrop);
  this.addTab(eggDrop.id, dropName);
}

// Returns a bool if the newName parameter is unique in the m_DropDataList of names
function nameIsUnique(newName){
  for(let i=0; i<m_DropDataList.length; i++){
    if(m_DropDataList[i].name == newName){
      return false;
    }
  }
  return true;
}

// Add a drop to the list of tabs
function addTab(dropId, dropName){
	$("#drop-history").append('<li id=Drop-'+dropName+'> <a onClick="newDataSelected('+dropId+')">'+dropName+'</a></li>');
}

// Add a uniquely named new drop to the tabs list
function addNewDrop() {
  let dropName = $("#drop-name").val();

  // check that the name is unique
  let nameIsUnique = this.nameIsUnique(dropName);
  if(nameIsUnique){
    $("#drop-name").val("");
    let dropId = m_DropDataList.length;
    curDataList = []; //empty data list to start  
    this.addDrop(dropName, curDataList);
  } else {
    //Todo: add text helper
    alert("Name must be unique");
  }
}

// Builds modal for delete confirmation
function buildModal() {
	let dropName = m_DropDataList[m_activeDropIndex].name;
	$("#modal-area").append('<div id="my-modal" class="modal">\
		<div class="modal-background"></div>\
			<div class="modal-card">\
				<header class="modal-card-head">\
					<p class="modal-card-title">Confirm Delete</p>\
					<button class="delete" aria-label="close" onClick="closeModal()"></button>\
				</header>\
				<section class="modal-card-body">\
					<!-- Content ... -->\
					Are you sure you\'d like to delete the drop "' + dropName + '"? There is no undoing this operation. \
				</section>\
				<footer class="modal-card-foot">\
					<button class="button is-danger" onClick="deleteDrop()">Delete Drop</button>\
					<button id="close-modal" class="button" onClick="closeModal()">Cancel</button>\
				</footer>\
			</div>\
		</div>');
}

// Loads data and sets gui visuals for the selected tab
function newDataSelected(dropId){
    //Toggle active tabs
    $("#Drop-"+m_DropDataList[dropId].name).removeClass("is-active");
    $("#Drop-"+dropId).addClass("is-active");
    m_activeDropIndex = dropId;

    $("#drop-details-container").show()

    console.log(m_DropDataList[dropId].name);
    selectedData = m_DropDataList[dropId].chartData;

    //Hide start button if the drop has already been recorded
    if(selectedData.length == 0 ){
      ajaxGetDropData

      // No data has been cached for this drop
      $("#record").show();
      $("#download-btn").hide();
    } else {
      // Data has been recorded for this drop
      $("#record").hide();
      $("#download-btn").show();
    }

    let currentChart = buildChart(selectedData)
}

// dataStringArray: The string containing the data.
// expected format "#,#,#\n#,#,#\n#,#,#...."
// Returns the list of parsed data as an array of floats
function parseData(dataResultString){
  // Holds the Y value data that will be passed to the chart to be graphed
  let dataListToPlot = [];

  //Split the result string on all new line chars
  resultList = dataResultString.split('\n');

  //Iterate through each collected data set
  for(let i=1; i<resultList.length; i++){
    let curDataSet = resultList[i];
    //split the data point into its individual x, y, z components
    let curDataPoints = curDataSet.split(",");

    // TODO: break into function
    // Find the magnitude
    let tPoint = parseFloat(curDataPoints[0]);
    let xPoint = parseFloat(curDataPoints[1]);
    let yPoint = parseFloat(curDataPoints[2]);
    let zPoint = parseFloat(curDataPoints[3]);
    let magnitude = Math.sqrt( (xPoint*xPoint) + (yPoint*yPoint) + (zPoint*zPoint) );

    dataListToPlot.push(magnitude);
  }

  return dataListToPlot;
}

// Builds a line chart for the supplied y data array
// ResultData: The y values of the line chart
function buildChart(resultData) {
    let chart = Highcharts.chart('charting-container', {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: 'Smart Egg Acceleration'
            },
        
            subtitle: {
                // text: 'Team: [Team Name]'
            },
            scrollbar: {
                enabled: true
            },
            xAxis: {
                // max: 500    //Set the max points in the view
                            //TODO: Set scroll bar to far right
            },
            yAxis: {
                title: {
                    text: 'Acceleration'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 1
                }
            },
            series: [{
                name: 'Raw Data',
                data: resultData
            }],
        
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 10000
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
               
            }]
        }
    });

    return chart;
}
/* 
 *  Keep compatibility with multiple web browsers
 *  I'm looking at you Internet Explorer
 */
function makeHTTPObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

/* Make a new Http Request */
function HTTPRequest(url, successFunction) {
  var request = makeHTTPObject();

  request.onreadystatechange = function() {
    if(request.readyState == 4) {
      if(request.status == 200) {
        successFunction(request.responseText);
      } else {
        /* Return an empty string if there's no data */
        throw new Error("Empty Data in HTTP Request");
      }
    }
  };

  request.open("GET", url, true);
  request.send(null);
}


//TODO: Test AJAX requests
// $.ajax({
//   data: someData,
//   dataType: 'json',
//   url: '/path/to/script'
// }).done(function(data) {
//   // If successful
//  console.log(data);
// }).fail(function(jqXHR, textStatus, errorThrown) {
//   // If fail
//   console.log(textStatus + ': ' + errorThrown);
// });

// TODO: Chain ajax
// var a1 = $.ajax({...}),
//     a2 = $.ajax({...});

// $.when(a1, a2).done(function(r1, r2) {
//     // Each returned resolve has the following structure:
//     // [data, textStatus, jqXHR]
//     // e.g. To access returned data, access the array at index 0
//     console.log(r1[0]);
//     console.log(r2[0]);
// });


// /functions/recordStart/<recordingName>           // Starts a recording with the name <recordingName>, returns string -1 if no name provided, -2 if the code timed out, -3 if name already exists, -4 if no space
// /functions/recordStop                                                  // Stops a current recording and returns 0 if successful, -1 if no recording in progress
// /functions/recordStatus                                                               // Returns 0 if idle, 1 if recording
// /functions/recordList                                                     // Returns list of recording separated by new line character ‘\n’
// /functions/recordGetRaw/<recordingName>    // Chunked get response containing a csv string (~620KB) with raw datavalues (0 to 4096), content contains “t,x,y,z”
// /functions/recordGetForce/<recordingName>  // Chunked get response containing a csv string (~620KB) with gForce data (-200 to 200 G), content contains “t,x,y,z”
// /functions/recordDelete/<recordingName>       // Deletes a recording with the name <recordingName>, returns string 0 if successful, -1 if does not exist
// /functions/recordDeleteAll                                         // Deletes all recordings
// /functions/recordSpaceLeft                                        // Returns string with size in bytes left
// /functions/recordGetMaxTime                                 // Returns string with max recording time (Default 60 Seconds)
// /functions/recordSetMaxTime/<timeInSeconds>            // Set the max recording time
// /functions/calibrate                                                        // Calibrates the accelerometer and returns a string with the offsets

