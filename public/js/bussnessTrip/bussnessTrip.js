$(function () {
    dateUtils.renderCander($('tbody'),new Date(),['日','一','二','三','四','五','六']);
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    day = day <10 ?'0'+day:day;
    window.chooseDate = day;
    month = month < 10 ?'0'+month:month;
    $('.showTime').html(year+'-'+month);
    //从缓存中获取登录账号
    $('.order_list_time').html($('.showTime').html()+'-'+day+"出差记录");
    $('#trip_modal').on('hidden.bs.modal', function (e) {
        initInfo();
    });//模态框消失时重置模态框内容
    requestMonthTripCount();
    requestOrder(day);//查询具体订单列表

});
function requestMonthTripCount() {
    var userStr = localStorage.getItem('email');
    var email = '';
    if(userStr){
        email = JSON.parse(userStr)[0];
    }
    $.ajax({
        type: 'get',
        url: '/baixiu/searchMonthTripCount',
        data: {email,date:$('.showTime').html()},
        dataType: "json",
        success: function (data) {
            //渲染出差订单
            console.log(data.resultDate);
            $(".calendar table td.date_td").each(function(){
                // let this = $(this);
                var day = $(this).html();
                day = parseInt(day)<10?'0'+day:day;
                if(data.resultDate&&data.resultDate.length > 0){
                    for(var i = 0;i<data.resultDate.length;i++){
                        var tdDate = $('.showTime').html()+'-'+day;
                        var returnDate = data.resultDate[i].year+'-'+data.resultDate[i].month+'-'+data.resultDate[i].day;
                        if(tdDate == returnDate){
                            $(this).append('<div class="triangle-topright"><span class="recode_count">'+data.resultDate[i].totalCount+'</span></div>');
                            $(this).addClass('has_count');
                        }
                    }
                }

            });

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("请求失败！");
        }

    });
}
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
    requestMonthTripCount();
}
function addRecode(obj) {
    //给选中的日期添加样式
    $('table tr .date_td').removeClass("chooseDate");
    $(obj).addClass('chooseDate');
    //发送请求获取订单列表
    var day = parseInt($(obj).html())<10?'0'+$(obj).html():$(obj).html();
    console.log($(obj).html())
    window.chooseDate = day;
    requestOrder(day);
}
function showAddInfo() {
    $('#trip_start_time').val($('.showTime').html()+'-'+window.chooseDate);
    // console.log($('.showTime').html()+'-'+window.chooseDate);
}
function addTripRecord() {//添加出差记录
    //校验必填字段是否已经填写完整
    var startDate = $('#trip_start_time').val();
    if(!startDate){
        alert('请填写出差起始时间');
        return;
    }
    var endDate = $('#trip_end_time').val();
    if(!endDate){
        alert('请填写出差结束时间');
        return;
    }
    var startCompany = $('#start_company').val();
    if(!startCompany){
        alert('请填写出差起始地');
        return;
    }
    var endCompany = $('#end_company').val();
    if(!endCompany){
        alert('请填写出差目的地');
        return;
    }
    var userStr = localStorage.getItem('email');
    var email = '';
    if(userStr){
        email = JSON.parse(userStr)[0];
    }
    $.ajax({
        type: 'post',
        url: '/baixiu/addRecord',
        data: {
                email,
                startDate:$('.showTime').html()+'-'+window.chooseDate,
                endDate,
                startCompany,
                endCompany
              },
        dataType: "json",
        success: function (data) {
            //渲染出差订单
            if(data.status == 0){
                $('#trip_modal').modal('toggle');
                //添加成功重新刷新列表
                requestOrder(window.chooseDate);
            }else{
                alert(data.desc);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("请求失败！");
        }

    });

}
function initInfo() {//初始化弹框内容
    $('#trip_start_time').val('');
    $('#trip_end_time').val('');
    $('#start_company').val('');
    $('#end_company').val('');
}