<template>
  <div class="art-card p-5 h-128 overflow-hidden mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>新用户</h4>
        <p
          >这个月增长<span class="text-success">{{ growthRate }}</span></p
        >
      </div>
      <ElRadioGroup v-model="radio2">
        <ElRadioButton value="本月" label="本月"></ElRadioButton>
        <ElRadioButton value="上月" label="上月"></ElRadioButton>
        <ElRadioButton value="今年" label="今年"></ElRadioButton>
      </ElRadioGroup>
    </div>
    <ArtTable
      class="w-full"
      :data="tableData"
      style="width: 100%"
      size="large"
      :border="false"
      :stripe="false"
      :header-cell-style="{ background: 'transparent' }"
    >
      <template #default>
        <ElTableColumn label="头像" prop="avatar" width="150px">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <img
                class="size-9 rounded-lg"
                :src="scope.row.avatar || defaultAvatar"
                alt="avatar"
              />
              <span class="ml-2">{{ scope.row.username }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="地区" prop="province" />
        <ElTableColumn label="性别" prop="avatar">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <span style="margin-left: 10px">{{ scope.row.sex === 1 ? '男' : '女' }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="进度" width="240">
          <template #default="scope">
            <ElProgress
              :percentage="scope.row.pro"
              :color="scope.row.color"
              :stroke-width="4"
              :aria-label="`${scope.row.username}的完成进度: ${scope.row.pro}%`"
            />
          </template>
        </ElTableColumn>
      </template>
    </ArtTable>
  </div>
</template>

<script setup lang="ts">
  import avatar1 from '@/assets/images/avatar/avatar1.webp'
  import avatar2 from '@/assets/images/avatar/avatar2.webp'
  import avatar3 from '@/assets/images/avatar/avatar3.webp'
  import avatar4 from '@/assets/images/avatar/avatar4.webp'
  import avatar5 from '@/assets/images/avatar/avatar5.webp'
  import avatar6 from '@/assets/images/avatar/avatar6.webp'

  const ANIMATION_DELAY = 100

  const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6]
  const defaultAvatar = avatar1

  interface Props {
    data?: Api.Dashboard.NewUserData
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({
      tableData: [],
      growthRate: '+0%'
    })
  })

  const radio2 = ref('本月')

  const tableData = computed(() => {
    return props.data.tableData.map((item, index) => ({
      ...item,
      avatar: item.avatar || avatars[index % avatars.length]
    }))
  })

  const growthRate = computed(() => props.data.growthRate)

  const addAnimation = (): void => {
    setTimeout(() => {
      props.data.tableData.forEach((item) => {
        item.pro = item.percentage
      })
    }, ANIMATION_DELAY)
  }

  watch(
    () => props.data.tableData,
    () => {
      addAnimation()
    },
    { deep: true }
  )

  onMounted(() => {
    addAnimation()
  })
</script>

<style lang="scss" scoped>
  .art-card {
    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      color: var(--el-color-primary) !important;
      background: transparent !important;
    }
  }
</style>
