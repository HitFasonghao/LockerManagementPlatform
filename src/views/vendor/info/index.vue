<template>
  <CommonPage>
    <n-data-table :columns="columns" :data="approvedVendors" :loading="loading" :row-key="row => row.vendorId" />

    <!-- 查看厂商信息对话框 -->
    <n-modal v-model:show="detailVisible" preset="card" title="厂商资质信息" style="width: 800px;">
      <template v-if="currentVendor">
        <n-card title="基本信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
            <n-descriptions-item label="厂商编码">
              {{ currentVendor.vendorCode || '-' }}
            </n-descriptions-item>
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
            <n-descriptions-item label="API文档地址">
              {{ currentVendor.apiDocumentUrl || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="回调地址">
              {{ currentVendor.callbackUrl || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="API版本">
              {{ currentVendor.apiVersion || '-' }}
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
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'VendorInfo' })

const loading = ref(false)
const allVendors = ref([])
const detailVisible = ref(false)
const currentVendor = ref(null)

const approvedVendors = computed(() =>
  allVendors.value.filter(v => v.status === 'approved'),
)

const columns = [
  { title: '厂商编码', key: 'vendorCode', width: 140 },
  { title: '公司名称', key: 'companyName', ellipsis: { tooltip: true } },
  { title: '公司简称', key: 'shortName', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: () => h(NTag, { type: 'success', size: 'small' }, { default: () => '已通过' }),
  },
  { title: '审批时间', key: 'approvedTime', width: 180 },
  { title: '生效日期', key: 'effectiveFrom', width: 140 },
  { title: '失效日期', key: 'effectiveTo', width: 140 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: row => h(
      NButton,
      { size: 'small', type: 'primary', text: true, onClick: () => handleView(row) },
      { default: () => '查看详情' },
    ),
  },
]

onMounted(() => loadVendors())

async function loadVendors() {
  loading.value = true
  try {
    const { data } = await api.getMyVendors()
    allVendors.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

function handleView(row) {
  currentVendor.value = row
  detailVisible.value = true
}
</script>
