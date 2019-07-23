/**=================================用户组权限开始================================*/
var pinyin = require('pinyin');
var DbUtils = require('../DbUtils');
var cisUtils = {
    addUser(userArray,addNameUser){
        var contains = false;
        for (var j = 0; j < userArray.length; j++) {
            if (cisUtils.removeBlank(addNameUser.userName) == cisUtils.removeBlank(userArray[j].userName)) {
                contains = true;
                break;
            }
        }
        //不存在此人员则进行添加
        if (!contains) {
            console.log('==============================')
            userArray.push(addNameUser);
        }
    },
    addUserGroupPermissions(userArray, userGroupPermissionsArray, cisDivDesc) {
        for (var i = 0; i < userGroupPermissionsArray.length; i++) {
            var userGroupObj = userGroupPermissionsArray[i];
            var addName = userGroupObj['姓名'];
            var userPhone = userGroupObj['电话'];
            var contains = false;
            var user = null;
            for (var j = 0; j < userArray.length; j++) {
                if (cisUtils.removeBlank(addName) == cisUtils.removeBlank(userArray[j].userName)) {
                    user = userArray[j];
                    contains = true;
                    break;
                }
            }
            if (contains) {
                //如果已经存在人员，判断此人员是否已经有用户组权限集合
                if (user && user.userGroupPermissArr && user.userGroupPermissArr.length > 0) {
                    //已经有用户组权限，再次判断此集合是否已经包含遍历的用户组
                    cisUtils.addPermiss(user, userGroupObj, cisDivDesc);
                }
            } else {
                user = {};
                user.userGroupPermissArr = [];
                user.userName = cisUtils.removeBlank(addName);
                user.userPhone = userPhone;
                cisUtils.addPermiss(user, userGroupPermissionsArray[i], cisDivDesc);
                userArray.push(user);
            }
        }

    },

    addPermiss(user, userGroupPermissionsObj, cisDivDesc) {
        for (var item in userGroupPermissionsObj) {
            if (item.indexOf('用户组') != -1) {
                var compareGroup = userGroupPermissionsObj[item];
                cisUtils.addPermissInObj(user, compareGroup, cisDivDesc);
            }
        }
    },

    addPermissInObj(user, compareGroup, cisDivDesc) {
        var userGroupArr = user.userGroupPermissArr;
        var contain = false;
        for (var i = 0; i < userGroupArr.length; i++) {
            if ((cisDivDesc + cisUtils.removeBlank(userGroupArr[i]).replace(cisDivDesc, '')) == (cisDivDesc + cisUtils.removeBlank(compareGroup).replace(cisDivDesc, ''))) {
                contain = true;
                break;
            }
        }
        if (!contain) {
            userGroupArr.push(cisDivDesc + cisUtils.removeBlank(compareGroup).replace(cisDivDesc, ''));
        }

    },

    /**=================================用户组权限结束================================*/
    /**=================================调度组和待办事项角色开始=================================*/
    addUserDispAndRoll(userArray, userDispArray, cisDivDesc, isDispGroup) {
        for (var i = 0; i < userDispArray.length; i++) {
            var dispUser = userDispArray[i];
            for (var item in dispUser) {
                var addUserName = cisUtils.removeBlank(dispUser[item]);
                var contain = false;
                var user = null;
                for (var j = 0; j < userArray.length; j++) {
                    var userName = cisUtils.removeBlank(userArray[j].userName);
                    if (addUserName == userName) {
                        contain = true;
                        user = userArray[j];
                        break;
                    }
                }
                if (contain) {
                    if (user) {
                        if (isDispGroup) {
                            if (!user.dispGroup) {
                                user.dispGroup = [];
                            }
                        } else {
                            if (!user.userRolls) {
                                user.userRolls = [];
                            }
                        }
                        cisUtils.addUserObj(user, item, cisDivDesc, isDispGroup);
                    }
                } else {
                    var newUser = {};
                    newUser.userName = addUserName;
                    if (isDispGroup) {
                        newUser.dispGroup = [];
                    } else {
                        newUser.userRolls = [];
                    }

                    cisUtils.addUserObj(newUser, item, cisDivDesc, isDispGroup);
                    userArray.push(newUser);
                }
            }
        }
    },

    addUserObj(user, dispDesc, cisDivDesc, isDispGroup) {
        var userDispArray = isDispGroup ? user.dispGroup : user.userRolls;
        var contain = false;
        for (var i = 0; i < userDispArray.length; i++) {
            if ((cisDivDesc + cisUtils.removeBlank(userDispArray[i]).replace(cisDivDesc, '')) == (cisDivDesc + cisUtils.removeBlank(dispDesc).replace(cisDivDesc, ''))) {
                contain = true;
                break;
            }
        }
        if (!contain) {
            userDispArray.push(cisDivDesc + cisUtils.removeBlank(dispDesc).replace(cisDivDesc, ''));
        }
    },
    /**=================================调度组和待办事项角色结束=================================*/
    removeBlank(value) {
        if(value){
            return value.replace(/\s/g, "");
        }

    },
    test(userArray) {
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            // var userRolls = user.userRolls || [];
            // var userGroup = user.userGroupCode || [];
            var userDisp = user.dispGroup || [];
            console.log(user.userName + ':调度组' + userDisp.length);
        }
    },
    generateCisId(userArray, cisDivCode) {
        var firstIndex = 801001;
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            user.userId = cisDivCode + (firstIndex++).toString();
            user.userCode = cisUtils.wordChangePinyin(user.userName);
        }
    },
    wordChangePinyin(userName) {
        var userCode = '';
        if(userName) {
            for (var i = 0; i < userName.length; i++) {
                if (userName.length > 2) {
                    if (i == 0) {
                        userCode += pinyin(userName[i], {style: pinyin.STYLE_NORMAL});
                    } else {
                        userCode += pinyin(userName[i], {style: pinyin.STYLE_NORMAL}).toString().substring(0, 1);
                    }
                } else {
                    userCode += pinyin(userName[i], {style: pinyin.STYLE_NORMAL});
                }
            }
            return userCode.toLocaleUpperCase();
        }
    },
    exportCisConfig(userArray){
        var userGroupHead = ['USR_GRP_ID','USER_ID','VERSION','EXPIRATION_DT','OWNER_FLG'];
        var userDispHead = ['DISP_GRP_CD','USER_ID','VERSION'];
        var userRollHead = ['ROLE_ID','USER_ID','VERSION'];
        var userHead = ['FIRST_NAME','LAST_NAME','USER_CODE','USER_ID','PHONE'];
        var userGroupData = [];
        var userDispData = [];
        var userRollData = [];
        var userInfo = [];
        userGroupData.push(userGroupHead);
        userDispData.push(userDispHead);
        userRollData.push(userRollHead);
        userInfo.push(userHead);
        for(var i = 0;i<userArray.length;i++){
            console.log(userArray[i].userName);
            var user = userArray[i];
            var userGroup = user.userGroupCode;
            var userDisp = user.userDispCode;
            var userRoll = user.userRollCode;
            var userObj = [];
            var firstName = user.userName&&user.userName.substring(0,1);
            var lastName = user.userName&&user.userName.substring(1,user.userName.length);
            var userCode  = user.userCode;
            userObj.push(firstName);
            userObj.push(lastName);
            userObj.push(userCode);
            userObj.push(user.userId);
            userObj.push(user.userPhone);
            userInfo.push(userObj);
            if(userGroup){
                for(var j = 0;j<userGroup.length;j++){
                    var obj = [];
                    obj.push(userGroup[j]);
                    obj.push(user.userId);
                    obj.push('1');
                    obj.push('2100/1/1');
                    obj.push('CM');
                    obj.push(user.userName);
                    userGroupData.push(obj);
                }
            }
            if(userDisp){
                for(var j = 0;j<userDisp.length;j++){
                    var obj = [];
                    obj.push(userDisp[j]);
                    obj.push(user.userId);
                    obj.push('1');
                    obj.push(user.userName);
                    userDispData.push(obj);
                }
            }
            if(userRoll){
                for(var j = 0;j<userRoll.length;j++){
                    var obj = [];
                    obj.push(userRoll[j]);
                    obj.push(user.userId);
                    obj.push('1');
                    obj.push(user.userName);
                    userRollData.push(obj);
                }
            }

        }
        var cisObjData = {};
        cisObjData['sc_usr_grp_usr'] = userGroupData;
        cisObjData['ci_disp_grp_rep'] = userDispData;
        cisObjData['ci_role_user'] = userRollData;
        cisObjData['sc_user'] = userInfo;
        return cisObjData;
    },
    matchCode(userArray,cisDivDesc,fun) {
        var userGroupSql = "select l.usr_grp_id,l.descr from sc_user_group_l l where l.language_cd = 'ZHS' and l.descr like '"+cisDivDesc+"%'";
        DbUtils.queryCisData(userGroupSql, function (result) {
            cisUtils.matchUserGroup(userArray,result,'userGroupCode','USR_GRP_ID','userGroupPermissArr','userGroupCode',function () {
                var userRollSql = "select * from ci_role_l l where l.language_cd = 'ZHS' and l.descr like '"+cisDivDesc+"%'";
                DbUtils.queryCisData(userRollSql,function (result) {
                    cisUtils.matchUserGroup(userArray,result,'userRollCode','ROLE_ID','userRolls','userRollCode',function () {
                       var userDispdiSql = "select * from ci_disp_grp_l l where l.language_cd = 'ZHS' and l.descr like '"+cisDivDesc+"%'";
                        DbUtils.queryCisData(userDispdiSql,function (result) {
                            cisUtils.matchUserGroup(userArray,result,'userDispCode','DISP_GRP_CD','dispGroup','userDispCode',function () {
                                fun();
                            });
                        })
                    });
                });
            });
        }, function (err) {
            console.log(err);
        });

    },
    matchUserGroup(userArray,result,matchType,code,arrayType,matchArrayType,fun){
        for(var i = 0;i<userArray.length;i++){
            var user = userArray[i];
            user[matchType] = [];
            for(var j = 0;j<result.length;j++){
                var userGroupDesc = result[j].DESCR;
                var userGroupCode  = result[j][code];
                if(user[arrayType] && user[arrayType].length>0){
                    for(var z = 0;z<user[arrayType].length;z++){
                        if(cisUtils.removeBlank(userGroupDesc) == cisUtils.removeBlank(user[arrayType][z])){
                            user[matchArrayType].push(cisUtils.removeBlank(userGroupCode));
                            break;
                        }
                    }
                }
            }
        }
        fun();
    }
};
module.exports = cisUtils;