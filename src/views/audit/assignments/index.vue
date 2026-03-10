<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadData">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        刷新
      </NButton>
    </template>

    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="vendorList"
        :row-key="row => row.vendorId"
        :scroll-x="1100"
      />
    </n-spin>

    <!-- 分配对话框 -->
    <n-modal v-model:show="assignVisible" preset="dialog" title="分配审核任务" positive-text="确认分配" negative-text="取消" :loading="assignLoading" @positive-click="handleAssign">
      <n-form label-placement="left" :label-width="80">
        <n-form-item label="厂商">
          {{ currentVendor?.companyName }}
        </n-form-item>
        <n-form-item label="当前节点">
          {{ currentVendor?.currentNodeName }}
        </n-form-item>
        <n-form-item label="分配给">
          <n-select
            v-model:value="assignForm.adminId"
            :options="adminOptions"
            placeholder="请选择审核员"
            class="w-full"
          />
        </n-form-item>
        <n-form-item label="优先级">
          <n-select
            v-model:value="assignForm.priority"
            :options="priorityOptions"
            placeholder="请选择优先级"
            class="w-full"
          />
        </n-form-item>
        <n-form-item label="截止时间">
          <n-date-picker
            v-model:value="assignForm.dueDateTs"
            type="datetime"
            clearable
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

defineOptions({ name: 'AuditAssignment' })

const loading = ref(false)
const assignLoading = ref(false)
const assignVisible = ref(false)
const vendorList = ref([])
const adminOptions = ref([])
const currentVendor = ref(null)

const assignForm = ref({
  adminId: null,
  priority: 'medium',
  dueDateTs: null,
})

const statusMap = {
  pending: { label: '待资质审核', type: 'warning' },
  testing: { label: '技术测试中', type: 'info' },
}

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
]

const columns = [
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
  { title: '当前节点', key: 'currentNodeName', width: 120 },
  { title: '审核轮次', key: 'currentRound', width: 90, align: 'center' },
  { title: '提交时间', key: 'submittedTime', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'right',
    fixed: 'right',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          onClick: () => openAssignDialog(row),
        },
        {
          default: () => '分配',
          icon: () => h('i', { class: 'i-material-symbols:assignment-ind-outline text-14' }),
        },
      )
    },
  },
]

onMounted(() => {
  loadData()
  loadAdmins()
})

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.getPendingAssignments()
    vendorList.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

async function loadAdmins() {
  try {
    const { data } = await api.getAdminOptions()
    adminOptions.value = (data || []).map(a => ({
      label: a.realName ? `${a.realName} (${a.username})` : a.username,
      value: a.adminId,
    }))
  }
  catch (error) {
    console.error(error)
  }
}

function openAssignDialog(row) {
  currentVendor.value = row
  assignForm.value = {
    adminId: null,
    priority: 'medium',
    dueDateTs: null,
  }
  assignVisible.value = true
}

async function handleAssign() {
  if (!assignForm.value.adminId) {
    $message.warning('请选择审核员')
    return false
  }
  if (!assignForm.value.dueDateTs) {
    $message.warning('请选择截止时间')
    return false
  }

  assignLoading.value = true
  try {
    await api.assign({
      vendorId: currentVendor.value.vendorId,
      adminId: assignForm.value.adminId,
      priority: assignForm.value.priority,
      dueDate: new Date(assignForm.value.dueDateTs).toISOString(),
    })
    $message.success('分配成功')
    assignVisible.value = false
    await loadData()
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
