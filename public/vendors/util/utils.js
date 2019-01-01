var utils = {
     addList(result,obj) {
        //判断当前节点是否有父节点
        if(obj['parent_id']){
            //如果有父节点，先找到父节点
            for(var i = 0;i<result.length;i++){
                if(obj['parent_id'] == result[i]['id']){
                    //定位到父节点，先判断父节点中有没有sonList数组
                    if(result[i]['sonList']){
                        //如果有sonList，先判断sonList中有没有该子节点
                        var index = 0;//定义一个索引记录子节点在父节点sonList中的索引
                        var isContain = false;//定义一个变量记录父节点是否已经包含该子节点，默认不包含
                        for(var j = 0;j<result[i]['sonList'].length;j++){
                            if(result[i]['sonList'][j].id == obj.id){
                                index == j;
                                isContain = true;
                                // 如果包含了该元素，再次判断,该元素是否发生过改变
                                if(result[i]['sonList'][j].length != obj.length){
                                    //发生过改变，重新替换父节点中对应的子节点
                                    result[i]['sonList'][j] = obj;
                                    //并且让父节点进一步通知其对应的父节点
                                    this.addList(result,result[i]);
                                }
                                break;
                            }
                        }
                        //如果父节点的sonList中不包含该子节点，则直接添加
                        if(!isContain){
                            result[i]['sonList'].push(obj);
                        }
                    }else{
                        //如果没有sonList，先在父节点添加此数组
                        result[i]['sonList'] = [];
                        //父节点添加当前节点作为子节点
                        result[i]['sonList'].push(obj);
                        this.addList(result,result[i]);
                    }
                    break;
                }
            }
        }
    },
     isLogin(req,res){
         var user = req.session.user;
         if(!user){
             res.render('login.html',{});
             return
         }
         return user;
     },
    addMnues(parentNode,dataObj) {
        if(dataObj.sonList && dataObj.sonList.length > 0){//包含子节点
            //如果该父节点中包含其他子节点，先添加父节点
            var dirObj = $('<li>' +
                '<a href="#'+dataObj.id+'" class="collapsed" data-toggle="collapse">' +
                '<i class="fa fa-thumb-tack"></i>'+dataObj.mnue_desc+'<i class="fa fa-angle-right"></i>' +
                '</a>' +
                '</li>');
            var filesUL = $('<ul id='+dataObj.id+' class="collapse"></ul>');
            //添加父节点到根目录中
            dirObj.append(filesUL);
            for(var i = 0;i<dataObj.sonList.length;i++){
                //递归将当前目录传进，进一步添加目录
                this.addMnues(filesUL,dataObj.sonList[i]);
            }
            //添加该节点到根目录
            parentNode.append(dirObj);
        }else{//不包含子节点
            var html = '<li class="active">' +
                '<a href="'+dataObj['url']+'"><i class="fa fa-dashboard"></i>'+dataObj['mnue_desc']+'</a>' +
                '</li>';
            parentNode.append(html);
        }
    },
    addTableMnues(parentNode,dataObj,spanNoContent,index) {
        if (dataObj.sonList && dataObj.sonList.length > 0) {//包含子节点
            //如果该父节点中包含其他子节点，先添加父节点
            var dirObj = $('<tr id="mnuesManger' + dataObj.id + '" data-open="on" class="mnuesManger' + dataObj.parent_id + '">' +
                '<td class="first_td">' +
                '<span class="glyphicon glyphicon-menu-down" onclick="toggle(this,'+JSON.stringify(dataObj).replace(/\"/g,"'")+')"></span>' +
                '<a href="#">' + dataObj.mnue_desc + '</a>' +
                '</td>' +
                '<td>' + dataObj.url + '</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
                '<td>' +
                '<a href="javascript:;" class="mnue-modify" onclick="mnueModify('+dataObj.id+')">修改</a>'+
                '<a href="javascript:;" class="mnue-delete" onclick="mnueDelete('+dataObj.id+')">删除</a>'+
                '<a href="javascript:;" class="mnue-add" onclick="sonMnueAdd('+dataObj.id+')">添加下级菜单</a>'+
                '</td>' +
                '</tr>');
            parentNode.append(dirObj);
            for (var i = 0; i < index; i++) {
                $('#mnuesManger' + dataObj.id + ' .first_td').prepend($('<span class="no-content"></span>'));
            }
            for (var i = 0; i < dataObj.sonList.length; i++) {
                //递归将当前目录传进，进一步添加目录
                this.addTableMnues(parentNode, dataObj.sonList[i], $('<span class="no-content"></span>'), index + 1);
            }
        } else {//不包含子节点
            var html = '<tr id="mnuesManger' + dataObj.id + '" data-open="on" class="mnuesManger' + dataObj.parent_id + '">' +
                '<td class="first_td">' +
                '<span class="no-content"></span>' +
                '<a href="#">' + dataObj.mnue_desc + '</a>' +
                '</td>' +
                '<td>' + dataObj.url + '</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
                '<td>' +
                '<a href="javascript:;" class="mnue-modify" onclick="mnueModify('+dataObj.id+')">修改</a>'+
                '<a href="javascript:;" class="mnue-delete" onclick="mnueDelete('+dataObj.id+')">删除</a>'+
                '<a href="javascript:;" class="mnue-add" onclick="sonMnueAdd('+dataObj.id+')">添加下级菜单</a>'+
                '</td>' +
                '</tr>';
            parentNode.append(html);
            for (var i = 0; i < index; i++) {
                $('#mnuesManger' + dataObj.id + ' .first_td').prepend($('<span class="no-content"></span>'));
            }
        }
    }
};
