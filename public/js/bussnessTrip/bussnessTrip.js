$(function () {
    dateUtils.renderCander($('tbody'),new Date(),['日','一','二','三','四','五','六']);
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    day = day <10 ?'0'+day:day;
    month = month < 10 ?'0'+month:month;
    $('.showTime').html(year+'-'+month);
    //从缓存中获取登录账号
    $('.order_list_time').html($('.showTime').html()+'-'+day+"出差记录");
    requestOrder(day);
    $('#datetimepicker1').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: moment.locale('zh-cn')
    });
});
function requestOrder(day) {
    var userStr = localStorage.getItem('email');
    var email = '';
    if(userStr){
        email = JSON.parse(userStr)[0];
    }
    $('.order_list_time').html($('.showTime').html()+'-'+day+"出差记录");
    $.ajax({
        type: 'get',
        url: '/baixiu/searchOrder',
        data: {email,date:$('.showTime').html()+'-'+day},
        dataType: "json",
        success: function (data) {
            //渲染出差订单
            var statusListtml = template('trip_list',data);
            console.log(statusListtml);
            $('.order-list').html(statusListtml);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("请求失败！");
        }

    });
}
function changeMonth(type) {
    var showTime = $('.calendar .showTime').html();
    var year = showTime.split('-')[0];
    var month = parseInt(showTime.split('-')[1]);
    var currentDateMonth = new Date(year,month,0);
    var changeMonth = '';
    if(type == '-') {
        changeMonth = currentDateMonth.getMonth() - 1;
    }else{
        changeMonth = currentDateMonth.getMonth() + 1;
    }
    currentDateMonth.setMonth(changeMonth,1);
    dateUtils.renderCander($('tbody'),currentDateMonth,['日','一','二','三','四','五','六'])
}
function addRecode(obj) {
    var day = parseInt($(obj).html())<10?'0'+$(obj).html():$(obj).html()
    requestOrder(day);
}
function addTripRecord() {//添加出差记录

}