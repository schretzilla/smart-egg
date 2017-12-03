
Highcharts.setOptions({
  global: {
      useUTC: false
  }
});

var chart; //global chart
Highcharts.stockChart('myChart', {
    chart: {
        renderTo: 'myChart',
        defaultSeriesType: 'spline',
        events: {
            load: function () {

                // set up the updating of the chart each second
                var series = this.series[0];
                setInterval(function () {
                    var x = (new Date()).getTime(), // current time
                        y = Math.round(Math.random() * 100);
                    series.addPoint([x, y], true, true);
                    // console.log(series);                    
                }, 1000);
            }
        }
    },
    title: {
        text: 'Live random data'
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
        name: 'Random data',
        data: (function () {
              // generate an array of random data
              var data = [],
                  time = (new Date()).getTime(),
                  i;
    
              for (i = -999; i <= 0; i += 1) {
                  data.push([
                      time + i * 1000,
                      Math.round(Math.random() * 100)
                  ]);
              }
              return data;
          }())
        }]
  });        
