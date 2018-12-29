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
     }
};
module.exports = utils;