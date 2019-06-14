$(function () {
    dateUtils.renderCander($('tbody'),new Date(),['日','一','二','三','四','五','六']);
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    month = month < 10 ?'0'+month:month;
    $('.showTime').html(year+'-'+month);
});
function changeMonth(type) {
    var showTime = $('.showTime').html();
    var year = showTime.split('-')[0];
    var month = parseInt(showTime.split('-')[1]);
    var currentDateMonth = new Date(year,month,0);
    var changMonth = '';
    if(type == '-') {
        // currentDateMonth.setMonth(currentDateMonth.getMonth() - 1);
        changMonth = currentDateMonth.getMonth() - 1;
    }else{
        // currentDateMonth.setMonth(currentDateMonth.getMonth() + 1);
        changMonth = currentDateMonth.getMonth() + 1;
    }
    currentDateMonth.setMonth(changMonth);
    dateUtils.renderCander($('tbody'),currentDateMonth,['日','一','二','三','四','五','六'])
}