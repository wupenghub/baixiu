<template>
    <div class="numbox mui-clearfix">
        <button class="numbox-btn-minus" ref="numbox_btn_minus" @click="minus()">-</button>
        <input type="text" v-model="number" class="num_value"/>
        <button class="numbox-btn-plus" ref="numboxBtnPlus" @click="add()">+</button>
        <input type="hidden" ref="defaultValue" :value="defaultValue"/>
        <input type="hidden" ref="step" :value="step"/>
        <input type="hidden" ref="maxValue" :value="maxValue"/>
        <input type="hidden" ref="minValue" :value="minValue"/>
    </div>
</template>

<script>
    import mui from '../../lib/mui/js/mui.min';

    export default {
        data: function () {
            return {
                number: 1,
                numBoxDefaultValue:0,
                numBoxstep:0,
                numBoxMaxValue:0,
                numBoxMinValue:0
            }
        },
        created() {
            this.$root.$on('getValue');
        },
        methods: {
            minus(){
                this.number -= parseInt(this.numBoxstep);
            },
            add(){
                this.number = parseInt(this.number)+ parseInt(this.numBoxstep);
            },
            getValue(){
                return this.number;
            },
            setMaxValue(maxValue){
                this.numBoxMaxValue = maxValue;
            }
        },
        props: ['defaultValue', 'step','maxValue','minValue'],
        mounted() {
            this.numBoxDefaultValue = this.$refs.defaultValue.value;
            this.numBoxstep = this.$refs.step.value;
            this.numBoxMaxValue = this.$refs.maxValue.value;
            this.numBoxMinValue = this.$refs.minValue.value;
        },
        watch: {
            number: {
                handler(newValue) {
                    newValue = parseInt(newValue)?parseInt(newValue):0;
                    if(newValue <= this.numBoxMinValue){
                        this.number = this.numBoxMinValue;
                        return;
                    }
                    if(newValue >= this.numBoxMaxValue){
                        this.number = this.numBoxMaxValue;
                        return;
                    }
                },
                immediate: true
            }
        },
    }
</script>

<style scoped lang="scss">
    .numbox {
        height: 33px;

        .numbox-btn-minus {
            float: left;
            height: 33px;
            width: 40px;
            margin: 0;
            padding: 0;
            text-align: center;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: none;
        }
        .num_value{
            float: left;
            height: 33px;
            width: 38px;
            margin: 0;
            padding: 0;
            text-align: center;
            border-radius: 0;
        }
        .numbox-btn-plus{
            float: left;
            height: 33px;
            width: 40px;
            margin: 0;
            padding: 0;
            text-align: center;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-left: none;
        }
    }
</style>