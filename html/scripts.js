//List all drops history
let m_DropDataList = [];
// let m_currentChart; //Current chart in view
let m_activeDropId; //Index of the active tab

$(document).ready(function() {
	//setup
	//TODO: Put into on load complete method
	// Hide the stop button on load
	$("#stop").hide();
	$("#loading-btn").hide();

	//TODO: only disable if no runs exist
	$("#download-btn").prop("disabled", true);

	//TODO: update drop list on load
	updateDropList();

});

function updateEvents() {
  setInterval(updateTable(), 1000);
}

function startRecord() {
  // Toggle start and stop button
  $("#record").hide();
  $("#stop").show();

  HTTPRequest("functions/startRecord()", function(response) {});

}

//Delete the drop on confirmed delete
function deleteDrop(){
	// TODO: confirm delte works
	HTTPRequest("functions/deleteRecord("+m_activeDropId+")", function(response) {});
	closeModal();
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

function updateDropList() { 
	//Get all Drops from API
	// for each drop, add drop to drop list
	
	//TODO: Get drop list
	let testDropList = [1,2,3,4,5];

	//For each drop, get It's name and 
	for(let i=0; i<testDropList.length; i++){
		//Get each name of each drop
		let name = getDropName(testDropList[i]);
		let data = getRandomDropData();
		addDrop(name, data);
	}	
    
}

function getRandomDropData(){
	let dropData = [];
	for(let i=0; i<140; i++){
		dropData.push(Math.random() * 100);
	}
	return dropData;
}

// Get Drop name
function getDropName(id){

	//TODO: Get drop name
	//HTTPRequest("functions/dropName("+id+")", function(response) {});

	var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function addDrop(dropName, data) {
		let eggDrop = {id: m_DropDataList.length, name: dropName, chartData: data };
		m_DropDataList.push(eggDrop);
		this.addTab(eggDrop.id, dropName);
}

// Add a drop to the lsit of tabs
function addTab(dropId, dropName){
	$("#drop-history").append('<li id=Drop-'+dropId+'> <a onClick="newDataSelected('+dropId+')">'+dropName+'</a></li>');
}

// Add a new drop to the tabs list
function addNewDrop() {
    //Test data
    //TODO: Pull from API
    curDataList = [];
    
    let dropName = $("#drop-name").val();
    $("#drop-name").val("");
    let dropId = m_DropDataList.length;
    this.addDrop(dropName, curDataList);
}

// Builds modal for delete confirmation
function buildModal() {
	let dropName = m_DropDataList[m_activeDropId].name;
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

function stopRecord() {
  //Toggle the stop and start buttons
  // $("#record").show();
	$("#stop").hide();

	// Stop Recording
	HTTPRequest("functions/stopRecord()", function(response) {});


  //TODO: show the loading button while the data is being retireved
  $("#loading-btn").show();

	// TODO: Delete this button put csv onto chart
  // Data is now available to download
	$("#download-btn").prop("disabled", false);
	
	//Load the newest data
	let dataFromDrop = getLastRun();

	// persist the data dropped to the current egg drop object
	m_DropDataList[m_activeDropId].chartData = dataFromDrop;

	//chart the new drops data
	buildChart(dataFromDrop);
}

// Loads data and sets gui visuals for the selected tab
function newDataSelected(dropId){
    //Toggle active tabs
    $("#Drop-"+m_activeDropId).removeClass("is-active");
    $("#Drop-"+dropId).addClass("is-active");
    m_activeDropId = dropId;

    $("#drop-details-container").show()

    console.log(m_DropDataList[dropId].name);
    selectedData = m_DropDataList[dropId].chartData;
    let currentChart = buildChart(selectedData)
}

function setData(elementID, value) {
  document.getElementById(elementID).innerHTML = value;
}

function updateTable() {
  HTTPRequest("functions/getInstant()", function(response) {
    var dataArray = getDataArray(response);

    setData("rawX", dataArray[0]);
    setData("rawY", dataArray[1]);
    setData("rawZ", dataArray[2]);
    setData("gX", dataArray[3]);
    setData("gY", dataArray[4]);
    setData("gZ", dataArray[5]);

    console.log("Table Updated");
  });
}

function getDataArray(dataString) {
    dataString = dataString.trim();
    var dataArray = new Array();
    
    while(dataString.indexOf(',') != -1) {
      dataArray.push(dataString.substring(0, dataString.indexOf(',')));
      dataString = dataString.substring(dataString.indexOf(',') + 1).trim();
    }
    dataArray.push(dataString);

    return dataArray;
}

// Update the graph with the rawdata.csv file most recently collected from a data run
function showLatestTable(){
  // Show loading while parsing is happening
  $("#show-latest-btn").addClass("is-loading");

  //load file
  let dataToGraph = getLastRun();

	buildChart(dataToGraph);

  //remove loading sign
  $("#show-latest-btn").removeClass("is-loading");
}

//Returns the parsed file to be charted
function getLastRun(){
	//load file
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", 'rawdata.csv', false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }

  //Graph the results
  return parseData(result);
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
    let xPoint = parseFloat(curDataPoints[0]);
    let yPoint = parseFloat(curDataPoints[1]);
    let zPoint = parseFloat(curDataPoints[2]);
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
                max: 500    //Set the max points in the view
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
                name: 'Installation',
                data: resultData
            }],
        
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
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


//window.onload =
