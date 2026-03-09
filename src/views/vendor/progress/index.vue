<template>
  <CommonPage>
    <n-data-table :columns="columns" :data="rejectedVendors" :loading="loading" :row-key="row => row.vendorId" />

    <!-- 查看详情对话框 -->
    <n-modal v-model:show="detailVisible" preset="card" title="审核记录详情" style="width: 800px;">
      <template v-if="currentVendor">
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
          <n-descriptions-item label="联系人">
            {{ currentVendor.contactPerson || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="联系电话">
            {{ currentVendor.contactPhone || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="公司地址" :span="2">
            {{ currentVendor.companyAddress || '-' }}
          </n-descriptions-item>
        </n-descriptions>

        <!-- 审核意见 -->
        <n-card v-if="auditRecord" class="mt-16" title="审核意见" size="small">
          <n-descriptions label-placement="left" bordered :column="2">
            <n-descriptions-item label="审核轮次">
              第 {{ currentRound }} 轮
            </n-descriptions-item>
            <n-descriptions-item label="审核结果">
              <NTag type="error">
                不通过
              </NTag>
            </n-descriptions-item>
            <n-descriptions-item label="资质审核意见" :span="2">
              {{ auditRecord.auditNotes || '暂无' }}
            </n-descriptions-item>
            <n-descriptions-item label="技术测试结果">
              {{ testResultMap[auditRecord.testResult] || '暂无' }}
            </n-descriptions-item>
            <n-descriptions-item label="测试反馈">
              {{ auditRecord.testNotes || '暂无' }}
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

defineOptions({ name: 'VendorProgress' })

const loading = ref(false)
const allVendors = ref([])
const detailVisible = ref(false)
const currentVendor = ref(null)
const auditRecord = ref(null)
const currentRound = ref(0)

const testResultMap = { pending: '待测试', testing: '测试中', passed: '通过', failed: '未通过' }

const rejectedVendors = computed(() =>
  allVendors.value.filter(v => v.status === 'rejected'),
)

const columns = [
  { title: '公司名称', key: 'companyName', ellipsis: { tooltip: true } },
  { title: '公司简称', key: 'shortName', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: () => h(NTag, { type: 'error', size: 'small' }, { default: () => '已驳回' }),
  },
  { title: '提交时间', key: 'submittedTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: row => h(
      NButton,
      { size: 'small', type: 'primary', text: true, onClick: () => handleViewDetail(row) },
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

async function handleViewDetail(row) {
  currentVendor.value = row
  auditRecord.value = null
  currentRound.value = 0
  detailVisible.value = true

  try {
    const { data } = await api.getAuditProgress(row.vendorId)
    if (data) {
      currentRound.value = data.currentRound || 0
      auditRecord.value = data.auditRecord || null
    }
  }
  catch (error) {
    console.error(error)
  }
}
</script>
