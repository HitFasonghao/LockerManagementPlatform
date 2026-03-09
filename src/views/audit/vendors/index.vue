<template>
  <CommonPage>
    <template #action>
      <n-space>
        <n-select
          v-model:value="statusFilter"
          clearable
          placeholder="按状态筛选"
          :options="statusOptions"
          class="w-160"
          @update:value="loadData"
        />
        <NButton @click="loadData">
          <i class="i-fe:rotate-ccw mr-4 text-14" />
          刷新
        </NButton>
      </n-space>
    </template>

    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="vendorList"
        :row-key="row => row.vendorId"
        :scroll-x="1100"
      />
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditVendors' })

const router = useRouter()
const loading = ref(false)
const vendorList = ref([])
const statusFilter = ref(null)

const statusMap = {
  pending: { label: '待资质审核', type: 'warning' },
  testing: { label: '技术测试中', type: 'info' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'error' },
  suspended: { label: '已暂停', type: 'warning' },
  banned: { label: '已禁用', type: 'error' },
}

const statusOptions = [
  { label: '待资质审核', value: 'pending' },
  { label: '技术测试中', value: 'testing' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const columns = [
  { title: '厂商ID', key: 'vendorId', width: 80 },
  { title: '公司名称', key: 'companyName', width: 200, ellipsis: { tooltip: true } },
  { title: '简称', key: 'shortName', width: 100 },
  { title: '联系人', key: 'contactPerson', width: 100 },
  { title: '联系电话', key: 'contactPhone', width: 130 },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render: row =>
      h(NTag, {
        type: statusMap[row.status]?.type ?? 'default',
        size: 'small',
      }, { default: () => statusMap[row.status]?.label ?? row.status }),
  },
  { title: '审核轮次', key: 'currentRound', width: 90, align: 'center' },
  {
    title: '提交时间',
    key: 'submittedTime',
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
          onClick: () => router.push(`/audit/review/${row.vendorId}`),
        },
        {
          default: () => '审核',
          icon: () => h('i', { class: 'i-material-symbols:fact-check-outline text-14' }),
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
    const params = {}
    if (statusFilter.value)
      params.status = statusFilter.value
    const { data } = await api.getVendorList(params)
    vendorList.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}
</script>
