<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadTasks">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        刷新
      </NButton>
    </template>

    <!-- 查询条件 -->
    <div class="mb-16 flex flex-wrap items-center gap-16">
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">厂商名称：</span>
        <n-input
          v-model:value="query.companyName"
          placeholder="请输入"
          clearable
          style="width: 150px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">审核节点：</span>
        <n-select
          v-model:value="query.auditNodeId"
          :options="nodeOptions"
          placeholder="请选择"
          clearable
          style="width: 150px"
          @update:value="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">优先级：</span>
        <n-select
          v-model:value="query.priority"
          :options="priorityOptions"
          placeholder="请选择"
          clearable
          style="width: 120px"
          @update:value="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">截止时间：</span>
        <n-date-picker
          v-model:value="dueDateRange"
          type="datetimerange"
          clearable
          style="width: 380px"
          @update:value="handleSearch"
        />
      </div>
      <NButton type="primary" @click="handleSearch">
        <i class="i-fe:search mr-4 text-14" />
        查询
      </NButton>
      <NButton @click="handleReset">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        重置
      </NButton>
    </div>

    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="taskList"
        :row-key="row => row.auditTaskId"
        :scroll-x="1200"
      />
    </n-spin>

    <!-- 分页 -->
    <div v-if="total > 0" class="mt-16 flex items-center justify-between">
      <span class="text-13 opacity-60">共 {{ total }} 条数据</span>
      <n-pagination
        v-model:page="query.pageNum"
        v-model:page-size="query.pageSize"
        :item-count="total"
        show-size-picker
        show-quick-jumper
        :page-sizes="[10, 20, 30]"
        @update:page="loadTasks"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </CommonPage>
</template>

<script setup>
import { NButton, NSpace, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditTasks' })

function formatLocalDateTime(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const router = useRouter()
const loading = ref(false)
const taskList = ref([])
const total = ref(0)
const nodeOptions = ref([])

const query = ref({
  companyName: '',
  auditNodeId: null,
  priority: null,
  pageNum: 1,
  pageSize: 10,
})

const dueDateRange = ref(null)

const priorityMap = {
  low: { label: '低', type: 'default' },
  medium: { label: '中', type: 'info' },
  high: { label: '高', type: 'warning' },
  urgent: { label: '紧急', type: 'error' },
}

const priorityOptions = Object.entries(priorityMap).map(([value, { label }]) => ({ label, value }))

const columns = [
  { title: '厂商名称', key: 'companyName', width: 180, ellipsis: { tooltip: true } },
  { title: '审核节点', key: 'nodeName', width: 130 },
  {
    title: '优先级',
    key: 'priority',
    width: 80,
    render: row =>
      h(NTag, {
        type: priorityMap[row.priority]?.type ?? 'default',
        size: 'small',
      }, { default: () => priorityMap[row.priority]?.label ?? row.priority }),
  },
  { title: '截止时间', key: 'dueDate', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    fixed: 'right',
    render(row) {
      const buttons = []
      buttons.push(
        h(NButton, {
          size: 'small',
          type: 'primary',
          onClick: () => router.push(`/audit/tasks/handle/${row.auditTaskId}`),
        }, {
          default: () => '处理',
          icon: () => h('i', { class: 'i-material-symbols:edit-note text-14' }),
        }),
      )
      if (row.vendorId) {
        buttons.push(
          h(NButton, {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => router.push(`/audit/review/${row.vendorId}`),
          }, {
            default: () => '审核详情',
            icon: () => h('i', { class: 'i-material-symbols:visibility-outline text-14' }),
          }),
        )
      }
      return h(NSpace, null, { default: () => buttons })
    },
  },
]

onMounted(() => {
  loadTasks()
  loadNodeOptions()
})

async function loadTasks() {
  loading.value = true
  try {
    const params = { ...query.value }
    if (!params.companyName)
      delete params.companyName
    if (!params.auditNodeId)
      delete params.auditNodeId
    if (!params.priority)
      delete params.priority

    if (dueDateRange.value) {
      params.dueDateStart = formatLocalDateTime(dueDateRange.value[0])
      params.dueDateEnd = formatLocalDateTime(dueDateRange.value[1])
    }

    const { data } = await api.getMyTasks(params)
    taskList.value = data?.list || []
    total.value = data?.total || 0
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

async function loadNodeOptions() {
  try {
    const { data } = await api.getNodeOptions()
    nodeOptions.value = (data || []).map(n => ({
      label: n.name,
      value: n.auditNodeId,
    }))
  }
  catch (error) {
    console.error(error)
  }
}

function handleSearch() {
  query.value.pageNum = 1
  loadTasks()
}

function handleReset() {
  query.value = {
    companyName: '',
    auditNodeId: null,
    priority: null,
    pageNum: 1,
    pageSize: 10,
  }
  dueDateRange.value = null
  loadTasks()
}

function handlePageSizeChange(size) {
  query.value.pageSize = size
  query.value.pageNum = 1
  loadTasks()
}
</script>
