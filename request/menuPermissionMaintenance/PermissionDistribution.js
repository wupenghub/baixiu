var utils = require('../../util/utils.js');
var DbUtils = require('../../DbUtils');
var PermissionDistributionSql = require('../../db/menuPermissionMaintenance/PermissionDistributionSql.js');
var PermissionDistribution = {
    renderPermissionDistributionPage(req, res) {
        utils.renderPage(req,res,'permissionDistribution.html');
    },
    getUserListData(req,res){
        var returnObj = {};
        returnObj.returnData = {
            offset: req.query.offset,
            pageSize: req.query.pageSize,
            email: req.query.email,
            nickName: req.query.nickName
        };
        var queryCountSql = PermissionDistributionSql.getUserCount(req.query.email,req.query.nickName);
        console.log('getUserListData查询人员总数：'+queryCountSql);
        DbUtils.queryData(queryCountSql,function (result) {
            returnObj.totalCount = result[0].count;
            if (result && parseInt(result[0].count) > 0) {
                var querySql = PermissionDistributionSql.getUserListData(req.query.offset,req.query.pageSize,req.query.email,req.query.nickName);
                console.log('getUserListData查询人员：'+querySql);
                DbUtils.queryData(querySql,function (resultList) {
                    if (resultList && resultList.length > 0) {
                        returnObj.getlist_status = 0;
                        returnObj.getlist_desc = '获取数据成功';
                        returnObj.usersJsonArray = resultList;
                    } else {
                        returnObj.getlist_status = 1;
                        returnObj.getlist_desc = '未获取到数据';
                    }
                    res.json(returnObj);
                })
            }else{
                returnObj.getlist_status = 1;
                returnObj.getlist_desc = '未获取到数据';
                res.json(returnObj);
            }
        },function (error) {
            returnObj.getlist_status = -1;
            returnObj.getlist_desc = error;
            res.json(returnObj);
        });
    },
    searchUserPerList(req,res){
        var userExist = PermissionDistributionSql.userExistSql(req.query.email);
        //查询权限清单
        DbUtils.queryData(userExist,function (result) {
            if(parseInt(result[0].count) == 0){
                res.json({
                    status:1,
                    desc:'未查询到此用户'
                });
            }else{
                var returnData = {};
                var queryUserInfo = PermissionDistributionSql.queryUserInfo(req.query.email);
                returnData.status = 3;
                returnData.desc = '未知错误';
                console.log('searchUserPerList查询人员菜单权限：'+queryUserInfo);
                DbUtils.queryData(queryUserInfo,function (result) {
                    returnData.mnueJsonArray = result;
                    var queryCompanySql = PermissionDistributionSql.userCompanySql(req.query.email);
                     DbUtils.queryData(queryCompanySql,function (result) {
                         returnData.companyJsonArray = result;
                         returnData.status = 0;
                         res.json(returnData);
                     },function (error) {
                         returnData.status = -1;
                         returnData.desc = error;
                         res.json(returnData);
                     });

                },function (error) {
                    returnData.status = -1;
                    returnData.desc = error;
                    res.json(returnData);
                });
            }
        },function (error) {
            var returnData = {};
            returnData.status = -1;
            returnData.desc = error;
            res.json(returnData);
        })
    },
    updateUserPermission(req,res){
        var companyArr = req.body.companyArr;
        var mnuePerArr = req.body.mnuePerArr;
        var dataPerArr = req.body.dataPerArr;
        var email = req.body.email;
        dataPerArr = '1';
        if(companyArr)
            companyArr = arrRemoverepeat(companyArr.split(','));
        if(mnuePerArr)
            mnuePerArr = arrRemoverepeat(mnuePerArr.split(','));
        if(dataPerArr)
            dataPerArr = arrRemoverepeat(dataPerArr.split(','));
        var sqlParamsEntity = [];
        //先将数据库中存在的权限删除
        var deleteCompanySqlById = PermissionDistributionSql.deleteCompanySqlById();
        var deleteCompanySqlParam = [email];
        addSql(sqlParamsEntity,deleteCompanySqlById,deleteCompanySqlParam);

        var deleteMnuePerSqlById = PermissionDistributionSql.deleteMnuePerSqlById();
        var deleteMnuePerParam = [email];
        addSql(sqlParamsEntity,deleteMnuePerSqlById,deleteMnuePerParam);


        //之后进行新增
        if(companyArr) {
            companyArr.forEach((companyCode) => {
                var insertCompanySql = PermissionDistributionSql.insertCompanySql();
                var insertsqlParam = [companyCode, email];
                addSql(sqlParamsEntity, insertCompanySql, insertsqlParam);
            });
        }
        if(mnuePerArr) {
            mnuePerArr.forEach((mnueCode) => {
                var insertMnuePerSql = PermissionDistributionSql.insertMnuePerSql();
                var insertsqlParam = [mnueCode, email];
                addSql(sqlParamsEntity, insertMnuePerSql, insertsqlParam);
            });
        }
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
    }
};
function arrRemoverepeat(arr) {
    var newArr = [];
    if(arr) {
        for (var i = 0; i < arr.length; i++) {
            if(newArr.indexOf(arr[i]) == -1){
                newArr.push(arr[i])
            }
        }
    }
    return newArr;
}
function addSql(sqlArr,sql,paramArr) {
    var obj = {
        sql: sql,
        params: paramArr
    };
    sqlArr.push(obj);
}
module.exports = PermissionDistribution;