
Highcharts.setOptions({
  global: {
      useUTC: false
  }
});

var chart; //global chart
var refreshIntervalId; // used to stop recording

// Stop recording and clear the chart
function destory() {
    clearInterval(refreshIntervalId);
    while(chart.series.length > 0 ){
        chart.series[0].remove(true);
    }
}

//Stop recording
function stop() {
    clearInterval(refreshIntervalId);    
}

// Start recording random data to chart
function record() {
    chart = new Highcharts.stockChart('myChart', {
        chart: {
            renderTo: 'myChart',
            defaultSeriesType: 'spline',
            events: {
                load: function () {
                    // set up the updating of the chart each second
                    var series = this.series[0];
                    refreshIntervalId = setInterval(function () {                        
                        var x = (new Date()).getTime(), // current time
                            y = Math.round(Math.random() * 100);
                        series.addPoint([x, y], true, false); // false to stop dropping of earlier data
                    }, 1000);
                }
            }
        },
        title: {
            text: 'Egg Acceleration Data'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150,
            maxZoom: 20 * 1000,
            range: 100
        },
        yAxis: {
            minPadding: 0.2,
            maxPadding: 0.2,
            title: {
                text: 'Value',
                margin: 30
            }
        },
        rangeSelector: {
          buttons: [{
              count: 1,
              type: 'minute',
              text: '1M'
          }, {
              type: 'all',
              text: 'All'
          }],
          inputEnabled: false,
          selected: 0
      },
      exporting: {
              enabled: false
          },
        series: [{
            name: 'Acceleration data',
            data: [] //data to load
            }]
      }
    )};         
