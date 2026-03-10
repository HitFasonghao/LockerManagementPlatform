<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadRecords">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        刷新
      </NButton>
    </template>

    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="records"
        :row-key="row => row.auditTaskId"
        :scroll-x="1200"
      />
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditRecords' })

const router = useRouter()
const loading = ref(false)
const records = ref([])

const resultMap = {
  pass: { label: '通过', type: 'success' },
  fail: { label: '未通过', type: 'error' },
}

const columns = [
  { title: '厂商名称', key: 'companyName', width: 180, ellipsis: { tooltip: true } },
  { title: '审核轮次', key: 'round', width: 90, align: 'center' },
  { title: '审核节点', key: 'nodeName', width: 130 },
  {
    title: '审核结果',
    key: 'result',
    width: 100,
    render: row => row.result
      ? h(NTag, {
          type: resultMap[row.result]?.type ?? 'default',
          size: 'small',
        }, { default: () => resultMap[row.result]?.label ?? row.result })
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
            onClick: () => router.push(`/audit/review/${row.vendorId}`),
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
})

async function loadRecords() {
  loading.value = true
  try {
    const { data } = await api.getMyAuditRecords()
    records.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}
</script>
