
Highcharts.setOptions({
  global: {
      useUTC: false
  }
});

var chart; //global chart
var refreshIntervalId; // used to stop recording
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

    //Stop the recrodign interval
    clearInterval(refreshIntervalId);   
    
    //Pull last data and display chart
    testData = [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    buildChart(testData);
}

// Start recording random data to chart
function record() {
    // switch buttons while recording
    $("#record").hide();
    $("#stop").show();

    //Start pulling live data

}         

function buildChart(resultData) {
    Highcharts.chart('container', {
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
}