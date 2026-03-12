<template>
  <CommonPage>
    <template #action>
      <NButton @click="loadVendorInfo">
        <i class="i-fe:rotate-ccw mr-4 text-14" />
        刷新
      </NButton>
    </template>

    <n-spin :show="loading">
      <template v-if="vendor">
        <n-card title="基本信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
            <n-descriptions-item label="公司全称">
              {{ vendor.companyName || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="公司简称">
              {{ vendor.shortName || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="营业执照号">
              {{ vendor.licenseNo || '-' }}
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

        <n-card class="mt-16" title="技术对接信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
            <n-descriptions-item label="API接口地址">
              {{ vendor.apiEndpoint || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="厂商系统访问Token">
              {{ vendor.vendorAccessToken || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="平台访问Token" :span="2">
              <div class="flex items-center gap-8">
                <span>{{ vendor.platformAccessToken || '-' }}</span>
                <NButton size="tiny" type="warning" secondary @click="handleRefreshToken">
                  <i class="i-fe:refresh-cw mr-4 text-12" />
                  刷新Token
                </NButton>
              </div>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card class="mt-16" title="审批信息" size="small">
          <n-descriptions label-placement="left" bordered :column="2" :label-style="{ width: '120px' }">
            <n-descriptions-item label="审批时间">
              {{ vendor.approvedTime || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="生效日期">
              {{ vendor.effectiveFrom || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="失效日期">
              {{ vendor.effectiveTo || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="创建时间">
              {{ vendor.createdTime || '-' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </template>
      <n-empty v-else-if="!loading" description="暂无厂商信息" />
    </n-spin>
  </CommonPage>
</template>

<script setup>
import { NButton } from 'naive-ui'
import api from './api'

defineOptions({ name: 'VendorVendorInfo' })

const loading = ref(false)
const vendor = ref(null)

onMounted(() => {
  loadVendorInfo()
})

async function loadVendorInfo() {
  loading.value = true
  try {
    const { data } = await api.getMyVendorInfo()
    vendor.value = data || null
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

function handleRefreshToken() {
  $dialog.warning({
    title: '确认刷新',
    content: '确认刷新平台访问Token？刷新后旧Token将立即失效。',
    positiveText: '确认',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        const { data } = await api.refreshPlatformToken()
        if (data) {
          vendor.value.platformAccessToken = data
          $message.success('平台访问Token已刷新')
        }
      }
      catch (error) {
        console.error(error)
      }
    },
  })
}
</script>
