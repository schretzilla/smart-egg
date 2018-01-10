//setup
//TODO: Put into on load complete method
// Hide the stop button on load
$("#stop").hide();
$("#team-details-container").hide();
$("#loading-btn").hide();

//TODO: only disable if no runs exist
$("#downloadBtn").prop("disabled", true);

//List all drops history
let m_teamDataList = [];
let m_currentChart; //Current chart in view
let m_activeTab; //Index of the active tab

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


function updateDropList() { 
    //Get all Drops from API
    // for each drop, add drop to drop list
    
    addTeam("team1");
    
}

function addTeam() {
    //Test data
    //TODO: Pull from API
    curDataList = [10, 15, 22, 33, 5, 6, 33, 2, 67];
    
    let teamName = $("#team-name").val();
    $("#team-name").val("");
    let teamId = m_teamDataList.length;
    let eggDrop = {name: teamName, chartData: curDataList };
    m_teamDataList.push(eggDrop);
    $("#drop-history").append('<li id=team-'+teamId+'> <a onClick="newDataSelected('+teamId+')">'+teamName+'</a></li>');
}

function stopRecord() {
  //Toggle the stop and start buttons
  $("#record").show();
  $("#stop").hide();

  //TODO: show the loading button while the data is being retireved
  $("#loading-btn").show();

  HTTPRequest("functions/stopRecord()", function(response) {});

  // Data is now available to download
  $("#downloadBtn").prop("disabled", false);
}

function newDataSelected(teamId){
    //Toggle active tabs
    $("#team-"+m_activeTab).removeClass("is-active");
    $("#team-"+teamId).addClass("is-active");
    m_activeTab = teamId;

    $("#team-details-container").show()


    console.log(m_teamDataList[teamId].name);
    selectedData = m_teamDataList[teamId].chartData;
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
                text: 'Team: [Team Name]'
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
