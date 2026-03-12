<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleSync">
        <i class="i-fe:refresh-cw mr-4 text-14" />
        同步
      </NButton>
    </template>

    <!-- 查询条件 -->
    <div class="mb-16 flex items-center gap-16">
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">设备ID：</span>
        <n-input
          v-model:value="query.deviceId"
          placeholder="请输入"
          clearable
          style="width: 150px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">是否分配：</span>
        <n-select
          v-model:value="query.assigned"
          :options="assignedOptions"
          placeholder="请选择"
          clearable
          style="width: 120px"
          @update:value="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">种类：</span>
        <n-select
          v-model:value="query.kindId"
          :options="kindOptions"
          placeholder="请选择"
          clearable
          style="width: 140px"
          @update:value="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">柜群：</span>
        <n-select
          v-model:value="query.clusterId"
          :options="clusterOptions"
          placeholder="请选择"
          clearable
          style="width: 140px"
          @update:value="handleSearch"
        />
      </div>
      <NButton type="primary" @click="handleSearch">
        <i class="i-fe:search mr-4 text-14" />
        查询
      </NButton>
    </div>

    <!-- 卡片列表 -->
    <n-spin :show="loading">
      <div v-if="cabinetList.length" class="grid grid-cols-2 gap-16 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
        <div
          v-for="item in cabinetList"
          :key="item.cabinetId"
          class="cursor-pointer border border-gray-200 rounded-8 border-solid p-16 transition-all-300 dark:border-gray-700 hover:shadow-md"
          @click="openActionMenu(item)"
        >
          <div class="mb-8 text-16 font-500">
            {{ item.deviceId }}
          </div>
          <div class="mb-6 flex items-center text-13 opacity-70">
            <span class="mr-4">分配状态：</span>
            <NTag :type="item.assigned ? 'success' : 'warning'" size="small">
              {{ item.assigned ? '已分配' : '待分配' }}
            </NTag>
          </div>
          <div class="mb-6 flex items-center text-13 opacity-70">
            <span class="mr-4">设备状态：</span>
            <NTag :type="statusMap[item.status]?.type ?? 'default'" size="small">
              {{ statusMap[item.status]?.label ?? item.status }}
            </NTag>
          </div>
          <div class="mb-6 text-13 opacity-70">
            种类：{{ item.kindName || '未设置' }}
          </div>
          <div class="text-13 opacity-70">
            柜群：{{ item.clusterName || '未设置' }}
          </div>
        </div>
      </div>
      <n-empty v-else description="暂无数据" />
    </n-spin>

    <!-- 分页 -->
    <div v-if="total > 0" class="mt-16 flex items-center justify-between">
      <span class="text-13 opacity-60">
        共 {{ total }} 条数据，共 {{ Math.ceil(total / query.pageSize) }} 页，当前第 {{ query.pageNum }} 页，每页 {{ query.pageSize }} 条
      </span>
      <n-pagination
        v-model:page="query.pageNum"
        v-model:page-size="query.pageSize"
        :item-count="total"
        show-size-picker
        show-quick-jumper
        :page-sizes="[12, 24, 36, 48]"
        @update:page="loadData"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <!-- 操作弹框 -->
    <n-modal v-model:show="actionVisible" preset="dialog" title="寄存柜操作" :show-icon="false">
      <div class="flex flex-col gap-12 py-8">
        <NButton class="w-full" @click="openAssignKind">
          <i class="i-fe:tag mr-4 text-14" />
          分配种类
        </NButton>
        <NButton class="w-full" @click="openAssignCluster">
          <i class="i-fe:map-pin mr-4 text-14" />
          分配柜群
        </NButton>
      </div>
    </n-modal>

    <!-- 分配种类弹框 -->
    <n-modal v-model:show="kindVisible" preset="dialog" title="分配种类" positive-text="确认" negative-text="取消" :loading="assignLoading" @positive-click="handleAssignKind">
      <n-form label-placement="left" :label-width="80" class="pt-8">
        <n-form-item label="设备ID">
          {{ currentCabinet?.deviceId }}
        </n-form-item>
        <n-form-item label="选择种类">
          <n-select
            v-model:value="assignKindForm.kindId"
            :options="kindOptions"
            placeholder="请选择种类"
            class="w-full"
          />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 分配柜群弹框 -->
    <n-modal v-model:show="clusterVisible" preset="dialog" title="分配柜群" positive-text="确认" negative-text="取消" :loading="assignLoading" @positive-click="handleAssignCluster">
      <n-form label-placement="left" :label-width="80" class="pt-8">
        <n-form-item label="设备ID">
          {{ currentCabinet?.deviceId }}
        </n-form-item>
        <n-form-item label="选择柜群">
          <n-select
            v-model:value="assignClusterForm.clusterId"
            :options="clusterOptions"
            placeholder="请选择柜群"
            class="w-full"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'DeviceCabinet' })

const loading = ref(false)
const assignLoading = ref(false)
const cabinetList = ref([])
const total = ref(0)
const kindOptions = ref([])
const clusterOptions = ref([])
const currentCabinet = ref(null)

const actionVisible = ref(false)
const kindVisible = ref(false)
const clusterVisible = ref(false)

const query = ref({
  deviceId: '',
  assigned: null,
  kindId: null,
  clusterId: null,
  pageNum: 1,
  pageSize: 24,
})

const assignKindForm = ref({ kindId: null })
const assignClusterForm = ref({ clusterId: null })

const assignedOptions = [
  { label: '已分配', value: true },
  { label: '待分配', value: false },
]

const statusMap = {
  free: { label: '空闲', type: 'success' },
  opening: { label: '开启中', type: 'info' },
  using: { label: '使用中', type: 'warning' },
  forbidden: { label: '禁用', type: 'error' },
}

onMounted(() => {
  loadData()
  loadOptions()
})

async function loadData() {
  loading.value = true
  try {
    const params = { ...query.value }
    // 清除空值
    if (!params.deviceId)
      delete params.deviceId
    if (params.assigned === null)
      delete params.assigned
    if (!params.kindId)
      delete params.kindId
    if (!params.clusterId)
      delete params.clusterId

    const { data } = await api.list(params)
    cabinetList.value = data?.list || []
    total.value = data?.total || 0
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const [kindRes, clusterRes] = await Promise.all([
      api.kindOptions(),
      api.clusterOptions(),
    ])
    kindOptions.value = (kindRes.data || []).map(k => ({
      label: k.name,
      value: k.kindId,
    }))
    clusterOptions.value = (clusterRes.data || []).map(c => ({
      label: c.name,
      value: c.clusterId,
    }))
  }
  catch (error) {
    console.error(error)
  }
}

function handleSearch() {
  query.value.pageNum = 1
  loadData()
}

function handlePageSizeChange(size) {
  query.value.pageSize = size
  query.value.pageNum = 1
  loadData()
}

async function handleSync() {
  $dialog.warning({
    title: '确认同步',
    content: '是否确认同步所有寄存柜到平台中？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.sync()
        $message.success('同步成功')
        loadData()
      }
      catch (error) {
        console.error(error)
      }
    },
  })
}

function openActionMenu(item) {
  // 已分配柜群的不显示操作
  if (item.assigned) {
    $message.info('该寄存柜已分配柜群，无需操作')
    return
  }
  currentCabinet.value = item
  actionVisible.value = true
}

function openAssignKind() {
  actionVisible.value = false
  assignKindForm.value.kindId = currentCabinet.value?.kindId || null
  kindVisible.value = true
}

function openAssignCluster() {
  actionVisible.value = false
  if (!currentCabinet.value?.kindName) {
    $message.warning('请先设置寄存柜种类')
    return
  }
  assignClusterForm.value.clusterId = null
  clusterVisible.value = true
}

async function handleAssignKind() {
  if (!assignKindForm.value.kindId) {
    $message.warning('请选择种类')
    return false
  }
  assignLoading.value = true
  try {
    await api.assignKind({
      cabinetId: currentCabinet.value.cabinetId,
      kindId: assignKindForm.value.kindId,
    })
    $message.success('分配种类成功')
    kindVisible.value = false
    loadData()
  }
  catch (error) {
    console.error(error)
    return false
  }
  finally {
    assignLoading.value = false
  }
}

async function handleAssignCluster() {
  if (!assignClusterForm.value.clusterId) {
    $message.warning('请选择柜群')
    return false
  }
  assignLoading.value = true
  try {
    await api.assignCluster({
      cabinetId: currentCabinet.value.cabinetId,
      clusterId: assignClusterForm.value.clusterId,
    })
    $message.success('分配柜群成功')
    clusterVisible.value = false
    loadData()
  }
  catch (error) {
    console.error(error)
    return false
  }
  finally {
    assignLoading.value = false
  }
}
</script>
