<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadData">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        刷新
      </NButton>
    </template>

    <!-- 查询条件 第一行 -->
    <div class="mb-16 flex flex-wrap items-center gap-16">
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">公司名称：</span>
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
        <span class="white-space-nowrap text-14">审核进度：</span>
        <n-select
          v-model:value="query.result"
          :options="resultOptions"
          placeholder="请选择"
          clearable
          style="width: 150px"
          @update:value="handleSearch"
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
    </div>
    <!-- 查询条件 第二行 -->
    <div class="mb-16 flex flex-wrap items-center gap-16">
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">提交时间：</span>
        <n-date-picker
          v-model:value="submitTimeRange"
          type="datetimerange"
          clearable
          style="width: 380px"
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
        :data="vendorList"
        :row-key="row => row.auditRecordId"
        :scroll-x="1300"
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
        @update:page="loadData"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

function formatLocalDateTime(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

defineOptions({ name: 'AuditVendors' })

const router = useRouter()
const loading = ref(false)
const vendorList = ref([])
const total = ref(0)

const query = ref({
  companyName: '',
  result: null,
  round: null,
  pageNum: 1,
  pageSize: 10,
})

const submitTimeRange = ref(null)
const completedTimeRange = ref(null)

const resultMap = {
  not_started: { label: '未开始', type: 'default' },
  pending_qualification: { label: '待资质审核', type: 'warning' },
  qualification_failed: { label: '资质审核失败', type: 'error' },
  pending_functional_test: { label: '待功能测试', type: 'info' },
  functional_test_failed: { label: '功能测试失败', type: 'error' },
  pending_performance_test: { label: '待性能测试', type: 'info' },
  performance_test_failed: { label: '性能测试失败', type: 'error' },
  pending_final_approval: { label: '待最终审批', type: 'warning' },
  final_approval_rejected: { label: '最终审批驳回', type: 'error' },
  approved: { label: '审核通过', type: 'success' },
}

const resultOptions = Object.entries(resultMap).map(([value, { label }]) => ({ label, value }))

const columns = [
  { title: '公司名称', key: 'companyName', width: 200, ellipsis: { tooltip: true } },
  { title: '简称', key: 'shortName', width: 100 },
  { title: '联系人', key: 'contactPerson', width: 100 },
  { title: '联系电话', key: 'contactPhone', width: 130 },
  {
    title: '审核进度',
    key: 'result',
    width: 140,
    render: row =>
      h(NTag, {
        type: resultMap[row.result]?.type ?? 'default',
        size: 'small',
      }, { default: () => resultMap[row.result]?.label ?? row.result ?? '未知' }),
  },
  { title: '审核轮次', key: 'currentRound', width: 90, align: 'center' },
  {
    title: '提交时间',
    key: 'createdTime',
    width: 170,
  },
  {
    title: '完成时间',
    key: 'completedTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    align: 'right',
    fixed: 'right',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          secondary: true,
          onClick: () => router.push({ path: `/audit/review/${row.vendorId}`, query: { recordId: row.auditRecordId } }),
        },
        {
          default: () => '审核详情',
          icon: () => h('i', { class: 'i-material-symbols:visibility-outline text-14' }),
        },
      )
    },
  },
]

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const params = { ...query.value }
    if (!params.companyName) delete params.companyName
    if (!params.result) delete params.result
    if (!params.round) delete params.round

    if (submitTimeRange.value) {
      params.submitTimeStart = formatLocalDateTime(submitTimeRange.value[0])
      params.submitTimeEnd = formatLocalDateTime(submitTimeRange.value[1])
    }
    if (completedTimeRange.value) {
      params.completedTimeStart = formatLocalDateTime(completedTimeRange.value[0])
      params.completedTimeEnd = formatLocalDateTime(completedTimeRange.value[1])
    }

    const { data } = await api.getVendorList(params)
    vendorList.value = data?.list || []
    total.value = data?.total || 0
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  query.value.pageNum = 1
  loadData()
}

function handleReset() {
  query.value = {
    companyName: '',
    result: null,
    round: null,
    pageNum: 1,
    pageSize: 10,
  }
  submitTimeRange.value = null
  completedTimeRange.value = null
  loadData()
}

function handlePageSizeChange(size) {
  query.value.pageSize = size
  query.value.pageNum = 1
  loadData()
}
</script>
