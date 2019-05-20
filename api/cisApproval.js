var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
var apiUtils = require('./apiUtils.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
let excelUtils = require('../util/ExcelUtils.js');
var cisUtils = require('../util/CisUtils.js');
var async = require("async");
//下载模板
router.post('/baixiu/cisTemplateDownLoad', function (req, res) {
    exportFile(res, req.body.filename);
});
//人员配置模板
router.post('/baixiu/getExcel', multipartMiddleware, function (req, res) {
    var tmp_path = req.files.templateFile.path;
    var cisDivCode = req.body.cisdiv;
    var cisDivDesc = req.body.desc;
    var userArray = [];//定义一个人员数组，将人员放置在此集合中
    //['用户组权限','调度组','待办事项角色']
    var sheetNames = ['用户组权限', '调度组', '待办事项角色'];
    //添加人员并且配置人员的用户组权限，调度组，待办事项角色
    excelUtils.readExcel(tmp_path, sheetNames, function (data) {
        for (var item in data) {
            if (item == '用户组权限') {
                cisUtils.addUserGroupPermissions(userArray, data[item], cisDivDesc);
            }
            if (item == '调度组') {
                cisUtils.addUserDispAndRoll(userArray, data[item], cisDivDesc, true);
            }
            if (item == '待办事项角色') {
                cisUtils.addUserDispAndRoll(userArray, data[item], cisDivDesc, false);
            }
        }
    });
    //生成用户的cisId
    cisUtils.generateCisId(userArray, cisDivCode);
    cisUtils.matchCode(userArray,cisDivDesc,function () {
        var data = cisUtils.exportCisConfig(userArray);
        cisUtils.test(userArray);
        excelUtils.writeExcel(data, cisDivDesc + "人员配置.xlsx");
    });
    // cisUtils.test(userArray);
    //导出用户组权限，调度组，待办事项角色
    // var data = cisUtils.exportCisConfig(userArray);
    // excelUtils.writeExcel(data, cisDivDesc + "人员配置.xlsx");
    //将人员对应的调度组，用户组权限，待办事项角色中文与英文进行对应
  /*  setTimeout(function () {
        exportFile(res,cisDivDesc + "人员配置.xlsx");
    },1000);*/
    res.json({status:1})
    // var b = exportFile(res,cisDivDesc + "人员配置.xlsx");
    // async.series([a, b]);
});
//生成材料单配置
router.post('/baixiu/sqlExcel', multipartMiddleware,function (req,res) {
    var tmp_path = req.files.templateFile.path;
    var cisDiv = req.body.cisDiv;
    var sqiTypeCode = cisDiv + 'CL';
    excelUtils.readExcel(tmp_path, ['材料信息'], function (data) {
        //获取当前最大的材料编码
        var sql = "select c.bo_data_area as boData,(select max(to_number(SUBSTR(I.SQI_CD, 5)))from ci_sqi i where i.sqi_cd like '"+sqiTypeCode+"%') AS maxNum from c1_calc_rule c where rownum = 1";
        console.log(sql);
        var sjSqiData = data['材料信息'];
        DbUtils.queryCisData(sql,function (result) {
            var ciSqiConfigData = {};
            var startIndex = Number(result[0]&&result[0]['MAXNUM']) + 1;
            var boData = result[0]['BODATA'];
            var sqiCdArray = [];
            //配置ci_sqi表数据
            sqlDataConfig(sqiCdArray,ciSqiConfigData,'ci_sqi',['SQI_CD','VERSION','DECIMAL_POSITIONS'],sjSqiData,sqiTypeCode,startIndex);
            //配置ci_sqi_l
            sqlDataConfig(sqiCdArray,ciSqiConfigData,'ci_sqi_l',['SQI_CD','LANGUAGE_CD','DESCR','VERSION'],sjSqiData,sqiTypeCode,startIndex);
           //配置c1_calc_rule
            sqlDataConfig(sqiCdArray,ciSqiConfigData,'c1_calc_rule',['CALC_GRP_CD','CALC_RULE_CD','CR_EXEC_SEQ','REF_CALC_GRP_CD','CALC_RULE_STEP_ALG_CD','CALC_RULE_VAL_ALG_CD','UOM_CD','TOU_CD','SQI_CD','ITEM_TYPE_CD','BF_CD','BUS_OBJ_CD','BO_DATA_AREA','VERSION','DST_ID'],sjSqiData,sqiTypeCode,startIndex,cisDiv,boData);
            excelUtils.writeExcel(ciSqiConfigData,cisDiv+'材料配置.xlsx');
            res.json({status:1});
        },function (err) {
            console.log(err)
        })
    });
});
function sqlDataConfig(sqiCdArray,sqlDataArray,tableName,headArray,sjSqiData,sqiTypeCode,startIndex,cisDiv,boData) {
    var ciSqiData = sqlDataArray[tableName] || [];
    console.log(sjSqiData);
    ciSqiData.push(headArray);
    for(var i = 0;i<sjSqiData.length;i++){
        var sjObj = sjSqiData[i];
        if(i > 1){
            var configObj = [];
            if(tableName == 'ci_sqi') {
                configObj.push(sqiTypeCode + startIndex);
                configObj.push('1');
                configObj.push(sjObj['PRECISION']);
                ciSqiData.push(configObj);
                sqiCdArray.push(sqiTypeCode + startIndex);
                startIndex++;
            }else if(tableName == 'ci_sqi_l'){
                configObj.push(sqiCdArray[i-2]);
                configObj.push('ZHS');
                if(sjObj['ERP_CODE']!= undefined && sjObj['ERP_CODE']!= ''){
                    configObj.push(sjObj['ERP_CODE']+'_'+sjObj['DESC']);
                }else{
                    configObj.push('00000000_'+sjObj['DESC']);
                }
                configObj.push('1');
                ciSqiData.push(configObj);
                configObj = [];
                configObj.push(sqiCdArray[i-2]);
                configObj.push('ENG');
                if(sjObj['ERP_CODE']!= undefined && sjObj['ERP_CODE']!= ''){
                    configObj.push(sjObj['ERP_CODE']+'_'+sjObj['DESC']);
                }else{
                    configObj.push('00000000_'+sjObj['DESC']);
                }                configObj.push('1');
                ciSqiData.push(configObj);
            }else if(tableName == 'c1_calc_rule'){
                configObj.push(cisDiv+'CLFW');//calc_grp_cd
                configObj.push(sqiCdArray[i-2]);//calc_rule_cd
                configObj.push(sqiCdArray[i-2].replace(sqiTypeCode,''));//cr_exec_seq
                configObj.push(' ');//ref_calc_grp_cd
                configObj.push(' ');//calc_rule_step_alg_cd
                configObj.push(' ');//calc_rule_val_alg_cd
                configObj.push(' ');//uom_cd
                configObj.push(' ');//tou_cd
                configObj.push(sqiCdArray[i-2]);//sqi_cd
                configObj.push(' ');//item_type_cd
                configObj.push(sqiCdArray[i-2]);//bf_cd
                configObj.push('C1-ServiceQuantity');//bus_obj_cd
                //重新拼接boDataArea
                var substrStartIndex = boData.indexOf('<billFactor>')+'<billFactor>'.length;
                var substrEndIndex = boData.indexOf('</billFactor>');
                var newBoData = boData.substring(0,substrStartIndex)+sqiCdArray[i-2]+boData.substring(substrEndIndex,boData.length);
                configObj.push(newBoData);//bo_data_area
                configObj.push('1');//version
                configObj.push('OOR_OTHER');//dst_id
                ciSqiData.push(configObj);
            }
        }
    }
    sqlDataArray[tableName] = ciSqiData;
}
function exportFile(res, fileName) {
    var file = './' + fileName;
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + encodeURI(fileName),//告诉浏览器这是一个需要下载的文件
    });//设置响应头
    var readStream = fs.createReadStream(file);//得到文件输入流
    readStream.on('data', (chunk) => {
        res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
    });
    readStream.on('end', () => {
        res.end();
    });
    /*var file = './' + fileName;
    fs.exists(file, function (exists) {
        if (exists) {
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
                'Content-Disposition': 'attachment; filename=' + encodeURI(fileName),//告诉浏览器这是一个需要下载的文件
            });//设置响应头
            var readStream = fs.createReadStream(file);//得到文件输入流
            readStream.on('data', (chunk) => {
                res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
            });
            readStream.on('end', () => {
                res.end();
            });
        }
        else {
            res.end('文件还未生成，请稍等');
        }

    });*/
}


module.exports = router;