<template>
  <CommonPage back>
    <n-spin :show="loading">
      <!-- 任务信息 -->
      <n-card title="任务信息">
        <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
          <n-descriptions-item label="厂商名称">
            {{ task.companyName || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="审核节点">
            {{ task.nodeName || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="任务状态">
            <NTag :type="taskStatusMap[task.status]?.type ?? 'default'" size="small">
              {{ taskStatusMap[task.status]?.label ?? task.status }}
            </NTag>
          </n-descriptions-item>
          <n-descriptions-item label="优先级">
            <NTag :type="priorityMap[task.priority]?.type ?? 'default'" size="small">
              {{ priorityMap[task.priority]?.label ?? task.priority }}
            </NTag>
          </n-descriptions-item>
          <n-descriptions-item label="截止时间">
            {{ task.dueDate || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="审核意见">
            {{ task.notes || '-' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 厂商资质信息 -->
      <n-card class="mt-20" title="厂商资质信息">
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

      <!-- 技术对接信息（技术测试节点时展示） -->
      <n-card v-if="task.nodeType === 'api_test' || task.nodeType === 'performance'" class="mt-20" title="技术对接信息">
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

      <!-- 审核操作面板 - 根据节点类型显示不同表单 -->
      <n-card v-if="task.status !== 'completed'" class="mt-20" title="审核操作">
        <!-- 资质审核 -->
        <template v-if="task.nodeType === 'qualification'">
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
              <n-button type="primary" :loading="submitting" @click="handleQualificationAudit">
                提交资质审核
              </n-button>
            </n-form-item>
          </n-form>
        </template>

        <!-- API接口测试 -->
        <template v-else-if="task.nodeType === 'api_test'">
          <n-form label-placement="left" :label-width="120">
            <n-form-item label="测试结果">
              <n-radio-group v-model:value="techTestForm.testResult">
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
            <n-form-item>
              <n-button type="primary" :loading="submitting" @click="handleTechTestAudit">
                提交API接口测试
              </n-button>
            </n-form-item>
          </n-form>
        </template>

        <!-- 性能测试 -->
        <template v-else-if="task.nodeType === 'performance'">
          <n-form label-placement="left" :label-width="120">
            <n-form-item label="测试结果">
              <n-radio-group v-model:value="performanceForm.testResult">
                <n-radio value="passed">
                  通过
                </n-radio>
                <n-radio value="failed">
                  未通过
                </n-radio>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="测试反馈">
              <n-input v-model:value="performanceForm.testNotes" type="textarea" :rows="3" placeholder="请输入测试反馈" />
            </n-form-item>
            <n-form-item label="性能测试结果">
              <n-input v-model:value="performanceForm.performanceResultStr" type="textarea" :rows="2" placeholder="JSON格式（可选）" />
            </n-form-item>
            <n-form-item>
              <n-button type="primary" :loading="submitting" @click="handlePerformanceTest">
                提交性能测试
              </n-button>
            </n-form-item>
          </n-form>
        </template>

        <!-- 最终审批（人工审核） -->
        <template v-else-if="task.nodeType === 'manual_review'">
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
              <n-button type="primary" :loading="submitting" @click="handleFinalApproval">
                提交最终审批
              </n-button>
            </n-form-item>
          </n-form>
        </template>
      </n-card>

      <!-- 任务已完成提示 -->
      <n-card v-else class="mt-20" title="审核操作">
        <n-result status="success" title="该任务已完成" description="审核操作已提交，无需再次处理" />
      </n-card>
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'AuditTaskHandle' })

const route = useRoute()
const router = useRouter()
const taskId = computed(() => Number(route.params.taskId))

const loading = ref(false)
const submitting = ref(false)
const task = ref({})
const vendor = ref({})

const qualificationForm = ref({ auditResult: null, auditNotes: '' })
const techTestForm = ref({ testResult: null, testNotes: '', apiValidationResultStr: '' })
const performanceForm = ref({ testResult: null, testNotes: '', performanceResultStr: '' })
const finalForm = ref({ approved: null, notes: '', effectiveFromTs: null, effectiveToTs: null })

const taskStatusMap = {
  pending: { label: '待处理', type: 'warning' },
  in_progress: { label: '处理中', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  overdue: { label: '已超时', type: 'error' },
}
const priorityMap = {
  low: { label: '低', type: 'default' },
  medium: { label: '中', type: 'info' },
  high: { label: '高', type: 'warning' },
  urgent: { label: '紧急', type: 'error' },
}

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const { data: taskData } = await api.getTaskById(taskId.value)
    task.value = taskData || {}

    if (task.value.vendorId) {
      const { data: vendorData } = await api.getVendorDetail(task.value.vendorId)
      vendor.value = vendorData || {}
    }
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
  submitting.value = true
  try {
    await api.qualificationAudit(task.value.vendorId, qualificationForm.value)
    $message.success('资质审核提交成功')
    router.back()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    submitting.value = false
  }
}

async function handleTechTestAudit() {
  if (!techTestForm.value.testResult) {
    $message.warning('请选择测试结果')
    return
  }
  submitting.value = true
  try {
    const submitData = {
      testResult: techTestForm.value.testResult,
      testNotes: techTestForm.value.testNotes,
      apiValidationResult: parseJsonSafe(techTestForm.value.apiValidationResultStr),
    }
    await api.techTestAudit(task.value.vendorId, submitData)
    $message.success('技术测试审核提交成功')
    router.back()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    submitting.value = false
  }
}

async function handlePerformanceTest() {
  if (!performanceForm.value.testResult) {
    $message.warning('请选择测试结果')
    return
  }
  submitting.value = true
  try {
    const submitData = {
      testResult: performanceForm.value.testResult,
      testNotes: performanceForm.value.testNotes,
      performanceResult: parseJsonSafe(performanceForm.value.performanceResultStr),
    }
    await api.performanceTest(task.value.vendorId, submitData)
    $message.success('性能测试提交成功')
    router.back()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    submitting.value = false
  }
}

async function handleFinalApproval() {
  if (finalForm.value.approved === null) {
    $message.warning('请选择审批结果')
    return
  }
  submitting.value = true
  try {
    const submitData = {
      approved: finalForm.value.approved,
      notes: finalForm.value.notes,
      effectiveFrom: finalForm.value.effectiveFromTs ? new Date(finalForm.value.effectiveFromTs).toISOString() : null,
      effectiveTo: finalForm.value.effectiveToTs ? new Date(finalForm.value.effectiveToTs).toISOString() : null,
    }
    await api.finalApproval(task.value.vendorId, submitData)
    $message.success('最终审批提交成功')
    router.back()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    submitting.value = false
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
