<template>
  <CommonPage>
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
      <div class="flex items-center gap-6">
        <span class="white-space-nowrap text-14">审核进度：</span>
        <n-select
          v-model:value="query.result"
          :options="resultOptions"
          placeholder="请选择"
          clearable
          style="width: 160px"
          @update:value="handleSearch"
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

    <n-data-table :columns="columns" :data="recordList" :loading="loading" :row-key="row => row.auditRecordId" />

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
        @update:page="loadRecords"
        @update:page-size="handlePageSizeChange"
      />
    </div>

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

        <!-- 审核信息 -->
        <n-card v-if="auditRecord" class="mt-16" title="审核信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2">
            <n-descriptions-item label="审核轮次">
              第 {{ currentRound }} 轮
            </n-descriptions-item>
            <n-descriptions-item label="创建时间">
              {{ auditRecord.createdTime || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="完成时间">
              {{ auditRecord.completedTime || '-' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- 审核任务情况 -->
        <n-card v-if="auditInstances.length" class="mt-16" title="审核任务情况" size="small">
          <n-data-table
            :columns="taskColumns"
            :data="auditInstances"
            :row-key="row => row.auditNodeId"
            size="small"
          />
        </n-card>
      </template>
    </n-modal>

    <!-- 重新申请对话框 -->
    <n-modal v-model:show="resubmitVisible" preset="card" title="重新申请" style="width: 860px;" :mask-closable="false">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-align="left"
        :label-width="120"
      >
        <n-divider title-placement="left">
          基本信息
        </n-divider>
        <n-grid :cols="2" :x-gap="24">
          <n-form-item-gi label="公司全称" path="companyName">
            <n-input v-model:value="formData.companyName" placeholder="请输入公司全称" />
          </n-form-item-gi>
          <n-form-item-gi label="公司简称" path="shortName">
            <n-input v-model:value="formData.shortName" placeholder="请输入公司简称" />
          </n-form-item-gi>
          <n-form-item-gi label="营业执照号" path="licenseNo">
            <n-input v-model:value="formData.licenseNo" placeholder="请输入营业执照号" />
          </n-form-item-gi>
          <n-form-item-gi label="营业执照照片" path="licenseImage">
            <NSpace vertical>
              <n-upload
                v-model:file-list="licenseFileList"
                :max="1"
                accept="image/*"
                :custom-request="handleUploadLicense"
                list-type="image-card"
                @remove="handleRemoveLicense"
              />
              <n-text v-if="formData.licenseImage" depth="3" style="font-size: 12px;">
                已上传
              </n-text>
            </NSpace>
          </n-form-item-gi>
          <n-form-item-gi label="法定代表人" path="legalPerson">
            <n-input v-model:value="formData.legalPerson" placeholder="请输入法定代表人" />
          </n-form-item-gi>
          <n-form-item-gi label="法人身份证号" path="legalPersonId">
            <n-input v-model:value="formData.legalPersonId" placeholder="请输入法人身份证号" />
          </n-form-item-gi>
        </n-grid>

        <n-divider title-placement="left">
          联系信息
        </n-divider>
        <n-grid :cols="2" :x-gap="24">
          <n-form-item-gi label="联系人姓名" path="contactPerson">
            <n-input v-model:value="formData.contactPerson" placeholder="请输入联系人姓名" />
          </n-form-item-gi>
          <n-form-item-gi label="联系人电话" path="contactPhone">
            <n-input v-model:value="formData.contactPhone" placeholder="请输入联系人电话" />
          </n-form-item-gi>
          <n-form-item-gi label="联系人邮箱" path="contactEmail">
            <n-input v-model:value="formData.contactEmail" placeholder="请输入联系人邮箱" />
          </n-form-item-gi>
          <n-form-item-gi label="公司地址" path="companyAddress">
            <n-input v-model:value="formData.companyAddress" placeholder="请输入公司地址" />
          </n-form-item-gi>
          <n-form-item-gi label="官网" path="website">
            <n-input v-model:value="formData.website" placeholder="请输入公司官网" />
          </n-form-item-gi>
        </n-grid>

        <n-divider title-placement="left">
          公司详情
        </n-divider>
        <n-form-item label="公司介绍" path="introduction">
          <n-input v-model:value="formData.introduction" type="textarea" :rows="3" placeholder="请输入公司介绍" />
        </n-form-item>
        <n-form-item label="经营范围" path="businessScope">
          <n-input v-model:value="formData.businessScope" type="textarea" :rows="3" placeholder="请输入经营范围" />
        </n-form-item>

        <n-divider title-placement="left">
          技术对接信息
        </n-divider>
        <n-grid :cols="2" :x-gap="24">
          <n-form-item-gi label="API接口地址" path="apiEndpoint">
            <n-input v-model:value="formData.apiEndpoint" placeholder="请输入API接口地址" />
          </n-form-item-gi>
          <n-form-item-gi label="厂商系统访问Token" path="vendorAccessToken">
            <n-input v-model:value="formData.vendorAccessToken" placeholder="请输入厂商系统访问Token" />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <template #action>
        <NSpace justify="end">
          <NButton @click="resubmitVisible = false">
            取消
          </NButton>
          <NButton type="primary" :loading="submitting" @click="handleResubmit">
            提交审核
          </NButton>
        </NSpace>
      </template>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { NButton, NSpace, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'VendorProgress' })

const loading = ref(false)
const recordList = ref([])
const allVendors = ref([])
const total = ref(0)
const query = ref({
  companyName: '',
  result: null,
  pageNum: 1,
  pageSize: 10,
})
const detailVisible = ref(false)
const currentVendor = ref(null)
const auditRecord = ref(null)
const currentRound = ref(0)
const auditInstances = ref([])

const resubmitVisible = ref(false)
const resubmitVendorId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const licenseFileList = ref([])

function emptyForm() {
  return {
    companyName: '',
    shortName: '',
    licenseNo: '',
    licenseImage: '',
    legalPerson: '',
    legalPersonId: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    companyAddress: '',
    website: '',
    introduction: '',
    businessScope: '',
    apiEndpoint: '',
    vendorAccessToken: '',
  }
}
const formData = ref(emptyForm())

const req = (msg, trigger = ['input', 'blur']) => ({ required: true, message: msg, trigger })
const formRules = {
  companyName: req('请输入公司全称'),
  shortName: req('请输入公司简称'),
  licenseNo: req('请输入营业执照号'),
  licenseImage: req('请上传营业执照照片'),
  legalPerson: req('请输入法定代表人'),
  legalPersonId: req('请输入法人身份证号'),
  contactPerson: req('请输入联系人姓名'),
  contactPhone: req('请输入联系人电话'),
  contactEmail: req('请输入联系人邮箱'),
  companyAddress: req('请输入公司地址'),
  website: req('请输入公司官网'),
  introduction: req('请输入公司介绍'),
  businessScope: req('请输入经营范围'),
  apiEndpoint: req('请输入API接口地址'),
  vendorAccessToken: req('请输入厂商系统访问Token'),
}

const resultMap = {
  not_started: { label: '未开始', type: 'default' },
  pending_qualification: { label: '待资质审核', type: 'warning' },
  qualification_failed: { label: '资质审核失败', type: 'error' },
  pending_functional_test: { label: '待功能测试', type: 'info' },
  functional_test_failed: { label: '功能测试失败', type: 'error' },
  pending_performance_test: { label: '待性能测试', type: 'info' },
  performance_test_failed: { label: '性能测试失败', type: 'error' },
  pending_final_approval: { label: '待最终审批', type: 'warning' },
  final_approval_rejected: { label: '最终审批驳回', type: 'error' },
  approved: { label: '审核通过', type: 'success' },
}

const resultOptions = Object.entries(resultMap).map(([value, { label }]) => ({ label, value }))

const columns = [
  { title: '公司名称', key: 'companyName', ellipsis: { tooltip: true }, width: 200 },
  { title: '简称', key: 'shortName', width: 120 },
  {
    title: '审核进度',
    key: 'result',
    width: 140,
    render: row => h(NTag, {
      type: resultMap[row.result]?.type ?? 'default',
      size: 'small',
    }, { default: () => resultMap[row.result]?.label ?? row.result ?? '未知' }),
  },
  { title: '审核轮次', key: 'currentRound', width: 90, align: 'center' },
  { title: '提交时间', key: 'createdTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'right',
    render(row) {
      const buttons = [
        h(NButton, {
          size: 'small',
          type: 'primary',
          secondary: true,
          onClick: () => handleViewDetail(row),
        }, {
          default: () => '查看详情',
          icon: () => h('i', { class: 'i-material-symbols:visibility-outline text-14' }),
        }),
      ]
      if (row.canResubmit) {
        buttons.push(
          h(NButton, {
            size: 'small',
            type: 'warning',
            secondary: true,
            onClick: () => handleOpenResubmit(row),
          }, {
            default: () => '重新申请',
            icon: () => h('i', { class: 'i-material-symbols:refresh text-14' }),
          }),
        )
      }
      return h(NSpace, { size: 'small' }, { default: () => buttons })
    },
  },
]

const taskColumns = [
  { title: '审核节点', key: 'nodeName', width: 120 },
  { title: '审核管理员', key: 'adminName', width: 120 },
  {
    title: '结果',
    key: 'passed',
    width: 80,
    align: 'center',
    render: row => row.passed == null
      ? '-'
      : h(NTag, { type: row.passed ? 'success' : 'error', size: 'small' }, { default: () => row.passed ? '通过' : '未通过' }),
  },
  { title: '审核意见', key: 'notes', ellipsis: { tooltip: true } },
]

onMounted(() => loadRecords())

async function loadRecords() {
  loading.value = true
  try {
    const params = { ...query.value }
    if (!params.companyName) delete params.companyName
    if (!params.result) delete params.result

    const [recordsRes, vendorsRes] = await Promise.all([
      api.getMyAuditRecords(params),
      api.getMyVendors(),
    ])
    recordList.value = recordsRes.data?.list || []
    total.value = recordsRes.data?.total || 0
    allVendors.value = vendorsRes.data || []
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
  loadRecords()
}

function handleReset() {
  query.value = { companyName: '', result: null, pageNum: 1, pageSize: 10 }
  loadRecords()
}

function handlePageSizeChange(size) {
  query.value.pageSize = size
  query.value.pageNum = 1
  loadRecords()
}

async function handleViewDetail(row) {
  currentVendor.value = null
  auditRecord.value = null
  currentRound.value = row.currentRound || 0
  auditInstances.value = []
  detailVisible.value = true

  try {
    const [snapshotRes, tasksRes] = await Promise.all([
      api.getVendorSnapshot(row.vendorId, row.auditRecordId),
      api.getTasksByRecord(row.auditRecordId),
    ])
    currentVendor.value = snapshotRes.data || {}
    auditRecord.value = row
    auditInstances.value = tasksRes.data || []
  }
  catch (error) {
    console.error(error)
  }
}

function handleOpenResubmit(row) {
  resubmitVendorId.value = row.vendorId
  // 从厂商列表中获取完整信息来填充表单
  const vendor = allVendors.value.find(v => v.vendorId === row.vendorId) || row
  const data = emptyForm()
  Object.keys(data).forEach((key) => {
    if (vendor[key] != null)
      data[key] = vendor[key]
  })
  formData.value = data
  licenseFileList.value = vendor.licenseImage
    ? [{ id: 'license', name: '营业执照', status: 'finished', url: vendor.licenseImage }]
    : []
  resubmitVisible.value = true
}

async function handleResubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    await api.resubmit(resubmitVendorId.value, formData.value)
    $message.success('重新提交成功，等待审核')
    resubmitVisible.value = false
    await loadRecords()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    submitting.value = false
  }
}

async function handleUploadLicense({ file, onFinish, onError }) {
  try {
    const oldUrl = formData.value.licenseImage || null
    const { data } = await api.uploadLicense(file.file, oldUrl)
    if (data) {
      formData.value.licenseImage = data
      file.url = data
      file.status = 'finished'
      onFinish()
    }
    else { onError() }
  }
  catch (error) {
    console.error(error)
    onError()
  }
}

function handleRemoveLicense() {
  formData.value.licenseImage = ''
  licenseFileList.value = []
}
</script>
