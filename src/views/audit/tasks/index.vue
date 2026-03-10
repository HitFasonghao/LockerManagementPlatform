<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadTasks">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        刷新
      </NButton>
    </template>

    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="taskList"
        :row-key="row => row.auditTaskId"
        :scroll-x="1200"
      />
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NButton, NSpace, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditTasks' })

const router = useRouter()
const loading = ref(false)
const taskList = ref([])

const priorityMap = {
  low: { label: '低', type: 'default' },
  medium: { label: '中', type: 'info' },
  high: { label: '高', type: 'warning' },
  urgent: { label: '紧急', type: 'error' },
}

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
})

async function loadTasks() {
  loading.value = true
  try {
    const { data } = await api.getMyTasks()
    taskList.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}
</script>
