var dateUtils = {
    getWeekDay(year,month,day){//根据日期获取星期数
        var date = new Date(Date.parse(year+'/'+month+'/'+day));
        return date.getDay();
    },
    renderCander(parent){
        // var date = new Date();
        var date = new Date(Date.parse('2012/2/1'));
        var year=date.getFullYear();//获取当前时间的年份
        var month=date.getMonth()+1;//获取当前时间的月份数
        var monthFirstDay = this.getWeekDay(year,month,1);//获取当前月份1号的星期数
        var dayAarray = [];
        var maxDayInMonth = new Date(year,month,0).getDate();//获取某年某个月份最大的天数
        for(var i = 0;i<maxDayInMonth+monthFirstDay;i++){
            if(i < monthFirstDay){
                dayAarray.push('');
            }else{
                dayAarray.push(i-monthFirstDay+1);
            }
        }
        var tr = null;
        for(var i = 0;i<dayAarray.length;i++){
            var j = i%7;
            if(j == 0){
                tr = $('<tr></tr>');
                parent.append(tr);
            }
            tr.append('<td>'+dayAarray[i]+'</td>');
        }
    }
};