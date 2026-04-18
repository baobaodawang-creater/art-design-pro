/**
 * useHeaderBar - 顶部栏功能管理
 *
 * 统一管理顶部栏各个功能模块的显示状态和配置信息。
 * 提供灵活的功能开关控制，支持动态显示/隐藏顶部栏的各个功能按钮。
 *
 * ## 主要功能
 *
 * 1. 功能开关控制 - 统一管理菜单按钮、刷新按钮、快速入口等功能的显示状态
 * 2. 配置信息获取 - 获取各个功能模块的详细配置信息
 * 3. 功能列表查询 - 快速获取所有启用或禁用的功能列表
 * 4. 响应式状态 - 所有状态自动响应配置和 store 变化
 *
 * @module useHeaderBar
 * @author Art Design Pro Team
 */

import { computed, ComputedRef, Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/store/modules/setting'
import { headerBarConfig } from '@/config/modules/headerBar'
import { HeaderBarFeatureConfig, FeatureConfigItem } from '@/types'

const FAST_ENTER_DEFAULT_MIN_WIDTH = 1200

interface FastEnterFeatureConfig extends FeatureConfigItem {
  minWidth?: number
}

type FeatureKey = keyof HeaderBarFeatureConfig

interface ShowFeatureDefinition {
  name: string
  feature: FeatureKey
  storeRefKey?: string
}

const showFeatureDefinitions: ShowFeatureDefinition[] = [
  { name: 'shouldShowMenuButton', feature: 'menuButton', storeRefKey: 'showMenuButton' },
  { name: 'shouldShowRefreshButton', feature: 'refreshButton', storeRefKey: 'showRefreshButton' },
  { name: 'shouldShowFastEnter', feature: 'fastEnter', storeRefKey: 'showFastEnter' },
  { name: 'shouldShowBreadcrumb', feature: 'breadcrumb', storeRefKey: 'showCrumbs' },
  { name: 'shouldShowGlobalSearch', feature: 'globalSearch' },
  { name: 'shouldShowFullscreen', feature: 'fullscreen' },
  { name: 'shouldShowNotification', feature: 'notification' },
  { name: 'shouldShowChat', feature: 'chat' },
  { name: 'shouldShowLanguage', feature: 'language', storeRefKey: 'showLanguage' },
  { name: 'shouldShowSettings', feature: 'settings' },
  { name: 'shouldShowThemeToggle', feature: 'themeToggle' }
]

export function useHeaderBar() {
  const settingStore = useSettingStore()

  const {
    showMenuButton,
    showFastEnter,
    showRefreshButton,
    showCrumbs,
    showLanguage
  } = storeToRefs(settingStore)

  const storeRefs: Record<string, Ref<boolean>> = {
    showMenuButton,
    showFastEnter,
    showRefreshButton,
    showCrumbs,
    showLanguage
  }

  const isFeatureEnabled = (feature: FeatureKey): boolean => {
    return headerBarConfig[feature]?.enabled ?? false
  }

  const getFeatureConfig = (feature: FeatureKey) => {
    return headerBarConfig[feature]
  }

  const createShouldShowComputed = (
    feature: FeatureKey,
    storeRef?: Ref<boolean>
  ): ComputedRef<boolean> => {
    return computed(() => {
      const enabled = isFeatureEnabled(feature)
      if (storeRef) {
        return enabled && storeRef.value
      }
      return enabled
    })
  }

  const shouldShowFeatures = showFeatureDefinitions.reduce(
    (acc, def) => {
      const storeRef = def.storeRefKey ? storeRefs[def.storeRefKey] : undefined
      acc[def.name] = createShouldShowComputed(def.feature, storeRef)
      return acc
    },
    {} as Record<string, ComputedRef<boolean>>
  )

  const fastEnterMinWidth = computed(() => {
    const config = getFeatureConfig('fastEnter') as FastEnterFeatureConfig
    return config?.minWidth ?? FAST_ENTER_DEFAULT_MIN_WIDTH
  })

  const getEnabledFeatures = (): FeatureKey[] => {
    return Object.keys(headerBarConfig).filter(
      (key) => headerBarConfig[key as FeatureKey]?.enabled
    ) as FeatureKey[]
  }

  const getDisabledFeatures = (): FeatureKey[] => {
    return Object.keys(headerBarConfig).filter(
      (key) => !headerBarConfig[key as FeatureKey]?.enabled
    ) as FeatureKey[]
  }

  return {
    headerBarConfig,

    shouldShowMenuButton: shouldShowFeatures.shouldShowMenuButton,
    shouldShowRefreshButton: shouldShowFeatures.shouldShowRefreshButton,
    shouldShowFastEnter: shouldShowFeatures.shouldShowFastEnter,
    shouldShowBreadcrumb: shouldShowFeatures.shouldShowBreadcrumb,
    shouldShowGlobalSearch: shouldShowFeatures.shouldShowGlobalSearch,
    shouldShowFullscreen: shouldShowFeatures.shouldShowFullscreen,
    shouldShowNotification: shouldShowFeatures.shouldShowNotification,
    shouldShowChat: shouldShowFeatures.shouldShowChat,
    shouldShowLanguage: shouldShowFeatures.shouldShowLanguage,
    shouldShowSettings: shouldShowFeatures.shouldShowSettings,
    shouldShowThemeToggle: shouldShowFeatures.shouldShowThemeToggle,

    fastEnterMinWidth,

    isFeatureEnabled,
    getFeatureConfig,
    getEnabledFeatures,
    getDisabledFeatures
  }
}
