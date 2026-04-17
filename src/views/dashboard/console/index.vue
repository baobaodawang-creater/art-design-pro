<!-- 工作台页面 -->
<template>
  <div>
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-medium">数据概览</h2>
      <div class="flex items-center gap-4">
        <ElTooltip :content="isAutoRefresh ? '关闭自动刷新' : '开启自动刷新'" placement="top">
          <ElSwitch
            v-model="isAutoRefresh"
            :active-text="'自动刷新'"
            :inactive-text="'自动刷新'"
            @change="handleAutoRefreshChange"
          />
        </ElTooltip>
        <ElButton type="primary" :icon="Refresh" :loading="isRefreshing" @click="handleRefresh">
          {{ isRefreshing ? '刷新中...' : '刷新数据' }}
        </ElButton>
      </div>
    </div>

    <div :class="{ 'opacity-50 pointer-events-none': isRefreshing }">
      <div
        v-if="isRefreshing"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50"
      >
        <ElIcon class="text-4xl text-primary animate-spin">
          <Loading />
        </ElIcon>
      </div>

      <CardList :data="cardData" />

      <ElRow :gutter="20">
        <ElCol :sm="24" :md="12" :lg="10">
          <ActiveUser :key="refreshKey" />
        </ElCol>
        <ElCol :sm="24" :md="12" :lg="14">
          <SalesOverview :key="refreshKey" />
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :sm="24" :md="24" :lg="12">
          <NewUser :key="refreshKey" />
        </ElCol>
        <ElCol :sm="24" :md="12" :lg="6">
          <Dynamic :key="refreshKey" />
        </ElCol>
        <ElCol :sm="24" :md="12" :lg="6">
          <TodoList :key="refreshKey" />
        </ElCol>
      </ElRow>

      <AboutProject />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Refresh, Loading } from '@element-plus/icons-vue'
  import { useAutoRefresh } from '@/hooks'
  import { fetchGetDashboardData } from '@/api/dashboard'
  import CardList from './modules/card-list.vue'
  import ActiveUser from './modules/active-user.vue'
  import SalesOverview from './modules/sales-overview.vue'
  import NewUser from './modules/new-user.vue'
  import Dynamic from './modules/dynamic-stats.vue'
  import TodoList from './modules/todo-list.vue'
  import AboutProject from './modules/about-project.vue'

  defineOptions({ name: 'Console' })

  const refreshKey = ref(0)

  const cardData = ref<Api.Dashboard.CardDataItem[]>([])

  const generateMockCardData = (): Api.Dashboard.CardDataItem[] => {
    const baseValue = Math.floor(Math.random() * 1000) + 1000
    const changeValue = (Math.random() * 20 - 10).toFixed(1)
    const changePrefix = parseFloat(changeValue) >= 0 ? '+' : ''

    return [
      {
        des: '总访问量',
        num: baseValue + Math.floor(Math.random() * 500),
        change: `${changePrefix}${changeValue}%`,
        icon: 'ri:eye-line'
      },
      {
        des: '新增用户',
        num: baseValue + Math.floor(Math.random() * 300),
        change: `${changePrefix}${(parseFloat(changeValue) + 2).toFixed(1)}%`,
        icon: 'ri:user-add-line'
      },
      {
        des: '订单数量',
        num: baseValue + Math.floor(Math.random() * 200),
        change: `${changePrefix}${(parseFloat(changeValue) - 1).toFixed(1)}%`,
        icon: 'ri:shopping-cart-line'
      },
      {
        des: '销售额',
        num: baseValue + Math.floor(Math.random() * 1000),
        change: `${changePrefix}${(parseFloat(changeValue) + 3).toFixed(1)}%`,
        icon: 'ri:money-dollar-circle-line'
      }
    ]
  }

  const loadData = async () => {
    try {
      const data = await fetchGetDashboardData()
      if (data && data.cardData) {
        cardData.value = data.cardData
      }
    } catch {
      cardData.value = generateMockCardData()
    }
  }

  const { isAutoRefresh, isRefreshing, refresh } = useAutoRefresh({
    defaultInterval: 30000,
    defaultAutoRefresh: false,
    onRefresh: async () => {
      await loadData()
      refreshKey.value++
    },
    onRefreshComplete: () => {
      ElMessage.success({
        message: '数据已更新',
        type: 'success',
        duration: 3000,
        offset: 20
      })
    }
  })

  const handleRefresh = () => {
    refresh()
  }

  const handleAutoRefreshChange = (val: string | number | boolean) => {
    const enabled = Boolean(val)
    if (enabled) {
      ElMessage.info('已开启自动刷新，每 30 秒更新一次数据')
    } else {
      ElMessage.info('已关闭自动刷新')
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
