<template>
    <div @click.stop="open" :class="['picker-select-input', {'disabled': readonly}]">
        {{displayValue}}
        <div class="picker-select-space" v-if="!displayValue && !readonly">
            <span>请选择</span><!--
         --><img class="picker-anchor-icon" src="../../assets/arrow-go-right.svg" alt="">
        </div>
    </div>
</template>

<script type="text/babel">
    import Vue from 'vue';
    import SelectComponent from './select.vue';
    import { pageScroll } from './util.js';

    export default {
        name: 'w-select',
        data() {
            return {
                select: null,
                diffValue: this.value,
                tmpNum: 0,
                displayValue: ''
            }
        },
        props: {
            columns: {
              type: Array,
            },
            items: {
              type: Object,
            },
            readonly: {
              type: Boolean,
              default: false
            },
            value: {
              type: Object,
              default:  () => {}
            }
        },
        watch: {
            columns(val, oldVal) {

            },
            items(val, oldVal){

            }
        },
        methods: {
            open() {
                if (this.readonly) return;
                this.select.open();
            },
            close() {
                this.select.close();
            },
            removeElement() {
                if (this.select && this.select.$el) document.body.removeChild(this.select.$el);
            },
            setDisplayText() {
                // 处理选中后展示的文案
                let result = [];
                let valueR = {}
                this.columns.length && this.columns.forEach((key,i) => {
                    let arr = this.items[key];
                    arr && arr.forEach(item => {
                        if(item.value == this.diffValue[key]){
                            result.push(item.name);
                            valueR[key] = item.value;
                        }
                    })
                    if (!this.diffValue[key] && arr[0]) {
                        result.push(arr[0].name);
                        valueR[key] = arr[0].value;
                    }
                    this.$emit('input', valueR);
                })
                this.displayValue = result.join(' ')
            },
            render() {
                this.removeElement();
                // 把picker组件放入body中
                const Select = Vue.extend(SelectComponent);
                const props = this._props;
                props.parentEL = this.$el;

                this.select = new Select({
                    el: document.createElement('div'),
                    data: props
                });

                document.body.appendChild(this.select.$el);
                // confirm监听, emit input
                this.select.$on('confirm', (value) => {
                    if (this.tmpNum > 0 || this.initEmit) {
                        this.diffValue = value
                        this.setDisplayText();
                        // this.$emit('input', value);
                    }
                    this.tmpNum++;
                });
                // change监听  emit change
                this.select.$on('change', (value) => {
                    this.$emit('change', value);
                });
            },
            updateColumn(column, scrollValue) {
                // 更新列表， emit  change
                let allData = this.items[column];
                let scrollIndex = 0
                if(allData && allData.length > 0){
                    allData.forEach((item, i) => {
                        if (item.value === scrollValue) {
                            scrollIndex = i
                        }
                    })
                    this.$nextTick(() => {
                        this.select.scrolloToPosition(column, scrollIndex, allData, (value)=>{
                            this.$emit('change', {
                                column,
                                value
                            });
                            this.diffValue[column] = value
                            Object.values(this.value)[0] && this.setDisplayText()
                        })
                    })
                }
            }
        },
        mounted() {
            this.render(); 
            Object.values(this.value)[0] && this.setDisplayText();
        },
        beforeDestroy() {
            pageScroll.unlock();
            this.removeElement();
        }
    }
</script>

<style lang="less">
    @import './select.less';
</style>
