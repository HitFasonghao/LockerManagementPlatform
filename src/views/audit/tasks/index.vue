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

    <!-- 更新任务状态弹窗 -->
    <MeModal ref="updateModalRef" title="更新任务" width="480px" @ok="handleUpdateSave">
      <n-form ref="updateFormRef" :model="updateForm" label-placement="left" :label-width="80">
        <n-form-item label="状态">
          <n-select v-model:value="updateForm.status" :options="taskStatusOptions" />
        </n-form-item>
        <n-form-item label="优先级">
          <n-select v-model:value="updateForm.priority" :options="priorityOptions" clearable />
        </n-form-item>
        <n-form-item label="审核意见">
          <n-input v-model:value="updateForm.notes" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import { MeModal } from '@/components'
import { useForm, useModal } from '@/composables'
import api from './api'

defineOptions({ name: 'AuditTasks' })

const router = useRouter()
const loading = ref(false)
const taskList = ref([])
const currentTaskId = ref(null)

const [updateModalRef] = useModal()
const [updateFormRef, updateForm, updateValidation] = useForm({
  status: null,
  priority: null,
  notes: '',
})

const taskStatusMap = {
  pending: { label: '待处理', type: 'warning' },
  in_progress: { label: '处理中', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  overdue: { label: '已超时', type: 'error' },
}
const priorityMap = {
  low: { label: '低', type: 'default' },
  medium: { label: '中', type: 'info' },
  high: { label: '高', type: 'warning' },
  urgent: { label: '紧急', type: 'error' },
}

const taskStatusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
]
const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
]

const columns = [
  { title: '任务ID', key: 'auditTaskId', width: 80 },
  { title: '厂商名称', key: 'companyName', width: 180, ellipsis: { tooltip: true } },
  { title: '审核节点', key: 'nodeName', width: 130 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: row =>
      h(NTag, {
        type: taskStatusMap[row.status]?.type ?? 'default',
        size: 'small',
      }, { default: () => taskStatusMap[row.status]?.label ?? row.status }),
  },
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
  { title: '完成时间', key: 'completedTime', width: 170 },
  { title: '审核意见', key: 'notes', width: 200, ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleUpdate(row),
          },
          {
            default: () => '更新',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' }),
          },
        ),
        row.vendorId
          ? h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                secondary: true,
                style: 'margin-left: 12px;',
                onClick: () => router.push(`/audit/review/${row.vendorId}`),
              },
              {
                default: () => '审核详情',
                icon: () => h('i', { class: 'i-material-symbols:open-in-new text-14' }),
              },
            )
          : null,
      ]
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

function handleUpdate(row) {
  currentTaskId.value = row.auditTaskId
  updateForm.value = {
    status: row.status,
    priority: row.priority,
    notes: row.notes || '',
  }
  updateModalRef.value?.open()
}

async function handleUpdateSave() {
  await api.updateTask(currentTaskId.value, updateForm.value)
  $message.success('任务更新成功')
  await loadTasks()
}
</script>
