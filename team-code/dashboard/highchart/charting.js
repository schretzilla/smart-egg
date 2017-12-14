// Handles charting the data points 

var currentChart; //current chart
var dataStreamInterval; // used to stop recording
let dropList = []; //list of egg drop objects 
let dropId = 0; // A sad way to handle data binding
let curDataList; // This current list of data in focus

// Hide the stop button on load
$("#stop").hide();

//Stop recording
function stop() {
    $("#record").show();
    $("#stop").hide();

    //Stop the recoding interval
    clearInterval(dataStreamInterval);   

    //Save chart to list
    let dropName = "Drop #"+dropId;
    let eggDrop = {name: dropName, chartData: curDataList };
    dropList.push(eggDrop);
    $("#drop-history").append('<li> <button onClick="newDataSelected('+dropId+')">'+dropName+'</button></li>');
    dropId += 1;
}

// Redraw the chart with the data stored in the selected data list
function newDataSelected(id) {
    console.log(dropList[id].name);
    selectedData = dropList[id].chartData;
    currentChart.series[0].setData(selectedData, true);
}

// Start recording data to chart
// TODO: replace random data with data retrieved from ESP32
function record() {
    // Toggle buttons while recording
    $("#record").hide();
    $("#stop").show();

    //Start pulling  data
    let streamIndex = 0; // Index of last number added to chart
    curDataList = [];
    currentChart = buildChart(curDataList); // build empty chart initially
    let timeBetweenDataPull = 1000; // Time to wait until next pull of data

    // Add random points until stop is clicked
    dataStreamInterval = setInterval(function() {
        let randomDataList = getRandomNumbersToAdd();  // TODO: Replace with getter of real data
        curDataList = curDataList.concat(randomDataList); // append new data to the data list
        
        // Where a live stream would go but handling more than 100 pts at a time can't be done fast enough
        // streamIndex = addPointsToChart(currentChart, dataList, streamIndex);  // move the cur index to include the newly aded values             
    }, timeBetweenDataPull);
        
}         

// Add points to the chart from the index of the last point added to the end
// of the new data to be added array
// chart: the chart to add points too
// dataToAdd: the full list of data points thus far
// curIndex: the number of data points that have been processed thus far
function addPointsToChart(chart, dataToAdd, curIndex){
    for(curIndex; curIndex < dataToAdd.length; curIndex++){
        let curValue = dataToAdd[curIndex];
        chart.series[0].addPoint(curValue, true, false);
    }
    return curIndex;
}

// Temp function used to demo. Creates list of random numbers to be added
// to the chart
function getRandomNumbersToAdd(){
    let randomDataList = [];
    for(let i=0; i<1000; i++){
        let randNumber = Math.floor(Math.random() * 100);
        randomDataList.push(randNumber);
    }
    return randomDataList;
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