$(function () {
    utils.renderPage();
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/getBxStatistical',
        dataType: 'json',
        data: {orderNo:$('#order-no').val(),orderStates:$('#order_states').val()}
    },function (data) {

    },function (error) {

    });
    var option = {
        title: {
            text: ''
        },
        tooltip: {},
        legend: {
            data:['销量']
        },
        xAxis: {
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
        },
        yAxis: {},
        series: [{
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
        }]
    };
    utils.renderChart('company_statistical',option);

});
