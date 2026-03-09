<template>
  <CommonPage back>
    <n-spin :show="loading">
      <!-- 厂商基本信息 -->
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

      <!-- 审核操作面板 -->
      <n-card class="mt-20" title="审核操作">
        <n-tabs type="line">
          <!-- 资质审核 Tab -->
          <n-tab-pane name="qualification" tab="资质审核">
            <n-form label-placement="left" :label-width="100">
              <n-form-item label="审核结果">
                <n-radio-group v-model:value="qualificationForm.auditResult">
                  <n-radio value="pass">
                    通过
                  </n-radio>
                  <n-radio value="fail">
                    不通过
                  </n-radio>
                </n-radio-group>
              </n-form-item>
              <n-form-item label="审核意见">
                <n-input v-model:value="qualificationForm.auditNotes" type="textarea" :rows="3" placeholder="请输入审核意见" />
              </n-form-item>
              <n-form-item>
                <n-button
                  type="primary"
                  :loading="qualSubmitting"
                  :disabled="vendor.status !== 'pending'"
                  @click="handleQualificationAudit"
                >
                  提交资质审核
                </n-button>
              </n-form-item>
            </n-form>
          </n-tab-pane>

          <!-- 技术测试审核 Tab -->
          <n-tab-pane name="techTest" tab="技术测试审核">
            <n-form label-placement="left" :label-width="100">
              <n-form-item label="测试结果">
                <n-radio-group v-model:value="techTestForm.testResult">
                  <n-radio value="testing">
                    开始测试
                  </n-radio>
                  <n-radio value="passed">
                    通过
                  </n-radio>
                  <n-radio value="failed">
                    未通过
                  </n-radio>
                </n-radio-group>
              </n-form-item>
              <n-form-item label="测试反馈">
                <n-input v-model:value="techTestForm.testNotes" type="textarea" :rows="3" placeholder="请输入测试反馈" />
              </n-form-item>
              <n-form-item label="API检验结果">
                <n-input v-model:value="techTestForm.apiValidationResultStr" type="textarea" :rows="2" placeholder="JSON格式（可选）" />
              </n-form-item>
              <n-form-item label="性能测试结果">
                <n-input v-model:value="techTestForm.performanceResultStr" type="textarea" :rows="2" placeholder="JSON格式（可选）" />
              </n-form-item>
              <n-form-item>
                <n-button
                  type="primary"
                  :loading="techSubmitting"
                  :disabled="vendor.status !== 'testing'"
                  @click="handleTechTestAudit"
                >
                  提交技术测试审核
                </n-button>
              </n-form-item>
            </n-form>
          </n-tab-pane>

          <!-- 最终审批 Tab -->
          <n-tab-pane name="final" tab="最终审批">
            <n-form label-placement="left" :label-width="100">
              <n-form-item label="审批结果">
                <n-radio-group v-model:value="finalForm.approved">
                  <n-radio :value="true">
                    批准
                  </n-radio>
                  <n-radio :value="false">
                    驳回
                  </n-radio>
                </n-radio-group>
              </n-form-item>
              <n-form-item label="审批意见">
                <n-input v-model:value="finalForm.notes" type="textarea" :rows="3" placeholder="请输入审批意见" />
              </n-form-item>
              <n-form-item label="生效日期">
                <n-date-picker v-model:value="finalForm.effectiveFromTs" type="datetime" clearable class="w-full" />
              </n-form-item>
              <n-form-item label="失效日期">
                <n-date-picker v-model:value="finalForm.effectiveToTs" type="datetime" clearable class="w-full" />
              </n-form-item>
              <n-form-item>
                <n-button
                  type="primary"
                  :loading="finalSubmitting"
                  :disabled="vendor.status !== 'testing'"
                  @click="handleFinalApproval"
                >
                  提交最终审批
                </n-button>
              </n-form-item>
            </n-form>
          </n-tab-pane>
        </n-tabs>
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
const qualSubmitting = ref(false)
const techSubmitting = ref(false)
const finalSubmitting = ref(false)

const vendor = ref({})
const progress = ref({})
const auditRecords = ref([])

const qualificationForm = ref({ auditResult: null, auditNotes: '' })
const techTestForm = ref({ testResult: null, testNotes: '', apiValidationResultStr: '', performanceResultStr: '' })
const finalForm = ref({ approved: null, notes: '', effectiveFromTs: null, effectiveToTs: null })

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

async function handleQualificationAudit() {
  if (!qualificationForm.value.auditResult) {
    $message.warning('请选择审核结果')
    return
  }
  qualSubmitting.value = true
  try {
    await api.qualificationAudit(vendorId.value, qualificationForm.value)
    $message.success('资质审核提交成功')
    await loadAll()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    qualSubmitting.value = false
  }
}

async function handleTechTestAudit() {
  if (!techTestForm.value.testResult) {
    $message.warning('请选择测试结果')
    return
  }
  techSubmitting.value = true
  try {
    const submitData = {
      testResult: techTestForm.value.testResult,
      testNotes: techTestForm.value.testNotes,
      apiValidationResult: parseJsonSafe(techTestForm.value.apiValidationResultStr),
      performanceResult: parseJsonSafe(techTestForm.value.performanceResultStr),
    }
    await api.techTestAudit(vendorId.value, submitData)
    $message.success('技术测试审核提交成功')
    await loadAll()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    techSubmitting.value = false
  }
}

async function handleFinalApproval() {
  if (finalForm.value.approved === null) {
    $message.warning('请选择审批结果')
    return
  }
  finalSubmitting.value = true
  try {
    const submitData = {
      approved: finalForm.value.approved,
      notes: finalForm.value.notes,
      effectiveFrom: finalForm.value.effectiveFromTs ? new Date(finalForm.value.effectiveFromTs).toISOString() : null,
      effectiveTo: finalForm.value.effectiveToTs ? new Date(finalForm.value.effectiveToTs).toISOString() : null,
    }
    await api.finalApproval(vendorId.value, submitData)
    $message.success('最终审批提交成功')
    await loadAll()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    finalSubmitting.value = false
  }
}

function parseJsonSafe(str) {
  if (!str || !str.trim())
    return null
  try {
    return JSON.parse(str)
  }
  catch {
    return str
  }
}
</script>
