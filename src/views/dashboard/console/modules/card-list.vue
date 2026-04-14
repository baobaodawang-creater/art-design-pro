<template>
  <div class="card-list-container">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">数据概览</h3>
      <div class="flex items-center gap-3">
        <ElButton v-if="isEditMode && hiddenCards.length > 0" @click="showHiddenCards = true">
          显示隐藏卡片 ({{ hiddenCards.length }})
        </ElButton>
        <ElButton v-if="isEditMode" type="primary" @click="saveConfig"> 保存配置 </ElButton>
        <ElButton v-if="isEditMode" @click="cancelEdit"> 取消 </ElButton>
        <ElButton v-if="!isEditMode" @click="enterEditMode"> 编辑模式 </ElButton>
      </div>
    </div>

    <VueDraggable
      v-model="displayCards"
      :animation="200"
      :disabled="!isEditMode"
      handle=".drag-handle"
      item-key="id"
      class="flex flex-wrap"
    >
      <template #item="{ element }">
        <ElCol
          :sm="24"
          :md="element.cols === 1 ? 12 : element.cols === 2 ? 24 : 6"
          :lg="element.cols === 1 ? 6 : element.cols === 2 ? 12 : 6"
          class="mb-5 max-sm:mb-4"
        >
          <div
            class="art-card relative flex flex-col justify-center h-35 px-5"
            :class="{ 'border-2 border-dashed border-primary': isEditMode }"
          >
            <div v-if="isEditMode" class="absolute top-2 right-2 flex gap-1 z-10">
              <ElButton
                type="primary"
                size="small"
                text
                @click="toggleCardVisibility(element.id)"
                title="隐藏卡片"
              >
                <ElIcon><Hide /></ElIcon>
              </ElButton>
              <ElDropdown :hide-on-click="true" trigger="click">
                <ElButton type="primary" size="small" text title="调整列数">
                  <ElIcon><Grid /></ElIcon>
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem
                      @click="setCardCols(element.id, 1)"
                      :class="{ 'is-active': element.cols === 1 }"
                    >
                      1列
                    </ElDropdownItem>
                    <ElDropdownItem
                      @click="setCardCols(element.id, 2)"
                      :class="{ 'is-active': element.cols === 2 }"
                    >
                      2列
                    </ElDropdownItem>
                    <ElDropdownItem
                      @click="setCardCols(element.id, 4)"
                      :class="{ 'is-active': element.cols === 4 }"
                    >
                      4列
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </div>

            <div v-if="isEditMode" class="drag-handle absolute top-2 left-2 cursor-move z-10">
              <ElIcon><Rank /></ElIcon>
            </div>

            <span class="text-g-700 text-sm">{{ element.des }}</span>
            <ArtCountTo
              class="text-[26px] font-medium mt-2"
              :target="element.num"
              :duration="1300"
            />
            <div class="flex-c mt-1">
              <span class="text-xs text-g-600">较上周</span>
              <span
                class="ml-1 text-xs font-semibold"
                :class="[element.change.indexOf('+') === -1 ? 'text-danger' : 'text-success']"
              >
                {{ element.change }}
              </span>
            </div>
            <div
              class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
            >
              <ArtSvgIcon :icon="element.icon" class="text-xl text-theme" />
            </div>
          </div>
        </ElCol>
      </template>
    </VueDraggable>

    <ElDialog v-model="showHiddenCards" title="隐藏的卡片" width="500px">
      <div class="space-y-3">
        <div
          v-for="card in hiddenCards"
          :key="card.id"
          class="flex justify-between items-center p-3 border rounded"
        >
          <span>{{ card.des }}</span>
          <ElButton type="primary" size="small" @click="toggleCardVisibility(card.id)">
            显示
          </ElButton>
        </div>
        <div v-if="hiddenCards.length === 0" class="text-center text-g-500 py-5">
          暂无隐藏的卡片
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import { Hide, Grid, Rank } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  interface CardDataItem {
    id: string
    des: string
    icon: string
    startVal: number
    duration: number
    num: number
    change: string
    visible: boolean
    cols: number
    order: number
  }

  const STORAGE_KEY = 'dashboard-card-config'

  const defaultCards: CardDataItem[] = [
    {
      id: 'total-visits',
      des: '总访问次数',
      icon: 'ri:pie-chart-line',
      startVal: 0,
      duration: 1000,
      num: 9120,
      change: '+20%',
      visible: true,
      cols: 1,
      order: 0
    },
    {
      id: 'online-users',
      des: '在线访客数',
      icon: 'ri:group-line',
      startVal: 0,
      duration: 1000,
      num: 182,
      change: '+10%',
      visible: true,
      cols: 1,
      order: 1
    },
    {
      id: 'clicks',
      des: '点击量',
      icon: 'ri:fire-line',
      startVal: 0,
      duration: 1000,
      num: 9520,
      change: '-12%',
      visible: true,
      cols: 1,
      order: 2
    },
    {
      id: 'new-users',
      des: '新用户',
      icon: 'ri:progress-2-line',
      startVal: 0,
      duration: 1000,
      num: 156,
      change: '+30%',
      visible: true,
      cols: 1,
      order: 3
    }
  ]

  const isEditMode = ref(false)
  const showHiddenCards = ref(false)
  const cards = reactive<CardDataItem[]>([])
  const originalCards = ref<CardDataItem[]>([])

  const displayCards = computed(() => {
    return cards.filter((card) => card.visible).sort((a, b) => a.order - b.order)
  })

  const hiddenCards = computed(() => {
    return cards.filter((card) => !card.visible)
  })

  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY)
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        cards.splice(0, cards.length)
        defaultCards.forEach((defaultCard) => {
          const savedCard = config.find((c: CardDataItem) => c.id === defaultCard.id)
          if (savedCard) {
            cards.push({
              ...defaultCard,
              visible: savedCard.visible,
              cols: savedCard.cols,
              order: savedCard.order
            })
          } else {
            cards.push({ ...defaultCard })
          }
        })
      } else {
        cards.splice(0, cards.length, ...defaultCards.map((card) => ({ ...card })))
      }
    } catch (error) {
      console.error('Failed to load card config:', error)
      cards.splice(0, cards.length, ...defaultCards.map((card) => ({ ...card })))
    }
  }

  const saveConfig = () => {
    try {
      const config = cards.map((card) => ({
        id: card.id,
        visible: card.visible,
        cols: card.cols,
        order: card.order
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      isEditMode.value = false
      showHiddenCards.value = false
      ElMessage.success('配置已保存')
    } catch (error) {
      console.error('Failed to save card config:', error)
      ElMessage.error('保存失败')
    }
  }

  const enterEditMode = () => {
    originalCards.value = cards.map((card) => ({ ...card }))
    isEditMode.value = true
  }

  const cancelEdit = () => {
    cards.splice(0, cards.length, ...originalCards.value.map((card) => ({ ...card })))
    isEditMode.value = false
    showHiddenCards.value = false
  }

  const toggleCardVisibility = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId)
    if (card) {
      card.visible = !card.visible
    }
  }

  const setCardCols = (cardId: string, cols: number) => {
    const card = cards.find((c) => c.id === cardId)
    if (card) {
      card.cols = cols
    }
  }

  watch(
    () => displayCards.value,
    (newCards) => {
      if (isEditMode.value) {
        newCards.forEach((card, index) => {
          const originalCard = cards.find((c) => c.id === card.id)
          if (originalCard) {
            originalCard.order = index
          }
        })
      }
    },
    { deep: true }
  )

  onMounted(() => {
    loadConfig()
  })
</script>

<style scoped>
  .card-list-container {
    position: relative;
  }

  .drag-handle {
    cursor: move;
    color: var(--el-text-color-secondary);
  }

  .drag-handle:hover {
    color: var(--el-text-color-primary);
  }
</style>
