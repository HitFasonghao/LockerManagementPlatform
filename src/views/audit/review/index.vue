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
            <n-image v-if="vendor.licenseImage" :src="vendor.licenseImage" width="120" />
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
          <n-descriptions-item label="API文档地址">
            {{ vendor.apiDocumentUrl || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="回调地址">
            {{ vendor.callbackUrl || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="API版本">
            {{ vendor.apiVersion || '-' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 审核进度 -->
      <n-card v-if="progress.instances && progress.instances.length" class="mt-20" title="审核流程进度">
        <n-timeline>
          <n-timeline-item
            v-for="inst in progress.instances"
            :key="inst.auditInstanceId"
            :type="getTimelineType(inst)"
            :title="inst.nodeName"
          >
            <div class="text-14 opacity-70">
              <span v-if="inst.completedTime">已完成：{{ inst.completedTime }}</span>
              <span v-else-if="inst.startedTime">进行中，开始于：{{ inst.startedTime }}</span>
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
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditReview' })

const route = useRoute()
const vendorId = computed(() => Number(route.params.id))

const loading = ref(false)
const vendor = ref({})
const progress = ref({})
const auditRecords = ref([])

const statusMap = {
  draft: { label: '草稿', type: 'default' },
  pending: { label: '待资质审核', type: 'warning' },
  testing: { label: '技术测试中', type: 'info' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'error' },
  suspended: { label: '已暂停', type: 'warning' },
  banned: { label: '已禁用', type: 'error' },
}

const auditResultMap = { pass: '通过', fail: '不通过', pending: '待审核' }
const testResultMap = { pending: '待测试', testing: '测试中', passed: '通过', failed: '未通过' }

const recordColumns = [
  { title: '轮次', key: 'round', width: 70, align: 'center' },
  { title: '类型', key: 'type', width: 80 },
  {
    title: '资质审核结果',
    key: 'auditResult',
    width: 120,
    render: row =>
      h(NTag, {
        type: { pass: 'success', fail: 'error', pending: 'warning' }[row.auditResult] ?? 'default',
        size: 'small',
      }, { default: () => auditResultMap[row.auditResult] || row.auditResult }),
  },
  { title: '审核意见', key: 'auditNotes', width: 200, ellipsis: { tooltip: true } },
  {
    title: '测试结果',
    key: 'testResult',
    width: 100,
    render: row => row.testResult
      ? h(NTag, {
          type: { passed: 'success', failed: 'error', testing: 'info', pending: 'warning' }[row.testResult] ?? 'default',
          size: 'small',
        }, { default: () => testResultMap[row.testResult] || row.testResult })
      : '-',
  },
  { title: '测试反馈', key: 'testNotes', width: 200, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdTime', width: 170 },
  { title: '完成时间', key: 'completedTime', width: 170 },
]

function getTimelineType(inst) {
  if (inst.completedTime)
    return 'success'
  if (inst.startedTime)
    return 'info'
  return 'default'
}

onMounted(() => {
  loadAll()
})

async function loadAll() {
  loading.value = true
  try {
    const [detailRes, recordsRes, progressRes] = await Promise.all([
      api.getVendorDetail(vendorId.value),
      api.getAuditRecords(vendorId.value),
      api.getAuditProgress(vendorId.value),
    ])
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
