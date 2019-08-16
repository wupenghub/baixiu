var utils = require('../../util/utils.js');
var MnuePerSql = require('../../db/menuPermissionMaintenance/MnuePerSql.js');
var DbUtils = require('../../DbUtils');
var MnuePerRequest = {
    //跳转权限管理页面
    toMnuePermissionPage(req,res){
        utils.renderPage(req,res,'menuPermissionMaintenance.html');
    },
    //查询菜单权限列表
    searchMnuePremissionList(req,res){
        var returnObj = {};
        returnObj.returnData = {
            offset: req.query.offset,
            pageSize: req.query.pageSize,
        };
        var queryCount = MnuePerSql.searchMnuePremissionListCountSql();
        console.log('searchMnuePremissionList查询菜单权限个数：'+queryCount);
        DbUtils.queryData(queryCount,function (result) {
            if (result && result[0].count != '0') {
                returnObj.totalCount = result[0].count;
                var sql = MnuePerSql.searchMnuePremissionListSql(req.query.offset,req.query.pageSize);
                console.log('searchMnuePremissionList查询菜单权限列表：'+sql);
                DbUtils.queryData(sql,function (result) {
                    returnObj.status = 0;
                    returnObj.returnData.returnData = result;
                    res.json(returnObj);
                },function (error) {
                    res.json({
                        status:-1,
                        desc:error
                    })
                });
            }else {
                returnObj.getlist_status = 1;
                returnObj.getlist_desc = '未获取到数据';
                res.json(returnObj);
            }
        },function (error) {
            returnObj.status = -1;
            returnObj.desc = error;
            res.json(returnObj);
        });
    },
    getMnueList(req,res){
        var sql = MnuePerSql.getMnueListSql();
        DbUtils.queryData(sql,function (result) {
            for (var i = 0; i < result.length; i++) {
                utils.addList(result, result[i]);
            }
            // 将result中所有节点parent_id值不为空的给踢出掉
            var array = [];
            for (var i = 0; i < result.length; i++) {
                if (!result[i]['parent_id']) {
                    array.push(result[i]);
                }
            }
            res.json({dataJsonArr:array})
        });
    },
    maintenancePermission(req,res){
        var permissionsCode = req.body.permissionsCode;
        var mnueIdList = req.body.mnueIdList;
        var sqlParamsEntity = [];
        //先将数据库中存在的权限删除
        var deleteMnueSqlById = MnuePerSql.deleteMnueSqlById();
        var deletesqlParam = [permissionsCode];
        var deletesqlobj = {
            sql: deleteMnueSqlById,
            params: deletesqlParam
        };
        sqlParamsEntity.push(deletesqlobj);
        //之后进行新增
        var mnueIdArr = mnueIdList.split(',');
        mnueIdArr.forEach((mnueId)=>{
            var insertMnueSqlById = MnuePerSql.insertMnueSqlById();
            var insertsqlParam = [permissionsCode,mnueId];
            var insertsqlobj = {
                sql: insertMnueSqlById,
                params: insertsqlParam
            };
            sqlParamsEntity.push(insertsqlobj);
        });
        DbUtils.execTrans(sqlParamsEntity,function (error,info) {
            if(error){
                res.json({status:-1,desc:error})
            }else{
                res.json({
                    status:0,
                    desc:'权限维护成功'
                })
            }

        });
    },
    searchPremissionList(req,res){
       var queryPremissionList = MnuePerSql.queryPremissionList();
       console.log('查询权限列表：'+queryPremissionList);
       DbUtils.queryData(queryPremissionList,function (result) {
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
    queryMnuesByPermission(req,res){
        var queryMnuesByPermission = MnuePerSql.queryMnuesByPermission(req.query.permissionsCode);
        console.log('查询权限菜单列表：'+queryMnuesByPermission);
        DbUtils.queryData(queryMnuesByPermission,function (result) {
            res.json({
                status:0,
                returnData:result
            })
        },function (error) {
            res.json({
                status:-1,
                desc:error
            })
        });
    }
};
module.exports = MnuePerRequest;