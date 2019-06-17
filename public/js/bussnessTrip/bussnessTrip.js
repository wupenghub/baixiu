$(function () {
    dateUtils.renderCander($('tbody'),new Date(),['日','一','二','三','四','五','六']);
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    month = month < 10 ?'0'+month:month;
    $('.showTime').html(year+'-'+month);
    //从缓存中获取登录账号
    var userStr = localStorage.getItem('email');
    var email = '';
    if(userStr){
        email = JSON.parse(userStr)[0];
    }
    $.ajax({
        type: 'get',
        url: '/baixiu/searchOrder',
        data: {email,date:$('.showTime').html()+'-'+day},
        dataType: "json",
        success: function (data) {
            //渲染出差订单
            var statusListtml = template('tripList',data);
            console.log(statusListtml)
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("请求失败！");
        }

    });
});
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
}