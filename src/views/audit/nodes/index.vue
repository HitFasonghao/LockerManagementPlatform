<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增节点
      </NButton>
    </template>

    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="nodeList"
        :row-key="row => row.auditNodeId"
        :scroll-x="900"
      />
    </n-spin>

    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="100"
        :model="modalForm"
      >
        <n-form-item
          label="节点名称"
          path="name"
          :rule="{ required: true, message: '请输入节点名称', trigger: ['input', 'blur'] }"
        >
          <n-input v-model:value="modalForm.name" placeholder="请输入节点名称" />
        </n-form-item>
        <n-form-item
          label="节点类型"
          path="type"
          :rule="{ required: true, message: '请选择节点类型', trigger: ['change'] }"
        >
          <n-select v-model:value="modalForm.type" :options="nodeTypeOptions" placeholder="请选择节点类型" />
        </n-form-item>
        <n-form-item
          label="顺序"
          path="order"
          :rule="{ required: true, type: 'number', message: '请输入顺序', trigger: ['input', 'blur'] }"
        >
          <n-input-number v-model:value="modalForm.order" :min="1" class="w-full" />
        </n-form-item>
        <n-form-item label="超时时间(小时)" path="timeoutHours">
          <n-input-number v-model:value="modalForm.timeoutHours" :min="1" class="w-full" />
        </n-form-item>
        <n-form-item label="自动通过" path="autoPass">
          <NSwitch v-model:value="modalForm.autoPass">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </NSwitch>
        </n-form-item>
        <n-form-item label="是否启用" path="isActive">
          <NSwitch v-model:value="modalForm.isActive">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </NSwitch>
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NSwitch, NTag } from 'naive-ui'
import { MeModal } from '@/components'
import { useCrud } from '@/composables'
import api from './api'

defineOptions({ name: 'AuditNodes' })

const loading = ref(false)
const nodeList = ref([])

const nodeTypeOptions = [
  { label: '资质审核', value: 'qualification' },
  { label: 'API测试', value: 'api_test' },
  { label: '性能测试', value: 'performance' },
  { label: '合规检查', value: 'compliance' },
  { label: '人工审核', value: 'manual_review' },
]
const nodeTypeMap = Object.fromEntries(nodeTypeOptions.map(o => [o.value, o.label]))

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleEdit,
} = useCrud({
  name: '审核节点',
  initForm: { autoPass: false, timeoutHours: 24, isActive: true },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => loadNodes(),
})

const columns = [
  { title: '节点ID', key: 'auditNodeId', width: 80 },
  { title: '节点名称', key: 'name', width: 140 },
  {
    title: '节点类型',
    key: 'type',
    width: 120,
    render: row => nodeTypeMap[row.type] || row.type,
  },
  { title: '顺序', key: 'order', width: 70, align: 'center' },
  { title: '超时(小时)', key: 'timeoutHours', width: 100, align: 'center' },
  {
    title: '自动通过',
    key: 'autoPass',
    width: 100,
    render: row =>
      h(NTag, { type: row.autoPass ? 'success' : 'default', size: 'small' }, {
        default: () => row.autoPass ? '是' : '否',
      }),
  },
  {
    title: '状态',
    key: 'isActive',
    width: 100,
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.isActive,
          loading: !!row.activeLoading,
          onUpdateValue: () => handleToggleActive(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.auditNodeId),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          },
        ),
      ]
    },
  },
]

onMounted(() => {
  loadNodes()
})

async function loadNodes() {
  loading.value = true
  try {
    const { data } = await api.read()
    nodeList.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

async function handleToggleActive(row) {
  row.activeLoading = true
  try {
    await api.update({ auditNodeId: row.auditNodeId, isActive: !row.isActive })
    $message.success('操作成功')
    await loadNodes()
  }
  catch (error) {
    console.error(error)
    row.activeLoading = false
  }
}
</script>
