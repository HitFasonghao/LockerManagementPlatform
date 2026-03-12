<template>
  <CommonPage :back="true" title="柜群详情">
    <n-spin :show="loading">
      <!-- 柜群详细信息 -->
      <n-card title="柜群信息" class="mb-16">
        <n-descriptions :column="3" label-placement="left" bordered>
          <n-descriptions-item label="柜群名称">
            {{ detail.name }}
          </n-descriptions-item>
          <n-descriptions-item label="柜群地址">
            {{ detail.location }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <NTag :type="detail.status === 'using' ? 'success' : 'error'" size="small">
              {{ detail.status === 'using' ? '使用中' : '禁用' }}
            </NTag>
          </n-descriptions-item>
          <n-descriptions-item label="经度">
            {{ detail.longitude }}
          </n-descriptions-item>
          <n-descriptions-item label="纬度">
            {{ detail.dimension }}
          </n-descriptions-item>
          <n-descriptions-item label="寄存柜数量">
            {{ detail.cabinetCount ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="描述" :span="3">
            {{ detail.description }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ detail.createdTime }}
          </n-descriptions-item>
          <n-descriptions-item label="更新时间">
            {{ detail.updatedTime }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 寄存柜列表 -->
      <n-card title="寄存柜列表">
        <div v-if="detail.cabinets && detail.cabinets.length" class="grid grid-cols-2 gap-16 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
          <div
            v-for="item in detail.cabinets"
            :key="item.cabinetId"
            class="relative border border-gray-200 rounded-8 border-solid p-16 transition-all-300 dark:border-gray-700"
          >
            <div class="mb-8 text-16 font-500">
              {{ item.deviceId }}
            </div>
            <div class="mb-6 flex items-center text-13 opacity-70">
              <span class="mr-4">状态：</span>
              <NTag :type="cabinetStatusMap[item.status]?.type ?? 'default'" size="small">
                {{ cabinetStatusMap[item.status]?.label ?? item.status }}
              </NTag>
            </div>
            <div class="mb-6 text-13 opacity-70">
              种类：{{ item.kindName || '未设置' }}
            </div>
            <!-- 右下角操作图标 -->
            <div class="absolute bottom-8 right-8">
              <n-dropdown :options="getActionOptions(item)" trigger="click" @select="key => handleAction(key, item)">
                <NButton text class="text-18 opacity-50 hover:opacity-100">
                  <i class="i-fe:more-vertical" />
                </NButton>
              </n-dropdown>
            </div>
          </div>
        </div>
        <n-empty v-else description="该柜群暂无寄存柜" />
      </n-card>
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'DeviceClusterDetail' })

const route = useRoute()
const loading = ref(false)
const detail = ref({})

const cabinetStatusMap = {
  free: { label: '空闲', type: 'success' },
  opening: { label: '开启中', type: 'info' },
  using: { label: '使用中', type: 'warning' },
  forbidden: { label: '禁用', type: 'error' },
}

onMounted(() => {
  loadDetail()
})

async function loadDetail() {
  loading.value = true
  try {
    const { data } = await api.detail(route.params.clusterId)
    detail.value = data || {}
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

function getActionOptions(item) {
  const options = []
  if (item.status === 'free') {
    options.push({ label: '禁用', key: 'disable' })
  }
  else if (item.status === 'forbidden') {
    options.push({ label: '启用', key: 'enable' })
    options.push({ label: '删除', key: 'delete' })
  }
  // opening / using 状态不显示禁用/启用
  if (item.status === 'opening' || item.status === 'using') {
    options.push({ label: '使用中，无法操作', key: 'noop', disabled: true })
  }
  return options
}

function handleAction(key, item) {
  if (key === 'disable') {
    $dialog.warning({
      title: '确认禁用',
      content: `确定禁用寄存柜「${item.deviceId}」吗？`,
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => doCabinetStatus(item.cabinetId, 'forbidden'),
    })
  }
  else if (key === 'enable') {
    $dialog.info({
      title: '确认启用',
      content: `确定启用寄存柜「${item.deviceId}」吗？`,
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => doCabinetStatus(item.cabinetId, 'free'),
    })
  }
  else if (key === 'delete') {
    $dialog.error({
      title: '确认删除',
      content: `确定将寄存柜「${item.deviceId}」从该柜群中移除吗？`,
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => doRemoveCabinet(item.cabinetId),
    })
  }
}

async function doCabinetStatus(cabinetId, status) {
  try {
    await api.updateCabinetStatus({ cabinetId, status })
    $message.success(status === 'forbidden' ? '禁用成功' : '启用成功')
    loadDetail()
  }
  catch (error) {
    console.error(error)
  }
}

async function doRemoveCabinet(cabinetId) {
  try {
    await api.removeCabinet(cabinetId)
    $message.success('删除成功')
    loadDetail()
  }
  catch (error) {
    console.error(error)
  }
}
</script>
