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
    v-model="intData"
    @change="selectChange"></picker>
</template>

<script>
  import picker from './index.vue'

  export default {
    name: 'placePicker',
    components: {
      picker
    },
    data () {
      return {
        pickerData: {
          country:[],
          province: [],
          city: []
        },
        intData: {
          country: '',
          province: '',
          city: ''
        }
      }
    },
    computed: {
      columnsData () {
        return this.$root.columnsData
      },
      placeData () {
        return this.$root.placeData
      },
      countryList () {
        return this.$root.countryList
      }
    },
    methods: {
      selectChange(v) {
        const name = this.placeData[v.value]
        if (v.column == 'country' && name !== '中国')  {
          this.$root.columnsData = ['country']
          delete(this.pickerData.province)
          delete(this.pickerData.city)
          return
        }
        if(name && v.column == 'country') {
          this.$root.getPlace(1, name).then(data => {
            this.pickerData.province = data || []
            this.$refs.picker.updateColumn('province')
          })
        } else if(name && v.column == 'province') {
          this.$root.getPlace(2, name).then(data => {
            this.pickerData.city = data || []
            this.$refs.picker.updateColumn('city')
          })
        }
      }
    },
    mounted () {
      // 异步获取数据
      this.$root.$on('place.update', (data) => {
        this.pickerData.country = data
        this.intData.country = data[0].value
        this.intData.province = 10002
        this.intData.city = 0
        this.$nextTick(() => {
          this.$refs.picker.select.setValue({
            country: data[0].value,
            province: 10006,
            city: 20
          })
          // this.$refs.picker.updateColumn('country')
        })
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
| v-model       | 初始值      | String     |              |          | 

###  Select 事件介绍  event

|  名称          | 说明        | 参数       | 
|---------------|-------------|-----------|
| change        | 选择项改变    | {column: '', value: ''}     |


###  Select 方法介绍  api

|  名称          | 说明        | 参数       | 
|---------------|-------------|-----------|
| updateColumn    | 更新列    | String   列名  |
