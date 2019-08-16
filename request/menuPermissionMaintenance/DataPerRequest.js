var utils = require('../../util/utils.js');
var DbUtils = require('../../DbUtils');
var DataPermissionDistributionSql = require('../../db/menuPermissionMaintenance/DataPermissionMaintenanceSql.js');
var DataPerRequest = {
    dataPermissionMaintance(req,res){
        utils.renderPage(req,res,'dataPermissionMaintenance.html');
    },
    searchDataPermissionTypeList(req,res){
        var returnObj = {};
        returnObj.returnData = {
            offset: req.query.offset,
            pageSize: req.query.pageSize,
        };
        var queryCountSql = DataPermissionDistributionSql.queryCountSql();
        DbUtils.queryData(queryCountSql, function (result) {
            if (result && result[0].count != '0') {
                returnObj.totalCount = result[0].count;
                var querySql = DataPermissionDistributionSql.searchDataPermissionTypeList(req.query.offset,req.query.pageSize);
                console.log('searchDataPermissionTypeList查询数据：' + querySql);
                DbUtils.queryData(querySql, function (resultList) {
                    if (resultList && resultList.length > 0) {
                        returnObj.getlist_status = 0;
                        returnObj.getlist_desc = '获取数据成功';
                        returnObj.permissionTypeJsonArray = resultList;
                    } else {
                        returnObj.getlist_status = 1;
                        returnObj.getlist_desc = '未获取到数据';
                    }
                    res.json(returnObj);
                });
            } else {
                returnObj.getlist_status = 1;
                returnObj.getlist_desc = '未获取到数据';
                res.json(returnObj);
            }
        }, function () {
            returnObj.getlist_status = -1;
            returnObj.getlist_desc = '未获取到数据';
            res.json(returnObj);
        });
    },
    searchDataPermissionTypeInfo(req,res){
       var dataPermissionSql = DataPermissionDistributionSql.searchDataPermissionTypeInfo(req.query.permissionTypeCode);
       DbUtils.queryData(dataPermissionSql,function (result) {
           res.json({
               status:0,
               returnData:result
           });
       },function (error) {
           res.json({
               status:-1,
               desc:error
           });
       });
    },
    modifyDataPermissionTypeDesc(req,res){
        var modifyDataPermissionDescSql = DataPermissionDistributionSql.modifyDataPermissionTypeDesc(req.body.permissionTypeCode,req.body.permissionTypeDesc);
        console.log('modifyDataPermissionTypeDesc修改数据权限名称：'+modifyDataPermissionDescSql);
        DbUtils.queryData(modifyDataPermissionDescSql,function (result) {
            res.json({
                status:0,
                desc:'修改成功'
            });
        },function (error) {
            res.json({
                status:-1,
                desc:error
            });
        });
    }
};
module.exports = DataPerRequest;