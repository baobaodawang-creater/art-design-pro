<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>代办事项</h4>
        <p
          >待处理<span class="text-danger">{{ pendingCount }}</span></p
        >
      </div>
    </div>

    <div class="h-[calc(100%-40px)] overflow-auto">
      <ElScrollbar>
        <div
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0"
          v-for="(item, index) in todoList"
          :key="index"
        >
          <div>
            <p class="text-sm">{{ item.username }}</p>
            <p class="text-g-500 mt-1">{{ item.date }}</p>
          </div>
          <ElCheckbox v-model="item.complate" />
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    data?: Api.Dashboard.TodoData
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({
      list: [],
      pendingCount: 0
    })
  })

  const todoList = computed(() => props.data.list)
  const pendingCount = computed(() => props.data.pendingCount)
</script>
