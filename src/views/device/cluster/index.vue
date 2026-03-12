<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="openCreateModal">
        <i class="i-fe:plus mr-4 text-14" />
        添加柜群
      </NButton>
    </template>

    <!-- 查询条件 -->
    <div class="mb-16 flex items-center gap-16">
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">柜群名称：</span>
        <n-input
          v-model:value="query.name"
          placeholder="请输入"
          clearable
          style="width: 140px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">柜群地址：</span>
        <n-input
          v-model:value="query.location"
          placeholder="请输入"
          clearable
          style="width: 160px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">状态：</span>
        <n-select
          v-model:value="query.status"
          :options="statusOptions"
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

    <!-- 卡片列表 -->
    <n-spin :show="loading">
      <div v-if="clusterList.length" class="grid grid-cols-2 gap-16 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
        <div
          v-for="item in clusterList"
          :key="item.clusterId"
          class="cursor-pointer border border-gray-200 rounded-8 border-solid p-16 transition-all-300 dark:border-gray-700 hover:shadow-md"
          @click="goDetail(item.clusterId)"
        >
          <div class="mb-8 truncate text-16 font-500">
            {{ item.name }}
          </div>
          <div class="mb-6 truncate text-13 opacity-70">
            <i class="i-fe:map-pin mr-4 text-12" />
            {{ item.location }}
          </div>
          <div class="flex items-center text-13 opacity-70">
            <span class="mr-4">状态：</span>
            <NTag :type="item.status === 'using' ? 'success' : 'error'" size="small">
              {{ item.status === 'using' ? '使用中' : '禁用' }}
            </NTag>
          </div>
        </div>
      </div>
      <n-empty v-else description="暂无数据" />
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
        :page-sizes="[12, 24, 36]"
        @update:page="loadData"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <!-- 添加柜群弹框 -->
    <n-modal v-model:show="createVisible" preset="dialog" title="添加柜群" positive-text="提交" negative-text="取消" :loading="createLoading" @positive-click="handleCreate">
      <n-form ref="formRef" :model="createForm" :rules="createRules" label-placement="left" :label-width="80" class="pt-8">
        <n-form-item label="柜群名称" path="name">
          <n-input v-model:value="createForm.name" placeholder="请输入柜群名称" />
        </n-form-item>
        <n-form-item label="柜群地址" path="location">
          <n-input v-model:value="createForm.location" placeholder="请输入柜群地址" />
        </n-form-item>
        <n-form-item label="经度" path="longitude">
          <n-input-number v-model:value="createForm.longitude" :precision="6" placeholder="请输入经度" class="w-full" />
        </n-form-item>
        <n-form-item label="纬度" path="dimension">
          <n-input-number v-model:value="createForm.dimension" :precision="6" placeholder="请输入纬度" class="w-full" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="createForm.description" type="textarea" placeholder="请输入描述" :rows="3" />
        </n-form-item>
      </n-form>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'DeviceCluster' })

const router = useRouter()
const loading = ref(false)
const createLoading = ref(false)
const createVisible = ref(false)
const clusterList = ref([])
const total = ref(0)
const formRef = ref(null)

const query = ref({
  name: '',
  location: '',
  status: null,
  pageNum: 1,
  pageSize: 12,
})

const createForm = ref({
  name: '',
  location: '',
  longitude: null,
  dimension: null,
  description: '',
})

const createRules = {
  name: { required: true, message: '请输入柜群名称', trigger: 'blur' },
  location: { required: true, message: '请输入柜群地址', trigger: 'blur' },
  longitude: { required: true, type: 'number', message: '请输入经度', trigger: 'blur' },
  dimension: { required: true, type: 'number', message: '请输入纬度', trigger: 'blur' },
  description: { required: true, message: '请输入描述', trigger: 'blur' },
}

const statusOptions = [
  { label: '使用中', value: 'using' },
  { label: '禁用', value: 'forbidden' },
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
    if (!params.location)
      delete params.location
    if (!params.status)
      delete params.status

    const { data } = await api.list(params)
    clusterList.value = data?.list || []
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
  createForm.value = { name: '', location: '', longitude: null, dimension: null, description: '' }
  createVisible.value = true
}

async function handleCreate() {
  try {
    await formRef.value?.validate()
  }
  catch {
    return false
  }

  createLoading.value = true
  try {
    await api.create(createForm.value)
    $message.success('添加柜群成功')
    createVisible.value = false
    loadData()
  }
  catch (error) {
    console.error(error)
    return false
  }
  finally {
    createLoading.value = false
  }
}

function goDetail(clusterId) {
  router.push(`/device/cluster/detail/${clusterId}`)
}
</script>
