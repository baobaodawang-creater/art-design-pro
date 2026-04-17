/**
 * useAutoRefresh - 自动刷新功能
 *
 * 提供页面数据的自动刷新和手动刷新能力，适用于需要实时数据更新的场景。
 * 支持自定义刷新间隔、自动刷新开关、刷新回调等功能。
 *
 * ## 核心功能
 *
 * 1. 自动刷新 - 按指定间隔自动执行刷新回调
 * 2. 手动刷新 - 提供立即刷新方法
 * 3. 开关控制 - 可随时开启/关闭自动刷新
 * 4. Loading 状态 - 刷新过程中显示加载状态
 * 5. 生命周期管理 - 组件卸载时自动清理定时器
 *
 * ## 使用示例
 *
 * ```typescript
 * const {
 *   isAutoRefresh,
 *   isRefreshing,
 *   refreshInterval,
 *   toggleAutoRefresh,
 *   refresh,
 *   setRefreshInterval
 * } = useAutoRefresh({
 *   defaultInterval: 30000,
 *   onRefresh: async () => {
 *     await fetchData()
 *   }
 * })
 * ```
 *
 * @module useAutoRefresh
 * @author Art Design Pro Team
 */

import { ref, watch, onUnmounted } from 'vue'

interface UseAutoRefreshOptions {
  /** 默认刷新间隔（毫秒），默认 30000ms（30秒） */
  defaultInterval?: number
  /** 刷新回调函数 */
  onRefresh?: () => void | Promise<void>
  /** 刷新完成回调函数 */
  onRefreshComplete?: () => void
  /** 是否默认开启自动刷新，默认 false */
  defaultAutoRefresh?: boolean
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const {
    defaultInterval = 30000,
    onRefresh,
    onRefreshComplete,
    defaultAutoRefresh = false
  } = options

  /** 自动刷新开关状态 */
  const isAutoRefresh = ref(defaultAutoRefresh)

  /** 刷新间隔（毫秒） */
  const refreshInterval = ref(defaultInterval)

  /** 是否正在刷新 */
  const isRefreshing = ref(false)

  /** 定时器 ID */
  let timerId: number | null = null

  /** 执行刷新 */
  const refresh = async () => {
    if (isRefreshing.value) return

    isRefreshing.value = true

    try {
      if (onRefresh) {
        await onRefresh()
      }
    } finally {
      isRefreshing.value = false
      if (onRefreshComplete) {
        onRefreshComplete()
      }
    }
  }

  /** 启动自动刷新定时器 */
  const startAutoRefresh = () => {
    stopAutoRefresh()

    timerId = window.setInterval(() => {
      refresh()
    }, refreshInterval.value)
  }

  /** 停止自动刷新定时器 */
  const stopAutoRefresh = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  /** 切换自动刷新状态 */
  const toggleAutoRefresh = (enabled?: boolean) => {
    if (typeof enabled === 'boolean') {
      isAutoRefresh.value = enabled
    } else {
      isAutoRefresh.value = !isAutoRefresh.value
    }
  }

  /** 设置刷新间隔 */
  const setRefreshInterval = (interval: number) => {
    if (interval <= 0) {
      console.warn('刷新间隔必须大于 0')
      return
    }
    refreshInterval.value = interval

    if (isAutoRefresh.value) {
      startAutoRefresh()
    }
  }

  /** 监听自动刷新开关变化 */
  watch(
    isAutoRefresh,
    (enabled) => {
      if (enabled) {
        startAutoRefresh()
      } else {
        stopAutoRefresh()
      }
    },
    { immediate: true }
  )

  /** 组件卸载时清理定时器 */
  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    /** 自动刷新开关状态 */
    isAutoRefresh,
    /** 刷新间隔（毫秒） */
    refreshInterval,
    /** 是否正在刷新 */
    isRefreshing,
    /** 执行刷新 */
    refresh,
    /** 切换自动刷新状态 */
    toggleAutoRefresh,
    /** 启动自动刷新 */
    startAutoRefresh,
    /** 停止自动刷新 */
    stopAutoRefresh,
    /** 设置刷新间隔 */
    setRefreshInterval
  }
}
