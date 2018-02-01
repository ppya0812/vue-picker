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

<style lang="less" scoped>
@import '../common.less';

</style>
