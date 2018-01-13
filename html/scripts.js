//setup
//TODO: Put into on load complete method
// Hide the stop button on load
$("#stop").hide();
$("#drop-details-container").hide();
$("#loading-btn").hide();

//TODO: only disable if no runs exist
$("#download-btn").prop("disabled", true);

//List all drops history
let m_DropDataList = [];
let m_currentChart; //Current chart in view
let m_activeDropId; //Index of the active tab

//TODO: update drop list on load
//updateDropList();

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


function updateDropList() { 
    //Get all Drops from API
    // for each drop, add drop to drop list
    
    addDrop("Drop1");
    
}

function addDrop() {
    //Test data
    //TODO: Pull from API
    curDataList = [10, 15, 22, 33, 5, 6, 33, 2, 67];
    
    let DropName = $("#drop-name").val();
    $("#drop-name").val("");
    let DropId = m_DropDataList.length;
    let eggDrop = {name: DropName, chartData: curDataList };
    m_DropDataList.push(eggDrop);
    $("#drop-history").append('<li id=Drop-'+DropId+'> <a onClick="newDataSelected('+DropId+')">'+DropName+'</a></li>');
}

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
  $("#record").show();
  $("#stop").hide();

  //TODO: show the loading button while the data is being retireved
  $("#loading-btn").show();

  HTTPRequest("functions/stopRecord()", function(response) {});

  // Data is now available to download
  $("#download-btn").prop("disabled", false);
}

function newDataSelected(dropId){
    //Toggle active tabs
    $("#Drop-"+m_activeDropId).removeClass("is-active");
    $("#Drop-"+dropId).addClass("is-active");
    m_activeDropId = dropId;

    $("#drop-details-container").show()


    console.log(m_DropDataList[dropId].name);
    selectedData = m_DropDataList[dropId].chartData;
    currentChart = buildChart(selectedData)
    currentChart.series[0].setData(selectedData, true);
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
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", 'rawdata.csv', false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }

  //Graph the results
  let dataToGraph = parseData(result);
  buildChart(dataToGraph);

  //remove loading sign
  $("#show-latest-btn").removeClass("is-loading");
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
    let chart = Highcharts.chart('container', {
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
