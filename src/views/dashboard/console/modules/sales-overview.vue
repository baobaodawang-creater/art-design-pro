<template>
  <div class="art-card h-105 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>访问量</h4>
        <p
          >今年增长<span class="text-success">{{ growthRate }}</span></p
        >
      </div>
    </div>
    <ArtLineChart
      height="calc(100% - 56px)"
      :data="chartData"
      :xAxisData="xAxisData"
      :showAreaColor="true"
      :showAxisLine="false"
    />
  </div>
</template>

<script setup lang="ts">
  interface Props {
    data?: Api.Dashboard.SalesOverviewData
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({
      data: [],
      xAxisData: [],
      growthRate: '+0%'
    })
  })

  const chartData = computed(() => props.data.data)
  const xAxisData = computed(() => props.data.xAxisData)
  const growthRate = computed(() => props.data.growthRate)
</script>
