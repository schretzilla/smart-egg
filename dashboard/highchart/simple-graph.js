
// Acts like the API's get data function
function getData() {
  //For test purposes fake data
  resultData = [122, 333, 543, 123, 123, 542, 134, 535, 131, 241, 344, 231];

  //plot the recieved data
  plotData(resultData);
}

// Plots the supplied data
// resultData: the magnitude for the array of ints to be plotted
function plotData(resultData){
  buildChart(resultData);  
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
              //max: 5    //Set the max points in the view
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