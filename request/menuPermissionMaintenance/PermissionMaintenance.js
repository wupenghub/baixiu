var utils = require('../../util/utils.js');
var PermissionMaintenanceSql = require('../../db/menuPermissionMaintenance/PermissionMaintenanceSql.js');
var DbUtils = require('../../DbUtils');
var PermissionMaintenance = {
    renderPremissionMaintancePage(req,res){
        utils.renderPage(req,res,'permissionMaintenance.html');
    },
    searchPermissionTypeList(req,res){
        var returnObj = {};
        returnObj.returnData = {
            offset: req.query.offset,
            pageSize: req.query.pageSize,
        };

        var queryCountSql = PermissionMaintenanceSql.queryCountSql();
        DbUtils.queryData(queryCountSql, function (result) {
            if (result && result[0].count != '0') {
                returnObj.totalCount = result[0].count;
                var querySql = PermissionMaintenanceSql.searchPermissionTypeList(req.query.offset,req.query.pageSize);
                console.log('searchCostTypeMaintenanceList查询数据：' + querySql);
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
    searchPermissionTypeInfo(req,res){
        var sql = PermissionMaintenanceSql.searchPermissionTypeInfo(req.query.permissionTypeCode);
        DbUtils.queryData(sql,function (result) {
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
    modifyPermissionTypeDesc(req,res){
        var sql = PermissionMaintenanceSql.modifyPermissionTypeDesc(req.body.permissionTypeCode,req.body.permissionTypeDesc);
        console.log('modifyPermissionTypeDesc修改权限名称：'+sql);
        DbUtils.queryData(sql,function (result) {
            res.json({
                status:0,
                desc:'修改成功'
            })
        },function (error) {
            res.json({
                status:-1,
                desc:error
            })
        });
    },
    addPermissionInfo(req,res){
        var sql = PermissionMaintenanceSql.queryCount(req.body.permissionCode);
        DbUtils.queryData(sql,function (result) {
            if(result&&parseInt(result[0].count) == 0 ){
                var querySql = PermissionMaintenanceSql.addPermissionInfo(req.body.permissionCode,req.body.permissionDesc);
                console.log('addPermissionInfo新增权限：'+querySql);
                DbUtils.queryData(querySql,function (result) {
                    res.json({
                        status:0
                    });
                },function (error) {

                });
            }else{
                res.json({
                    status:1,
                    desc:'该权限编码已经存在，不能重复新增。'
                })
            }
        },function (error) {
            res.json({
                status:-1,
                desc:error
            })
        });
    }
};
module.exports = PermissionMaintenance;
