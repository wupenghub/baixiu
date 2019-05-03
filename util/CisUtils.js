/**=================================用户组权限开始================================*/
var pinyin = require('pinyin');
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
                    // var userPart = isDispGroup ? user.dispGroup : user.userRolls;
                    // if (user && userPart && userPart.length > 0) {
                    //     addUserObj(user, item, cisDivDesc, isDispGroup);
                    // }
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
            var userGroup = user.userGroupPermissArr || [];
            var userDisp = user.dispGroup || [];
            console.log(user.userName + ':用户权限' + userGroup.length + "个，调度组：" + userDisp.length + "个，待办事项角色：" + userRolls.length + "个");
        }
    },
    generateCisId(userArray, cisDivCode) {
        var firstIndex = 1000001;
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            user.userId = cisDivCode + (firstIndex++);
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
    }

};
module.exports = cisUtils;