<template>
  <div class="art-card h-105 p-4 box-border mb-5 max-sm:mb-4">
    <ArtBarChart
      class="box-border p-2"
      barWidth="50%"
      height="13.7rem"
      :showAxisLine="false"
      :data="chartData"
      :xAxisData="xAxisLabels"
    />
    <div class="ml-1">
      <h3 class="mt-5 text-lg font-medium">用户概述</h3>
      <p class="mt-1 text-sm"
        >比上周 <span class="text-success font-medium">{{ growthRate }}</span></p
      >
      <p class="mt-1 text-sm">我们为您创建了多个选项，可将它们组合在一起并定制为像素完美的页面</p>
    </div>
    <div class="flex-b mt-2">
      <div class="flex-1" v-for="(item, index) in statList" :key="index">
        <p class="text-2xl text-g-900">{{ item.num }}</p>
        <p class="text-xs text-g-500">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    data?: Api.Dashboard.ActiveUserData
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({
      chartData: [],
      xAxisLabels: [],
      list: [],
      growthRate: '+0%'
    })
  })

  const chartData = computed(() => props.data.chartData)
  const xAxisLabels = computed(() => props.data.xAxisLabels)
  const statList = computed(() => props.data.list)
  const growthRate = computed(() => props.data.growthRate)
</script>
