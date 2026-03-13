<template>
  <CommonPage back>
    <n-spin :show="loading">
      <!-- 厂商资质信息 -->
      <n-card title="厂商资质信息">
        <template #header-extra>
          <NTag v-if="vendor.status" :type="statusMap[vendor.status]?.type ?? 'default'">
            {{ statusMap[vendor.status]?.label ?? vendor.status }}
          </NTag>
        </template>

        <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '140px' }">
          <n-descriptions-item label="公司全称">
            {{ vendor.companyName || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="公司简称">
            {{ vendor.shortName || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="营业执照号">
            {{ vendor.licenseNo || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="营业执照照片">
            <NButton v-if="vendor.licenseImage" size="small" @click="licenseVisible = true">
              查看营业执照
            </NButton>
            <span v-else>-</span>
          </n-descriptions-item>
          <n-descriptions-item label="法定代表人">
            {{ vendor.legalPerson || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="法人身份证号">
            {{ vendor.legalPersonId || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="联系人">
            {{ vendor.contactPerson || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="联系电话">
            {{ vendor.contactPhone || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="联系邮箱">
            {{ vendor.contactEmail || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="公司地址">
            {{ vendor.companyAddress || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="官网" :span="2">
            {{ vendor.website || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="公司介绍" :span="2">
            {{ vendor.introduction || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="经营范围" :span="2">
            {{ vendor.businessScope || '-' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 技术对接信息 -->
      <n-card class="mt-20" title="技术对接信息">
        <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '140px' }">
          <n-descriptions-item label="API接口地址">
            {{ vendor.apiEndpoint || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="厂商系统访问Token">
            {{ vendor.vendorAccessToken || '-' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 审核进度 -->
      <n-card v-if="progress.instances && progress.instances.length" class="mt-20" title="审核流程进度">
        <n-timeline>
          <n-timeline-item
            v-for="inst in progress.instances"
            :key="inst.auditTaskId"
            :type="getTimelineType(inst)"
            :title="inst.nodeName"
          >
            <div class="text-14 opacity-70">
              <span v-if="inst.completedTime">
                {{ inst.passed ? '通过' : '未通过' }}：{{ inst.completedTime }}
              </span>
              <span v-else-if="inst.auditTaskId">等待处理</span>
              <span v-else>等待中</span>
            </div>
          </n-timeline-item>
        </n-timeline>
      </n-card>

      <!-- 历史审核记录 -->
      <n-card v-if="auditRecords.length" class="mt-20" title="历史审核记录">
        <n-data-table
          :columns="recordColumns"
          :data="auditRecords"
          :row-key="row => row.auditRecordId"
        />
      </n-card>
      <!-- 营业执照弹窗 -->
      <n-modal v-model:show="licenseVisible" preset="card" title="营业执照" style="width: 600px;">
        <n-image :src="vendor.licenseImage" width="100%" />
      </n-modal>
      <!-- 审核任务详情弹窗 -->
      <n-modal v-model:show="taskDialogVisible" preset="card" title="审核任务详情" style="width: 700px;">
        <n-spin :show="taskLoading">
          <n-data-table
            :columns="taskColumns"
            :data="taskList"
            :row-key="row => row.auditTaskId"
          />
        </n-spin>
      </n-modal>
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditReview' })

const route = useRoute()
const vendorId = computed(() => Number(route.params.id))
const recordId = computed(() => route.query.recordId ? Number(route.query.recordId) : undefined)

const loading = ref(false)
const vendor = ref({})
const progress = ref({})
const auditRecords = ref([])
const licenseVisible = ref(false)
const taskDialogVisible = ref(false)
const taskLoading = ref(false)
const taskList = ref([])

const statusMap = {
  draft: { label: '草稿', type: 'default' },
  pending: { label: '待资质审核', type: 'warning' },
  testing: { label: '技术测试中', type: 'info' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'error' },
  suspended: { label: '已暂停', type: 'warning' },
  banned: { label: '已禁用', type: 'error' },
}

const recordColumns = [
  { title: '轮次', key: 'round', width: 70, align: 'center' },
  { title: '类型', key: 'type', width: 80 },
  { title: '审核管理员', key: 'adminName', width: 120 },
  { title: '创建时间', key: 'createdTime', width: 170 },
  { title: '完成时间', key: 'completedTime', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render: row => h(
      NButton,
      { size: 'small', type: 'primary', secondary: true, onClick: () => handleViewTasks(row) },
      { default: () => '查看任务' },
    ),
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
  { title: '完成时间', key: 'completedTime', width: 170 },
]

async function handleViewTasks(record) {
  taskDialogVisible.value = true
  taskLoading.value = true
  taskList.value = []
  try {
    const { data } = await api.getTasksByRecord(record.auditRecordId)
    taskList.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    taskLoading.value = false
  }
}

function getTimelineType(inst) {
  if (inst.completedTime)
    return inst.passed ? 'success' : 'error'
  if (inst.auditTaskId)
    return 'info'
  return 'default'
}

onMounted(() => {
  loadAll()
})

async function loadAll() {
  loading.value = true
  try {
    const [detailRes, recordsRes] = await Promise.all([
      api.getVendorDetail(vendorId.value, recordId.value),
      api.getAuditRecords(vendorId.value),
    ])
    // 审核进度需要recordId，优先用路由传入的，否则取最新记录的
    const progressRecordId = recordId.value || recordsRes.data?.[0]?.auditRecordId
    const progressRes = progressRecordId ? await api.getAuditProgress(progressRecordId) : { data: {} }
    vendor.value = detailRes.data || {}
    auditRecords.value = recordsRes.data || []
    progress.value = progressRes.data || {}
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}
</script>
