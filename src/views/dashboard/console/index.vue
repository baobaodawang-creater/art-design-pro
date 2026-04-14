<!-- 工作台页面 -->
<template>
  <div>
    <div class="flex-cb mb-5">
      <div class="flex-c">
        <ElButton type="primary" :icon="Refresh" :loading="loading" @click="handleRefresh">
          刷新数据
        </ElButton>
        <div class="ml-4 flex-c">
          <ElSwitch v-model="autoRefresh" @change="handleAutoRefreshChange" />
          <span class="ml-2 text-sm text-g-600">自动刷新 (30秒)</span>
        </div>
      </div>
      <div v-if="lastUpdateTime" class="text-sm text-g-500"> 上次更新: {{ lastUpdateTime }} </div>
    </div>

    <div
      v-loading="loading"
      element-loading-text="数据加载中..."
      element-loading-spinner="el-icon-loading"
    >
      <CardList :data="dashboardData.cardList" />

      <ElRow :gutter="20">
        <ElCol :sm="24" :md="12" :lg="10">
          <ActiveUser :data="dashboardData.activeUser" />
        </ElCol>
        <ElCol :sm="24" :md="12" :lg="14">
          <SalesOverview :data="dashboardData.salesOverview" />
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :sm="24" :md="24" :lg="12">
          <NewUser :data="dashboardData.newUser" />
        </ElCol>
        <ElCol :sm="24" :md="12" :lg="6">
          <Dynamic :data="dashboardData.dynamic" />
        </ElCol>
        <ElCol :sm="24" :md="12" :lg="6">
          <TodoList :data="dashboardData.todo" />
        </ElCol>
      </ElRow>

      <AboutProject />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Refresh } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import CardList from './modules/card-list.vue'
  import ActiveUser from './modules/active-user.vue'
  import SalesOverview from './modules/sales-overview.vue'
  import NewUser from './modules/new-user.vue'
  import Dynamic from './modules/dynamic-stats.vue'
  import TodoList from './modules/todo-list.vue'
  import AboutProject from './modules/about-project.vue'
  import { fetchGetDashboardData } from '@/api/dashboard'

  defineOptions({ name: 'Console' })

  const AUTO_REFRESH_INTERVAL = 30000

  const loading = ref(false)
  const autoRefresh = ref(false)
  const lastUpdateTime = ref('')
  let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

  const defaultDashboardData: Api.Dashboard.DashboardData = {
    cardList: [],
    salesOverview: {
      data: [],
      xAxisData: [],
      growthRate: '+0%'
    },
    activeUser: {
      chartData: [],
      xAxisLabels: [],
      list: [],
      growthRate: '+0%'
    },
    newUser: {
      tableData: [],
      growthRate: '+0%'
    },
    dynamic: {
      list: [],
      newCount: 0
    },
    todo: {
      list: [],
      pendingCount: 0
    }
  }

  const dashboardData = ref<Api.Dashboard.DashboardData>({ ...defaultDashboardData })

  const generateMockData = (): Api.Dashboard.DashboardData => {
    const randomNum = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min
    const randomChange = () => {
      const isPositive = Math.random() > 0.5
      const value = randomNum(5, 30)
      return isPositive ? `+${value}%` : `-${value}%`
    }

    return {
      cardList: [
        {
          des: '总访问次数',
          icon: 'ri:pie-chart-line',
          startVal: 0,
          duration: 1000,
          num: randomNum(8000, 10000),
          change: randomChange()
        },
        {
          des: '在线访客数',
          icon: 'ri:group-line',
          startVal: 0,
          duration: 1000,
          num: randomNum(150, 250),
          change: randomChange()
        },
        {
          des: '点击量',
          icon: 'ri:fire-line',
          startVal: 0,
          duration: 1000,
          num: randomNum(9000, 11000),
          change: randomChange()
        },
        {
          des: '新用户',
          icon: 'ri:progress-2-line',
          startVal: 0,
          duration: 1000,
          num: randomNum(100, 200),
          change: randomChange()
        }
      ],
      salesOverview: {
        data: Array.from({ length: 12 }, () => randomNum(20, 80)),
        xAxisData: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月'
        ],
        growthRate: `+${randomNum(10, 25)}%`
      },
      activeUser: {
        chartData: Array.from({ length: 9 }, () => randomNum(80, 200)),
        xAxisLabels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'],
        list: [
          { name: '总用户量', num: `${randomNum(30, 35)}k` },
          { name: '总访问量', num: `${randomNum(120, 140)}k` },
          { name: '日访问量', num: `${randomNum(10, 15) / 10}k` },
          { name: '周同比', num: `+${randomNum(3, 10)}%` }
        ],
        growthRate: `+${randomNum(15, 30)}%`
      },
      newUser: {
        tableData: [
          {
            username: '中小鱼',
            province: '北京',
            sex: 0,
            age: 22,
            percentage: randomNum(50, 90),
            pro: 0,
            color: 'var(--art-primary)',
            avatar: ''
          },
          {
            username: '何小荷',
            province: '深圳',
            sex: 1,
            age: 21,
            percentage: randomNum(50, 90),
            pro: 0,
            color: 'var(--art-secondary)',
            avatar: ''
          },
          {
            username: '誶誶淰',
            province: '上海',
            sex: 1,
            age: 23,
            percentage: randomNum(50, 90),
            pro: 0,
            color: 'var(--art-warning)',
            avatar: ''
          },
          {
            username: '发呆草',
            province: '长沙',
            sex: 0,
            age: 28,
            percentage: randomNum(50, 90),
            pro: 0,
            color: 'var(--art-info)',
            avatar: ''
          },
          {
            username: '甜筒',
            province: '浙江',
            sex: 1,
            age: 26,
            percentage: randomNum(50, 90),
            pro: 0,
            color: 'var(--art-error)',
            avatar: ''
          },
          {
            username: '冷月呆呆',
            province: '湖北',
            sex: 1,
            age: 25,
            percentage: randomNum(50, 90),
            pro: 0,
            color: 'var(--art-success)',
            avatar: ''
          }
        ],
        growthRate: `+${randomNum(15, 25)}%`
      },
      dynamic: {
        list: [
          { username: '中小鱼', type: '关注了', target: '誶誶淰' },
          { username: '何小荷', type: '发表文章', target: 'Vue3 + Typescript + Vite 项目实战笔记' },
          { username: '中小鱼', type: '关注了', target: '誶誶淰' },
          { username: '何小荷', type: '发表文章', target: 'Vue3 + Typescript + Vite 项目实战笔记' },
          { username: '誶誶淰', type: '提出问题', target: '主题可以配置吗' },
          { username: '发呆草', type: '兑换了物品', target: '《奇特的一生》' },
          { username: '甜筒', type: '关闭了问题', target: '发呆草' },
          { username: '冷月呆呆', type: '兑换了物品', target: '《高效人士的七个习惯》' }
        ],
        newCount: randomNum(3, 10)
      },
      todo: {
        list: [
          { username: '查看今天工作内容', date: '上午 09:30', complate: true },
          { username: '回复邮件', date: '上午 10:30', complate: true },
          { username: '工作汇报整理', date: '上午 11:00', complate: true },
          { username: '产品需求会议', date: '下午 02:00', complate: false },
          { username: '整理会议内容', date: '下午 03:30', complate: false },
          { username: '明天工作计划', date: '下午 06:30', complate: false }
        ],
        pendingCount: randomNum(1, 5)
      }
    }
  }

  const fetchData = async (showToast = false) => {
    loading.value = true
    try {
      const data = await fetchGetDashboardData()
      dashboardData.value = data
    } catch (error) {
      console.warn('API请求失败，使用模拟数据:', error)
      dashboardData.value = generateMockData()
    } finally {
      loading.value = false
      lastUpdateTime.value = new Date().toLocaleString('zh-CN')
      if (showToast) {
        ElMessage({
          message: '数据已更新',
          type: 'success',
          duration: 2000
        })
      }
    }
  }

  const handleRefresh = () => {
    fetchData(true)
  }

  const startAutoRefresh = () => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
    }
    autoRefreshTimer = setInterval(() => {
      fetchData(true)
    }, AUTO_REFRESH_INTERVAL)
  }

  const stopAutoRefresh = () => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
  }

  const handleAutoRefreshChange = (val: string | number | boolean) => {
    const isEnabled = Boolean(val)
    if (isEnabled) {
      startAutoRefresh()
      ElMessage({
        message: '已开启自动刷新，每30秒更新一次',
        type: 'info',
        duration: 2000
      })
    } else {
      stopAutoRefresh()
      ElMessage({
        message: '已关闭自动刷新',
        type: 'info',
        duration: 2000
      })
    }
  }

  onMounted(() => {
    fetchData()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })
</script>
