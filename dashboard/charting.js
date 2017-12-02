var ctx = document.getElementById("myChart");
var dataValues = [12, 19, 3, 5, 2, 3];
var labelValues = ["t1", "t2", "t3", "t4", "t5", "t6"];
var myChart = buildChart();

function buildChart() {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelValues,
            datasets: [{
                label: '# of Votes',
                data: dataValues,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            animation: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

// Currently testing erasing the table and re writing it with new data
function getData() {
    var randomPoint = Math.random() * 15;
    dataValues.push(randomPoint);
    labelValues.push("t7");
    console.log(dataValues);
    canvasEle = ctx.getContext("2d");
    console.log(canvasEle.width);
    canvasEle.clearRect(0, 0, 1000, 1000);
    mychart = buildChart();
}