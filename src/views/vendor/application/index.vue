<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleNewApplication">
        <i class="i-material-symbols:add mr-4 text-18" />
        申请入驻
      </NButton>
    </template>

    <n-data-table :columns="columns" :data="activeVendors" :loading="loading" :row-key="row => row.vendorId" />

    <!-- 申请/编辑/查看 对话框 -->
    <n-modal v-model:show="modalVisible" preset="card" :title="modalTitle" style="width: 860px;" :mask-closable="false">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-align="left"
        :label-width="120"
        :disabled="!modalEditable"
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
                :disabled="!modalEditable"
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
          <n-form-item-gi label="API文档地址" path="apiDocumentUrl">
            <n-input v-model:value="formData.apiDocumentUrl" placeholder="请输入API文档地址" />
          </n-form-item-gi>
          <n-form-item-gi label="回调地址" path="callbackUrl">
            <n-input v-model:value="formData.callbackUrl" placeholder="请输入回调地址" />
          </n-form-item-gi>
          <n-form-item-gi label="API版本" path="apiVersion">
            <n-input v-model:value="formData.apiVersion" placeholder="请输入API版本" />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <template #action>
        <NSpace justify="end">
          <NButton @click="modalVisible = false">
            {{ modalEditable ? '取消' : '关闭' }}
          </NButton>
          <template v-if="modalEditable">
            <NButton :loading="saving" @click="handleSaveDraft">
              保存草稿
            </NButton>
            <NButton type="primary" :loading="submitting" @click="handleSubmit">
              提交审核
            </NButton>
          </template>
        </NSpace>
      </template>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { NButton, NSpace, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'VendorApplication' })

const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const allVendors = ref([])
const modalVisible = ref(false)
const currentVendorId = ref(null)
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
    apiDocumentUrl: '',
    callbackUrl: '',
    apiVersion: '',
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
  apiDocumentUrl: req('请输入API文档地址'),
  callbackUrl: req('请输入回调地址'),
  apiVersion: req('请输入API版本'),
}

// 入驻申请页：显示 draft / pending / testing 状态的记录
const activeVendors = computed(() =>
  allVendors.value.filter(v => ['draft', 'pending', 'testing'].includes(v.status)),
)

const currentVendorStatus = computed(() => {
  if (!currentVendorId.value)
    return null
  const v = allVendors.value.find(i => i.vendorId === currentVendorId.value)
  return v?.status
})

const modalEditable = computed(() => {
  // 新建 或 草稿状态 可编辑
  return !currentVendorId.value || currentVendorStatus.value === 'draft'
})

const modalTitle = computed(() => {
  if (!currentVendorId.value)
    return '申请入驻'
  if (currentVendorStatus.value === 'draft')
    return '编辑草稿'
  return '查看申请信息'
})

const statusMap = {
  draft: { label: '草稿', type: 'default' },
  pending: { label: '审核中', type: 'warning' },
  testing: { label: '技术测试中', type: 'info' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'error' },
}

const columns = [
  { title: '公司名称', key: 'companyName', ellipsis: { tooltip: true }, width: 200 },
  { title: '公司简称', key: 'shortName', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render: row => h(NTag, { type: statusMap[row.status]?.type ?? 'default', size: 'small' }, {
      default: () => statusMap[row.status]?.label ?? row.status,
    }),
  },
  { title: '提交时间', key: 'submittedTime', width: 180 },
  { title: '创建时间', key: 'createdTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    render(row) {
      const buttons = [
        h(NButton, { size: 'small', type: 'primary', secondary: true, onClick: () => handleView(row) }, {
          default: () => row.status === 'draft' ? '编辑' : '查看',
          icon: () => h('i', { class: row.status === 'draft' ? 'i-material-symbols:edit-outline text-14' : 'i-material-symbols:visibility-outline text-14' }),
        }),
      ]
      if (row.status === 'draft') {
        buttons.push(
          h(NButton, { size: 'small', type: 'error', secondary: true, onClick: () => handleDelete(row) }, {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          }),
        )
      }
      return h(NSpace, null, { default: () => buttons })
    },
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

function handleNewApplication() {
  currentVendorId.value = null
  formData.value = emptyForm()
  licenseFileList.value = []
  modalVisible.value = true
}

function handleDelete(row) {
  $dialog.warning({
    title: '确认删除',
    content: `确定要删除「${row.companyName}」的草稿吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.deleteDraft(row.vendorId)
        $message.success('草稿已删除')
        await loadVendors()
      }
      catch (error) {
        console.error(error)
      }
    },
  })
}

function handleView(row) {
  currentVendorId.value = row.vendorId
  const data = emptyForm()
  Object.keys(data).forEach((key) => {
    if (row[key] != null)
      data[key] = row[key]
  })
  formData.value = data
  licenseFileList.value = row.licenseImage
    ? [{ id: 'license', name: '营业执照', status: 'finished', url: row.licenseImage }]
    : []
  modalVisible.value = true
}

async function handleSaveDraft() {
  if (!formData.value.companyName?.trim()) {
    $message.warning('请输入公司全称')
    return
  }
  saving.value = true
  try {
    const payload = { ...formData.value }
    if (currentVendorId.value)
      payload.vendorId = currentVendorId.value
    const { data } = await api.saveDraft(payload)
    if (data)
      currentVendorId.value = data
    $message.success('草稿保存成功')
    await loadVendors()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    saving.value = false
  }
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload = { ...formData.value }
    if (currentVendorId.value)
      payload.vendorId = currentVendorId.value
    await api.submit(payload)
    $message.success('提交成功，等待审核')
    modalVisible.value = false
    await loadVendors()
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
