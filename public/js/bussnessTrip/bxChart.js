$(function () {
    utils.renderPage();
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/getBxStatistical',
        dataType: 'json',
        data: {orderNo:$('#order-no').val(),orderStates:$('#order_states').val()}
    },function (data) {
        var addressArray = [];
        var addressTimesArray = [];
        for(var i = 0;i<data.addressStatistical.length;i++){
            addressArray.push(data.addressStatistical[i].addressDesc);
            addressTimesArray.push(data.addressStatistical[i].times);
        }
        var addressStatisticalOption = {
            title: {
                text: '出差地点统计'
            },
            tooltip: {},
            legend: {
                data:['次数']
            },
            xAxis: {
                data: addressArray
            },
            yAxis: {},
            series: [{
                name: '次数',
                type: 'bar',
                data: addressTimesArray
            }]
        };
        var descArray = [];
        var costDataArray = [];
        for(var i = 0;i<data.costStatistical.length;i++){
            descArray.push(data.costStatistical[i].orderStatusDesc);
            var obj = {};
            obj.value = data.costStatistical[i].cost;
            obj.name = data.costStatistical[i].orderStatusDesc;
            costDataArray.push(obj);
        }
       var costStatisticalOption = {
            title : {
                text: '出差报销金额分类',
                subtext: '金额状态占比',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: descArray
            },
            series : [
                {
                    name: '金额占比',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:costDataArray,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        var companyArray = [];
        var companyTimesArray = [];
        for(var i = 0;i<data.companyStatistical.length;i++){
            companyArray.push(data.companyStatistical[i].companyDesc);
            companyTimesArray.push(data.companyStatistical[i].times);
        }
        var companyStatisticalOption = {
            title: {
                text: '出差公司统计'
            },
            tooltip: {},
            legend: {
                data:['次数']
            },
            xAxis: {
                data: companyArray
            },
            yAxis: {},
            series: [{
                name: '次数',
                type: 'bar',
                data: companyTimesArray
            }]
        };

        var bxCostStatisticalOption = {
            title : {
                text: '已报销和未报销金额',
                subtext: '金额状态占比',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['已报销','未报销']
            },
            series : [
                {
                    name: '金额占比',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:[
                        {value:data.bxStatistical[0].ybxCost,name:'已报销'},
                        {value:data.bxStatistical[0].wbxCost,name:'未报销'}
                        ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        utils.renderChart('address_statistical',addressStatisticalOption);
        utils.renderChart('cost_statistical',costStatisticalOption);
        utils.renderChart('bx_statistical',bxCostStatisticalOption);
        utils.renderChart('company_statistical',companyStatisticalOption);
    },function (error) {

    });
});
