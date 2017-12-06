var currentChart; //current chart
var dataStreamInterval; // used to stop recording
let dropList = []; //list of egg drop objects 
let dropId = 0; // A sad way to handle data binding
$("#stop").hide();

//Stop recording
function stop() {
    $("#record").show();
    $("#stop").hide();

    //Stop the recoding interval
    clearInterval(dataStreamInterval);   

    //Save chart to list
    let dropName = "Drop #"+dropId;
    let eggDrop = {name: dropName, chart: currentChart };
    dropList.push(eggDrop);
    $("#drop-history").append('<li> <button onClick="newDataSelected('+dropId+')">'+dropName+'</button></li>');
    dropId += 1;
}

function newDataSelected(id) {
    console.log(dropList[id]);
    selectedChart = dropList[id].chart;
    // currentChart = buildChart(selectedChart.series[0].YData);
    currentChart.series[0].setData(selectedChart.series[0].yData, true);
    currentChart = selectedChart;
}

// Start recording random data to chart
function record() {
    // switch buttons while recording
    $("#record").hide();
    $("#stop").show();

    //Start pulling live data
    let streamIndex = 0; // Index of last number added to chart
    let dataList = [];
    currentChart = buildChart(dataList); // build empty chart initially
    let timeBetweenDataPull = 1000;
    dataStreamInterval = setInterval(function() {
        let randomDataList = getRandomNumbersToAdd();
        dataList = dataList.concat(randomDataList); // append new data (simulates the addition of data to the stream)
        streamIndex = addPointsToChart(currentChart, dataList, streamIndex);  // move the cur index to include the newly aded values        
        
        //TODO shift x axis as data comes in, only show the last x amount of points
        // currentChart.shift; //shift axis as data comes in
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
    for(let i=0; i<10; i++){
        let randNumber = Math.floor(Math.random() * 100);
        randomDataList.push(randNumber);
    }
    return randomDataList;
}

// Builds a line chart for the supplied y data array
// ResultData: The y values of the line chart
function buildChart(resultData) {
    var chart = Highcharts.chart('container', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Smart Egg Acceleration'
            },
        
            subtitle: {
                text: 'Team: [Team Name]'
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