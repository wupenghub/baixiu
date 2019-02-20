<template>
    <div class="detail_pop" ref="detail_pop" v-show="show" @click="hidePop($event)">
        <load :showLoading="showLoading"></load>
        <transition name="detail-pop"
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @before-leave="beforeLeave"
                    @leave="leave"
                    @after-leave="afterLeave"
        >
            <div v-show="show">
                <div class="container mui-clearfix">
                    <img class="product_logo" :src="detailData.result&&detailData.result.image_url">
                    <input type="hidden" ref="size" :value="detailData.result&&detailData.result.product_size_area"/>
                    <input type="hidden" ref="total_num" :value="detailData.result&&detailData.result.totalNum"/>
                    <input type="hidden" ref="product_id" :value="detailData.result&&detailData.result.id"/>
                    <input type="hidden" ref="product_item_code"
                           :value="detailData.result&&detailData.result.product_item_code"/>
                    <p class="price">￥{{detailData.result && detailData.result.product_preferential_price}}</p>
                    <div class="content">
                        <span>尺寸：</span>
                        <ul class="mui-clearfix" ref="size_ul">
                            <li class="size" v-for="item in sizeArray">{{item}}</li>
                        </ul>
                        <div class="count_div mui-clearfix">
                            <p class="count_div_left">数量：<span
                                    class="total_count">剩余{{totalNum}}件</span>
                            <p/>
                            <num_box ref="num_box" class="count_div_right" :defaultValue="1" :step="1"
                                     :minValue="0"></num_box>
                        </div>
                    </div>
                    <div class="footer mui-clearfix">
                        <a href="javascript:;" class="add_cart" @click="addCart()">加入购物车</a>
                        <a href="javascript:;" class="second_buy" @click="buyNow()">立即购买</a>
                    </div>
                </div>
            </div>

        </transition>
    </div>
</template>

<script>
    import numBox from '../subComponet/numbox.vue';
    import utils from '../../utils.js';
    import load from '../subComponet/loading.vue';
    import mui from '../../lib/mui/js/mui.min';
    export default {
        data: function () {
            return {
                show: false,
                screenHeight: 0,
                popHeight: 0,
                sizeArray: [],
                initialNumber: 0,
                currentCount: 1,
                totalNum: 0,
                productItemCode: 0,
                showLoading:false,
                checkLi:null
            }
        },
        created() {
        },
        methods: {
            addCart() {
                if(!this.checkTheContent()){
                    return;
                }
                this.$http.post(utils.serverName + '/leTao/addCart',  {userName: utils.userName}).then(function (response) {
                   var data = response.body;
                   if(data.status == 1){
                       this.$router.push({
                           path: '/login/'+this.$refs.product_id.value
                       })
                   }else if(data.status == 0){
                       console.log('用户已经登录');
                   }
                }, function (error) {
                    this.showLoading = false;
                });

            },
            buyNow() {
                this.show = true;
            },
            //对提交的内容进行验证
            checkTheContent(){
                if(!this.checkLi){
                    mui.toast('您还未选择尺码',{ duration:'long', type:'div' });
                    return false;
                }
                if(parseInt(this.$refs.num_box.getValue()) < 1){
                    mui.toast('您还未选择商品数量',{ duration:'long', type:'div' });
                    return false;
                }
                return true;
            },
            // el 表示要执行动画的那个DOM元素, 是原生的 js DOM 对象
            beforeEnter(el) {
                // 设置动画开始之前的初始位置
                this.screenHeight = this.$refs.detail_pop.offsetHeight;
                this.totalNum = this.$refs.total_num.value;
                this.popHeight = document.querySelector('.container').offsetHeight;
                var translateStartHeight = parseInt(this.screenHeight) + parseInt(this.popHeight);
                el.style.transform = "translate(0, " + translateStartHeight + "px)"
            },
            enter(el, done) {
                // 动画完成后的样式
                this.$refs.detail_pop.offsetHeight;
                el.style.transform = "translate(0, " + this.screenHeight + "px)";
                // 动画的持续时间
                el.style.transition = "all 0.5s ease";
                done();
            },
            afterEnter(el) {
                var sizeArr = this.$refs.size.value.split('-');
                this.totalNum = this.$refs.total_num.value;
                this.productItemCode = this.$refs.product_item_code.value;
                this.$refs.num_box.setMaxValue(this.totalNum);
                this.$refs.num_box.setDefaultVale(1);
                this.sizeArray = [];
                for (var i = sizeArr[0]; i <= sizeArr[1]; i++) {
                    this.sizeArray.push(parseInt(i));
                }
                //事件委托，给li标签绑定点击事件
                var sizeUl = this.$refs.size_ul;
                var _this = this;
                sizeUl.onclick = function (ev) {
                    var ev = ev || window.event;
                    var target = ev.target || ev.srcElement;
                    if (target.nodeName.toLowerCase() == 'li') {
                        //发送请求获取对应尺寸的数据信息
                        // _this.showLoading = true;
                        _this.checkLi = target;
                        _this.$http.get(utils.serverName + '/letao/getGoodDetail', {
                            params: {
                                productItemCode: _this.productItemCode,
                                size: target.innerHTML
                            }
                        }).then(function (response) {
                            // _this.showLoading = false;
                            var data = response.body;
                            this.totalNum = data.resultArray.length;
                            this.$refs.num_box.setMaxValue(this.totalNum);
                            this.$refs.num_box.setDefaultVale(this.totalNum > 0 ? 1 : 0);
                        }, function (error) {
                            // _this.showLoading = false
                        });
                    }

                    sizeUl.childNodes.forEach(function (value) {
                        if (target.nodeName.toLowerCase() == 'li') {
                            value.classList.remove('now');
                        }
                    });
                    if (target.nodeName.toLowerCase() == 'li') {
                        target.classList.add('now');
                    }
                };
            },
            beforeLeave(el) {
                el.style.transform = "translate(0, " + this.screenHeight + "px)";
            },
            leave(el, done) {
                var translateStartHeight = parseInt(this.screenHeight) + parseInt(this.popHeight);
                el.style.transform = "translate(0, " + translateStartHeight + "px)";
                el.style.transition = "all 0.5s ease";
                done();
            },
            afterLeave(el) {
                // 动画完成之后调用

            },
            hidePop(el) {
                if (el.target == this.$refs.detail_pop) {
                    this.show = false;
                    this.$emit("fun");
                }
            },
        },
        props: ['detailData', 'isShow'],
        mounted() {
        },
        watch: {
            isShow: {
                handler(newName, oldName) {
                    this.show = newName
                },
                immediate: true
            }
        },
        components: {
            'num_box': numBox,
            load
        }
    }
</script>

<style scoped lang="scss">
    .detail_pop {
        position: absolute;
        background: rgba(0, 0, 0, .7);
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        .container {
            min-height: 400px;
            width: 100%;
            position: absolute;
            background: #ffffff;
            padding: 10px;
            bottom: 0;
            .product_logo {
                position: absolute;
                top: -20px;
                left: 10px;
                display: block;
                width: 100px;
            }
            .price {
                color: red;
                position: absolute;
                left: 120px;
                top: 10px;
            }
            .content {
                margin-top: 45px;
                font-size: 14px;
                color: #999999;
                ul {
                    list-style: none;
                    margin-top: 10px;
                    li {
                        float: left;
                        width: 40px;
                        height: 30px;
                        border-radius: 3px;
                        border: 1px solid #c0c0c0;
                        text-align: center;
                        line-height: 30px;
                        margin: 0 0 10px 10px;
                    }
                }
                .count_div {
                    height: 45px;
                    .count_div_left {
                        float: left;
                        line-height: 45px;
                        .total_count {
                            color: red;
                            line-height: 45px;
                        }
                    }
                    .count_div_right {
                        float: right;
                        margin-top: -6px;
                    }
                }
                .size {
                    &.now {
                        background: #e4393c;
                        border-color: #e4393c;
                        color: white;
                    }
                }
            }
            .footer {
                position: absolute;
                bottom: 0;
                width: 100%;
                text-align: center;
                left: 0;
                .add_cart {
                    background: #ff9600;
                    width: 50%;
                    float: left;
                    display: block;
                    height: 50px;
                    line-height: 50px;
                    color: white;
                }
                .second_buy {
                    width: 50%;
                    background: #e4393c;
                    float: left;
                    display: block;
                    height: 50px;
                    line-height: 50px;
                    color: white;
                }
            }
        }
    }
</style>