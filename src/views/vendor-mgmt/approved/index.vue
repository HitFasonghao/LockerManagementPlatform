<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadData">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        刷新
      </NButton>
    </template>

    <!-- 查询条件 -->
    <div class="mb-16 flex items-center gap-16">
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">公司名称：</span>
        <n-input
          v-model:value="query.companyName"
          placeholder="请输入"
          clearable
          style="width: 180px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
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

    <n-data-table :columns="columns" :data="vendorList" :loading="loading" :row-key="row => row.vendorId" :scroll-x="1200" />

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

    <!-- 厂商详情对话框 -->
    <n-modal v-model:show="detailVisible" preset="card" title="厂商信息" style="width: 800px;">
      <template v-if="currentVendor">
        <n-card title="基本信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
            <n-descriptions-item label="公司全称">
              {{ currentVendor.companyName }}
            </n-descriptions-item>
            <n-descriptions-item label="公司简称">
              {{ currentVendor.shortName || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="营业执照号">
              {{ currentVendor.licenseNo || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="法定代表人">
              {{ currentVendor.legalPerson || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="法人身份证号">
              {{ currentVendor.legalPersonId || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="联系人">
              {{ currentVendor.contactPerson || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="联系电话">
              {{ currentVendor.contactPhone || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="联系邮箱">
              {{ currentVendor.contactEmail || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="公司地址">
              {{ currentVendor.companyAddress || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="官网" :span="2">
              {{ currentVendor.website || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="公司介绍" :span="2">
              {{ currentVendor.introduction || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="经营范围" :span="2">
              {{ currentVendor.businessScope || '-' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card class="mt-16" title="技术对接信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
            <n-descriptions-item label="API接口地址">
              {{ currentVendor.apiEndpoint || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="厂商系统访问Token">
              {{ currentVendor.vendorAccessToken || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="平台访问Token">
              {{ currentVendor.platformAccessToken || '-' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card class="mt-16" title="审批信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
            <n-descriptions-item label="审批时间">
              {{ currentVendor.approvedTime || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="生效日期">
              {{ currentVendor.effectiveFrom || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="失效日期">
              {{ currentVendor.effectiveTo || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="创建时间">
              {{ currentVendor.createdTime || '-' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </template>
    </n-modal>

    <!-- 操作确认对话框 -->
    <n-modal v-model:show="operationVisible" preset="dialog" :title="operationTitle" positive-text="确认" negative-text="取消" :loading="operationLoading" @positive-click="handleOperation">
      <n-form label-placement="left" :label-width="80">
        <n-form-item label="厂商">
          {{ operationVendor?.companyName }}
        </n-form-item>
        <n-form-item label="操作说明">
          <n-input v-model:value="operationNotes" type="textarea" placeholder="请输入操作说明（选填）" :rows="3" />
        </n-form-item>
      </n-form>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { NButton, NSpace, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'VendorMgmtApproved' })

const loading = ref(false)
const vendorList = ref([])
const total = ref(0)
const query = ref({
  companyName: '',
  pageNum: 1,
  pageSize: 10,
})
const detailVisible = ref(false)
const currentVendor = ref(null)

const operationVisible = ref(false)
const operationLoading = ref(false)
const operationTitle = ref('')
const operationVendor = ref(null)
const operationNotes = ref('')
const operationType = ref('')

const columns = [
  { title: '公司名称', key: 'companyName', width: 200, ellipsis: { tooltip: true } },
  { title: '简称', key: 'shortName', width: 100 },
  { title: '联系人', key: 'contactPerson', width: 100 },
  { title: '联系电话', key: 'contactPhone', width: 130 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: row => h(NTag, { type: 'success', size: 'small' }, { default: () => '正常' }),
  },
  { title: '提交时间', key: 'submittedTime', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    align: 'right',
    fixed: 'right',
    render(row) {
      return h(NSpace, { justify: 'end' }, {
        default: () => [
          h(NButton, { size: 'small', type: 'primary', secondary: true, onClick: () => handleView(row) }, {
            default: () => '查看详情',
            icon: () => h('i', { class: 'i-material-symbols:visibility-outline text-14' }),
          }),
          h(NButton, { size: 'small', type: 'warning', secondary: true, onClick: () => openOperation(row, 'suspend') }, {
            default: () => '暂停',
            icon: () => h('i', { class: 'i-material-symbols:pause-circle-outline text-14' }),
          }),
          h(NButton, { size: 'small', type: 'error', secondary: true, onClick: () => openOperation(row, 'ban') }, {
            default: () => '封禁',
            icon: () => h('i', { class: 'i-material-symbols:block text-14' }),
          }),
        ],
      })
    },
  },
]

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const params = { ...query.value }
    if (!params.companyName) delete params.companyName
    const { data } = await api.getApprovedVendors(params)
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
  query.value = { companyName: '', pageNum: 1, pageSize: 10 }
  loadData()
}

function handlePageSizeChange(size) {
  query.value.pageSize = size
  query.value.pageNum = 1
  loadData()
}

async function handleView(row) {
  try {
    const { data } = await api.getVendorDetail(row.vendorId)
    currentVendor.value = data
    detailVisible.value = true
  }
  catch (error) {
    console.error(error)
  }
}

function openOperation(row, type) {
  operationVendor.value = row
  operationType.value = type
  operationNotes.value = ''
  operationTitle.value = type === 'suspend' ? '暂停合作' : '封禁厂商'
  operationVisible.value = true
}

async function handleOperation() {
  operationLoading.value = true
  try {
    const vendorId = operationVendor.value.vendorId
    const payload = { notes: operationNotes.value || null }
    if (operationType.value === 'suspend') {
      await api.suspendVendor(vendorId, payload)
      $message.success('已暂停合作')
    }
    else {
      await api.banVendor(vendorId, payload)
      $message.success('已封禁厂商')
    }
    operationVisible.value = false
    await loadData()
  }
  catch (error) {
    console.error(error)
    return false
  }
  finally {
    operationLoading.value = false
  }
}
</script>
