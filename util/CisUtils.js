/**=================================用户组权限开始================================*/
var pinyin = require('pinyin');
var DbUtils = require('../DbUtils');
var cisUtils = {
    addUserGroupPermissions(userArray, userGroupPermissionsArray, cisDivDesc) {
        for (var i = 0; i < userGroupPermissionsArray.length; i++) {
            var userGroupObj = userGroupPermissionsArray[i];
            var addName = userGroupObj['姓名'];
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
        return value.replace(/\s/g, "");
    },
    test(userArray) {
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            var userRolls = user.userRolls || [];
            var userGroup = user.userGroupCode || [];
            var userDisp = user.dispGroup || [];
            // console.log(user.userName + ':用户权限' + userGroup.length);
        }
    },
    generateCisId(userArray, cisDivCode) {
        var firstIndex = 1000001;
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            user.userId = cisDivCode + (firstIndex++).toString();
            user.userCode = cisUtils.wordChangePinyin(user.userName);
        }
    },
    wordChangePinyin(userName) {
        var userCode = '';
        for (var i = 0; i < userName.length; i++) {
            if (userName.length > 2) {
                if (i == 0) {
                    userCode += pinyin(userName[i], {style: pinyin.STYLE_NORMAL});
                } else {
                    userCode += pinyin(userName[i], {style: pinyin.STYLE_NORMAL}).toString().substring(0, 1);
                }
            }else{
                userCode += pinyin(userName[i], {style: pinyin.STYLE_NORMAL});
            }
        }
        return userCode.toLocaleUpperCase();
    },
    exportCisConfig(userArray){
        var userGroupHead = ['USR_GRP_ID','USER_ID','VERSION','EXPIRATION_DT','OWNER_FLG'];
        var userDispHead = ['USER_ID','DISP_GRP_CD','VERSION'];
        var userRollHead = ['USER_ID','ROLE_ID','VERSION'];
        var userGroupData = [];
        var userDispData = [];
        var userRollData = [];
        userGroupData.push(userGroupHead);
        userDispData.push(userDispHead);
        userRollData.push(userRollHead);
        for(var i = 0;i<userArray.length;i++){
            var user = userArray[i];
            var userGroup = user.userGroupCode;
            var userDisp = user.dispGroup;
            var userRoll = user.userRolls;
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
                    obj.push(user.userId);
                    obj.push(userDisp[j]);
                    obj.push('1');
                    obj.push(user.userName);
                    userDispData.push(obj);
                }
            }
            if(userRoll){
                for(var j = 0;j<userRoll.length;j++){
                    var obj = [];
                    obj.push(user.userId);
                    obj.push(userRoll[j]);
                    obj.push('1');
                    obj.push(user.userName);
                    userRollData.push(obj);
                }
            }

        }
        var cisObjData = {};
        cisObjData.userGroup = userGroupData;
        cisObjData.userDisp = userDispData;
        cisObjData.userRoll = userRollData;
        return cisObjData;
    },
    matchCode(userArray,cisDivDesc,fun) {
        var userGroupSql = "select l.usr_grp_id,l.descr from sc_user_group_l l where l.language_cd = 'ZHS' and l.descr like '"+cisDivDesc+"%'";
        console.log(userGroupSql);
        DbUtils.queryCisData(userGroupSql, function (result) {
            for(var i = 0;i<userArray.length;i++){
                var user = userArray[i];
                user.userGroupCode = [];
                for(var j = 0;j<result.length;j++){
                    var userGroupDesc = result[j].DESCR;
                    var userGroupCode  = result[j].USR_GRP_ID;
                    if(user.userGroupPermissArr && user.userGroupPermissArr.length>0){
                        for(var z = 0;z<user.userGroupPermissArr.length;z++){
                            if(cisUtils.removeBlank(userGroupDesc) == cisUtils.removeBlank(user.userGroupPermissArr[z])){
                                user.userGroupCode.push(cisUtils.removeBlank(userGroupCode));
                                break;
                            }
                        }
                    }

                }
            }
            fun();
        }, function (err) {
            console.log(err);
        });

    }
}
module.exports = cisUtils;