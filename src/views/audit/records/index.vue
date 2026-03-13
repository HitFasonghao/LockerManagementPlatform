<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadRecords">
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
        <span class="white-space-nowrap text-14">审核轮次：</span>
        <n-input-number
          v-model:value="query.round"
          placeholder="请输入"
          clearable
          :min="1"
          style="width: 120px"
          @clear="handleSearch"
          @update:value="handleSearch"
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
        <span class="white-space-nowrap text-14">审核结果：</span>
        <n-select
          v-model:value="query.passed"
          :options="passedOptions"
          placeholder="请选择"
          clearable
          style="width: 120px"
          @update:value="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">完成时间：</span>
        <n-date-picker
          v-model:value="completedTimeRange"
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
        :data="records"
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
        @update:page="loadRecords"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditRecords' })

function formatLocalDateTime(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const router = useRouter()
const loading = ref(false)
const records = ref([])
const total = ref(0)
const nodeOptions = ref([])

const query = ref({
  companyName: '',
  round: null,
  auditNodeId: null,
  passed: null,
  pageNum: 1,
  pageSize: 10,
})

const completedTimeRange = ref(null)

const passedOptions = [
  { label: '通过', value: true },
  { label: '未通过', value: false },
]

const columns = [
  { title: '厂商名称', key: 'companyName', width: 180, ellipsis: { tooltip: true } },
  { title: '审核轮次', key: 'round', width: 90, align: 'center' },
  { title: '审核节点', key: 'nodeName', width: 130 },
  {
    title: '审核结果',
    key: 'passed',
    width: 100,
    render: row => row.passed != null
      ? h(NTag, {
          type: row.passed ? 'success' : 'error',
          size: 'small',
        }, { default: () => row.passed ? '通过' : '未通过' })
      : '-',
  },
  { title: '审核意见', key: 'notes', width: 250, ellipsis: { tooltip: true } },
  { title: '完成时间', key: 'completedTime', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'right',
    fixed: 'right',
    render(row) {
      return row.vendorId
        ? h(NButton, {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => router.push({ path: `/audit/review/${row.vendorId}`, query: { recordId: row.auditRecordId } }),
          }, {
            default: () => '查看详情',
            icon: () => h('i', { class: 'i-material-symbols:visibility-outline text-14' }),
          })
        : null
    },
  },
]

onMounted(() => {
  loadRecords()
  loadNodeOptions()
})

async function loadRecords() {
  loading.value = true
  try {
    const params = { ...query.value }
    if (!params.companyName)
      delete params.companyName
    if (!params.round)
      delete params.round
    if (!params.auditNodeId)
      delete params.auditNodeId
    if (params.passed === null)
      delete params.passed

    if (completedTimeRange.value) {
      params.completedTimeStart = formatLocalDateTime(completedTimeRange.value[0])
      params.completedTimeEnd = formatLocalDateTime(completedTimeRange.value[1])
    }

    const { data } = await api.getMyAuditRecords(params)
    records.value = data?.list || []
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
  loadRecords()
}

function handleReset() {
  query.value = {
    companyName: '',
    round: null,
    auditNodeId: null,
    passed: null,
    pageNum: 1,
    pageSize: 10,
  }
  completedTimeRange.value = null
  loadRecords()
}

function handlePageSizeChange(size) {
  query.value.pageSize = size
  query.value.pageNum = 1
  loadRecords()
}
</script>
