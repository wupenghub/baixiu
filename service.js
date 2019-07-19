var utils = require('./util/utils');
var path = require('path');
var fs = require('fs');
const schedule = require('node-schedule');
var service = {
  startDeleteFileJob(dirpath){
      //每小时的1分30秒触发
      schedule.scheduleJob('30 1 * * * *', function(){
          console.log('执行删除文件操作');
          //先判断是否有bxFile目录没有就先创建
          dirpath = path.join(__dirname,'./bxFile');
          if(!fs.existsSync(dirpath)){
             return;
          }
          utils.deleDirectory(dirpath);
      });
  }
};
module.exports = service;