#移动端picker组件。
 + 支持多联级选择，例如s国省市区、分类选择。

##demo

```html
<template>
  <picker
    ref="picker"
    v-if="countryList.length"
    :columns="columnsData"
    :items="pickerData"
    :readonly="disabled"
    v-model="intData"
    @input="inputChange"
    @change="selectChange"></picker>
</template>

<script>
  import picker from '../components/ColumnPicker/index.vue'

  export default {
    name: 'placePicker',
    components: {
      picker
    },
    data () {
      // intData的country === 存在于pickerData的country数组的value
      return {
        pickerData: {
          country:[],
          province: [],
          city: []
        },
        intData: {
          country: '', // country_中国
          province: '',
          city: ''
        }
      }
    },
    props: {
      disabled: Boolean
    },
    watch: {
      intData (v) {
        console.log('intdata', v)
        this.$root.placeSelected = v
      }
    },
    computed: {
      columnsData () {
        return this.$root.columnsData
      },
      countryList () {
        return this.$root.countryList
      },
      placeSelected () {
        return this.$root.placeSelected
      },
      sku () {
        return this.$root.sku
      }
    },
    methods: {
      inputChange (v) {
        this.intData = Object.assign(this.intData, v)
      },
      selectChange(v) {
        const name = v.value && v.value.split('_')[1]
        if(v.column == 'country') {
          this.$root.getPlace(1, name).then(data => {
            this.pickerData.province = data || []
            this.$refs.picker.updateColumn('province', `province_${this.placeSelected.province}`)
            if (!data.length) {
              this.pickerData.city = []
            }
          })
        } else if(v.column == 'province') {
          this.$root.getPlace(2, name).then(data => {
            this.pickerData.city = data || []
            this.$refs.picker.updateColumn('city', `city_${this.placeSelected.city}`)
          })
        }
      }
    },
    mounted () {
      this.$root.$on('place.update', (data) => {
        this.pickerData.country = data
        this.intData.country = this.sku.production_addr1 ? `country_${this.sku.production_addr1}` : ''

        if (this.sku.production_addr1) {
          this.$nextTick(() => {
            this.$refs.picker.select.setValue({
              country: this.intData.country,
              province: `province_${this.sku.production_addr2}`,
              city: `city_${this.sku.production_addr3}`
            })
          })
        }
      })
    }
  }

</script>

```


###  Select 属性介绍 props

| 参数           | 说明        | 类型       | 可选值        | 默认值     |
|---------------|-------------|-----------|--------------|-----------|
| columns       | 列          | Array     |              |       |
| items         | 数据        | Object     |             |          |
| v-model       | 初始值      | Object     |              |          | 

###  Select 事件介绍  event

|  名称          | 说明        | 参数       | 
|---------------|-------------|-----------|
| change        | 选择项改变    | {column: '', value: ''}     |
| input        | 选择填入的内容改变    | {colomnKey: '', value: ''}     |


###  Select 方法介绍  api

|  名称          | 说明        | 参数       | 
|---------------|-------------|-----------|
| updateColumn    | 更新列    | String   列名  |
| setValue    | 设置选中内容    | Object   {key1: value1, key2: value2}  |
