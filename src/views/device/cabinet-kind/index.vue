<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="openCreateModal">
        <i class="i-fe:plus mr-4 text-14" />
        创建种类
      </NButton>
    </template>

    <!-- 查询条件 -->
    <div class="mb-16 flex items-center gap-16">
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">种类名称：</span>
        <n-input
          v-model:value="query.name"
          placeholder="请输入"
          clearable
          style="width: 130px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">收费金额：</span>
        <n-input-number
          v-model:value="query.chargeMin"
          placeholder="最低"
          clearable
          :precision="2"
          :min="0"
          style="width: 110px"
          @clear="handleSearch"
        />
        <span class="opacity-50">~</span>
        <n-input-number
          v-model:value="query.chargeMax"
          placeholder="最高"
          clearable
          :precision="2"
          :min="0"
          style="width: 110px"
          @clear="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">时间单位：</span>
        <n-select
          v-model:value="query.timeUnit"
          :options="timeUnitOptions"
          placeholder="请选择"
          clearable
          style="width: 120px"
          @update:value="handleSearch"
        />
      </div>
      <NButton type="primary" @click="handleSearch">
        <i class="i-fe:search mr-4 text-14" />
        查询
      </NButton>
    </div>

    <!-- 列表 -->
    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="kindList"
        :row-key="row => row.kindId"
      />
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
        :page-sizes="[10, 20, 30]"
        @update:page="loadData"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <!-- 创建/修改弹框 -->
    <n-modal v-model:show="formVisible" preset="dialog" :title="isEdit ? '修改种类' : '创建种类'" positive-text="确认" negative-text="取消" :loading="formLoading" @positive-click="handleSubmit">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" :label-width="100" class="pt-8">
        <n-form-item label="种类名称" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入种类名称" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="formData.description" type="textarea" placeholder="请输入描述" :rows="3" />
        </n-form-item>
        <n-form-item label="收费金额(元)" path="charge">
          <n-input-number v-model:value="formData.charge" :precision="2" :min="0" placeholder="请输入金额" class="w-full" />
        </n-form-item>
        <n-form-item label="收费时间单位" path="timeUnit">
          <n-select v-model:value="formData.timeUnit" :options="timeUnitOptions" placeholder="请选择时间单位" />
        </n-form-item>
      </n-form>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { NButton } from 'naive-ui'
import api from './api'

defineOptions({ name: 'DeviceCabinetKind' })

const loading = ref(false)
const formLoading = ref(false)
const formVisible = ref(false)
const isEdit = ref(false)
const kindList = ref([])
const total = ref(0)
const formRef = ref(null)

const query = ref({
  name: '',
  chargeMin: null,
  chargeMax: null,
  timeUnit: null,
  pageNum: 1,
  pageSize: 10,
})

const formData = ref({
  kindId: null,
  name: '',
  description: '',
  charge: null,
  timeUnit: null,
})

const formRules = {
  name: { required: true, message: '请输入种类名称', trigger: 'blur' },
  description: { required: true, message: '请输入描述', trigger: 'blur' },
  charge: { required: true, type: 'number', message: '请输入收费金额', trigger: 'blur' },
  timeUnit: { required: true, message: '请选择收费时间单位', trigger: 'change' },
}

const timeUnitOptions = [
  { label: '每小时', value: 'anHour' },
  { label: '每半小时', value: 'halfAnHour' },
  { label: '每十分钟', value: 'tenMinutes' },
]

const timeUnitMap = {
  anHour: '每小时',
  halfAnHour: '每半小时',
  tenMinutes: '每十分钟',
}

const columns = [
  { title: '种类名称', key: 'name', width: 150 },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '数量', key: 'cabinetCount', width: 80, align: 'center' },
  {
    title: '收费金额(元)',
    key: 'charge',
    width: 120,
    align: 'center',
    render: row => `¥${Number(row.charge).toFixed(2)}`,
  },
  {
    title: '收费时间单位',
    key: 'timeUnit',
    width: 130,
    align: 'center',
    render: row => timeUnitMap[row.timeUnit] ?? row.timeUnit,
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    align: 'right',
    fixed: 'right',
    render(row) {
      return h('div', { class: 'flex justify-end gap-8' }, [
        h(NButton, { size: 'small', type: 'primary', onClick: () => openEditModal(row) }, { default: () => '修改' }),
        h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ])
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
    if (!params.name)
      delete params.name
    if (params.chargeMin === null)
      delete params.chargeMin
    if (params.chargeMax === null)
      delete params.chargeMax
    if (!params.timeUnit)
      delete params.timeUnit

    const { data } = await api.list(params)
    kindList.value = data?.list || []
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

function handlePageSizeChange(size) {
  query.value.pageSize = size
  query.value.pageNum = 1
  loadData()
}

function openCreateModal() {
  isEdit.value = false
  formData.value = { kindId: null, name: '', description: '', charge: null, timeUnit: null }
  formVisible.value = true
}

function openEditModal(row) {
  isEdit.value = true
  formData.value = {
    kindId: row.kindId,
    name: row.name,
    description: row.description,
    charge: Number(row.charge),
    timeUnit: row.timeUnit,
  }
  formVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  }
  catch {
    return false
  }

  formLoading.value = true
  try {
    if (isEdit.value) {
      await api.update(formData.value)
      $message.success('修改成功')
    }
    else {
      await api.create(formData.value)
      $message.success('创建成功')
    }
    formVisible.value = false
    loadData()
  }
  catch (error) {
    console.error(error)
    return false
  }
  finally {
    formLoading.value = false
  }
}

function handleDelete(row) {
  if (row.cabinetCount > 0) {
    $message.warning(`该种类下还有 ${row.cabinetCount} 个寄存柜，无法删除`)
    return
  }
  $dialog.warning({
    title: '确认删除',
    content: `确定删除种类「${row.name}」吗？`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(row.kindId)
        $message.success('删除成功')
        loadData()
      }
      catch (error) {
        console.error(error)
      }
    },
  })
}
</script>
