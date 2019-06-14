var dateUtils = {
    getWeekDay(year,month,day){//根据日期获取星期数
        var date = new Date(Date.parse(year+'/'+month+'/'+day));
        return date.getDay();
    },
    renderCander(parent,date,weekArray){
        parent.empty();
        var nowDate = new Date();//当前时间
        var nowYear = nowDate.getFullYear();//当前年份
        var nowMonth = nowDate.getMonth()+1;//当前月份
        var nowDay = nowDate.getDate();//当前日期数
        var year=date.getFullYear();//获取指定时间的年份
        var month=date.getMonth()+1;//获取指定时间的月份数
        var monthStr = month < 10 ? '0'+month:month;
        $('.showTime').html(year+'-'+monthStr);
        var monthFirstDay = this.getWeekDay(year,month,1);//获取指定月份1号的星期数
        var dayAarray = [];
        var maxDayInMonth = new Date(year,month,0).getDate();//获取某年某个月份最大的天数
        var nowDateString = nowYear+'/'+nowMonth+'/'+nowDay;
        for(var i = 0;i<maxDayInMonth+monthFirstDay;i++){
            if(i < monthFirstDay){
                dayAarray.push('');
            }else{
                dayAarray.push(i-monthFirstDay+1);
            }
        }
        var tr = null;
        var thr = $('<tr></tr>');
        for(var i = 0;i<weekArray.length;i++){
            thr.append('<td style="border-bottom: 1px solid gray">'+weekArray[i]+'</td>');
        }
        parent.append(thr);
        for(var i = 0;i<dayAarray.length;i++){
            var j = i%7;
            if(j == 0){
                tr = $('<tr></tr>');
                parent.append(tr);
            }
            var dateString = year+'/'+month+'/'+dayAarray[i];
            if(nowDateString==dateString){
                tr.append('<td class="now">'+dayAarray[i]+'</td>');
            }else{
                tr.append('<td>'+dayAarray[i]+'</td>');
            }
        }
    }
};