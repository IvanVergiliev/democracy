$(function() {
    $('#chart-container').highcharts({
        chart: {
            type: 'area'
        },
        title: {
            text: 'Анализ 1'
        },
        subtitle: {
            text: 'Брой на записаните и чакащите на опашка студенти през изминалите дни.'
        },
        xAxis: {
            labels: {
                formatter: function() {
                    if(this.value % 2 === 0)
                        return this.value + ' април 2013';
                }
            }
        },
        yAxis: {
            title: {
                text: 'Брой желаещи'
            },
            labels: {
                formatter: function() {
                    return this.value;
                }
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: 'Студенти: <b>{point.y:,.0f}</b><br/>Дата: <em>{point.x} април 2013</em>'
        },
        plotOptions: {
            area: {
                pointStart: 1,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
                name: 'Анализ 1',
                data: [28, 39, 48, 56, 62, 78, 63, 59, 60, 59, 53, 51, 51, 52, 52]
            }]
    });
});

