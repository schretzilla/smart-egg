
Highcharts.setOptions({
  global: {
      useUTC: false
  }
});

var chart; //global chart
var dataStreamInterval; // used to stop recording
$("#stop").hide();

// Stop recording and clear the chart
function destory() {
    clearInterval(refreshIntervalId);
    while(chart.series.length > 0 ){
        chart.series[0].remove(true);
    }
}

//Stop recording
function stop() {
    $("#record").show();
    $("#stop").hide();

    //Stop the recoding interval
    clearInterval(dataStreamInterval);   
}

// Start recording random data to chart
function record() {
    // switch buttons while recording
    $("#record").hide();
    $("#stop").show();

    //Start pulling live data
    let streamIndex = 0; // Index of last number added to chart
    let dataList = [];
    let chart = buildChart(dataList); // build empty chart initially
    let timeBetweenDataPull = 1000;
    dataStreamInterval = setInterval(function() {
        let randomDataList = getRandomNumbersToAdd();
        dataList = dataList.concat(randomDataList); // append new data (simulates the addition of data to the stream)
        streamIndex = addPointsToChart(chart, dataList, streamIndex);  // move the cur index to include the newly aded values        
    }, timeBetweenDataPull);
        
}         

function streamData() {

}

function addPointsToChart(chart, dataToAdd, curIndex){
    for(curIndex; curIndex < dataToAdd.length; curIndex++){
        let curValue = dataToAdd[curIndex];
        chart.series[0].addPoint(curValue);
    }
    return curIndex;
}

function getRandomNumbersToAdd(){
    let randomDataList = [];
    for(let i=0; i<10; i++){
        let randNumber = Math.floor(Math.random() * 100);
        randomDataList.push(randNumber);
    }
    return randomDataList;
}

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
            xAxis: {
                min:0,
                max:100
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