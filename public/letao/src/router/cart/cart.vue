<template>
    <div class="cart mui-clearfix">
        <ul>
            <li class="product_item">
                <div class="product_item_left">
                    <img src="../../images/detail.jpg" class="product_img" alt="">
                    <input type="checkbox" class="product_check">
                </div>
                <div class="product_item_right">
                    <p>李宁闪击篮球鞋驭</p>
                    <span class="now_price">￥499.1</span>
                    <span class="old_price">￥999.99</span>
                    <span class="num">x3双</span>
                    <p class="product_note">鞋码：43</p>
                </div>
            </li>
            <li class="product_item">
                <div class="product_item_left">
                    <img src="../../images/detail.jpg" class="product_img" alt="">
                    <input type="checkbox" class="product_check">
                </div>
                <div class="product_item_right">
                    <p>李宁闪击篮球鞋驭帅10镭射队尚4男韦德之道空袭中高帮队尚3.5球鞋</p>
                    <span class="now_price">￥499.1</span>
                    <span class="old_price">￥999.99</span>
                    <span class="num">x3双</span>
                    <p class="product_note">鞋码：43</p>
                </div>
            </li>
            <li class="product_item">
                <div class="product_item_left">
                    <img src="../../images/detail.jpg" class="product_img" alt="">
                    <input type="checkbox" class="product_check">
                </div>
                <div class="product_item_right">
                    <p>李宁闪击篮球鞋驭帅10镭射队尚4男韦德之道空袭中高帮队尚3.5球鞋</p>
                    <span class="now_price">￥499.1</span>
                    <span class="old_price">￥999.99</span>
                    <span class="num">x3双</span>
                    <p class="product_note">鞋码：43</p>
                </div>
            </li>
            <li class="product_item">
                <div class="product_item_left">
                    <img src="../../images/detail.jpg" class="product_img" alt="">
                    <input type="checkbox" class="product_check">
                </div>
                <div class="product_item_right">
                    <p>李宁闪击篮球鞋驭帅10镭射队尚4男韦德之道空袭中高帮队尚3.5球鞋</p>
                    <span class="now_price">￥499.1</span>
                    <span class="old_price">￥999.99</span>
                    <span class="num">x3双</span>
                    <p class="product_note">鞋码：43</p>
                </div>
            </li>
            <li class="product_item">
                <div class="product_item_left">
                    <img src="../../images/detail.jpg" class="product_img" alt="">
                    <input type="checkbox" class="product_check">
                </div>
                <div class="product_item_right">
                    <p>李宁闪击篮球鞋驭帅10镭射队尚4男韦德之道空袭中高帮队尚3.5球鞋</p>
                    <span class="now_price">￥499.1</span>
                    <span class="old_price">￥999.99</span>
                    <span class="num">x3双</span>
                    <p class="product_note">鞋码：43</p>
                </div>
            </li>
            <li class="product_item">
                <div class="product_item_left">
                    <img src="../../images/detail.jpg" class="product_img" alt="">
                    <input type="checkbox" class="product_check" id="">
                </div>
                <div class="product_item_right">
                    <p>李宁闪击篮球鞋驭帅10镭射队尚4男韦德之道空袭中高帮队尚3.5球鞋</p>
                    <span class="now_price">￥499.1</span>
                    <span class="old_price">￥999.99</span>
                    <span class="num">x3双</span>
                    <p class="product_note">鞋码：43</p>
                </div>
            </li>
        </ul>
        <div class="order_info">
            <span class="order_amount">订单总额：￥0.00</span>
            <a href="javascript:;">生成订单</a>
        </div>
    </div>
</template>

<script>
    export default {
        data(){
            return {

            }
        },
        methods:{

        }
    }
</script>

<style scoped lang="scss">
    .cart{
        background: #ffffff;
        padding:0 0 50px 0;
        ul{
            list-style: none;
            color: #8f8f94;
            .product_item{
                border-bottom: 2px solid #eeeeee;
                display:flex;
                justify-content:center;
                align-items:center;
                .product_item_left{
                    width: 20%;
                    float: left;
                    .product_img{
                        margin: 0 auto;
                        display: block;
                        width: 60px;
                        height: 60px;
                    }
                    .product_check{
                        margin: 0 auto;
                        display: block;
                    }
                }
                .product_item_right{
                    float: left;
                    width: 80%;
                    padding-top: 10px;
                    p{
                        margin-bottom: 0px;
                    }
                    .now_price{
                        color: red;
                    }
                    .old_price{
                        font-size: 14px;
                        text-decoration: line-through;
                    }
                    .num{
                        font-size: 14px;
                        float: right;
                    }
                    .product_note{
                        margin:10px 0;
                    }
                }
            }
        }
        .order_info{
            border-top:2px solid #f3f3f3;
            background: #F9F9F9;
            position: fixed;
            left: 0;
            bottom: 50px;
            width: 100%;
            height: 40px;
            line-height: 40px;
            padding-left: 8px;
            .order_amount{
                color: #E55225;
                font-weight: bold;
                text-align: center;
            }
            a{
                float: right;
                display: inline-block;
                text-align: center;
                background: #E55225;
                color: white;
                padding: 0 20px;
                font-weight: bold;
            }
        }
    }
</style>