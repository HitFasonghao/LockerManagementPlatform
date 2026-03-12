<template>
  <n-dropdown :options="options" @select="handleSelect">
    <div id="user-dropdown" class="flex cursor-pointer items-center">
      <n-avatar round :size="36" :src="userStore.avatar" />
    </div>
  </n-dropdown>

  <RoleSelect ref="roleSelectRef" />

  <!-- 切换厂商对话框 -->
  <n-modal v-model:show="showVendorDialog" preset="card" title="切换厂商" style="width: 420px;">
    <n-radio-group v-model:value="selectedVendorId" class="w-full">
      <div class="flex flex-col gap-12">
        <n-radio
          v-for="vendor in vendorList"
          :key="vendor.vendorId"
          :value="vendor.vendorId"
          :label="vendor.companyName + (vendor.shortName ? ` (${vendor.shortName})` : '')"
        />
      </div>
    </n-radio-group>
    <template #footer>
      <div class="flex justify-end gap-12">
        <n-button @click="showVendorDialog = false">
          取消
        </n-button>
        <n-button type="primary" :loading="switching" @click="confirmSwitchVendor">
          确认切换
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import api from '@/api'
import { RoleSelect } from '@/layouts/components'
import { useAdminInfoStore, useAuthStore, usePermissionStore } from '@/store'

const router = useRouter()
const userStore = useAdminInfoStore()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

// 切换厂商相关状态
const vendorList = ref([])
const showVendorDialog = ref(false)
const selectedVendorId = ref(null)
const switching = ref(false)

// 页面加载时尝试获取厂商列表
onMounted(async () => {
  try {
    const { data } = await api.getApprovedVendors()
    vendorList.value = data || []
  }
  catch {
    vendorList.value = []
  }
})

const hasMultipleVendors = computed(() => vendorList.value.length > 1)

const options = reactive([
  {
    label: '个人资料',
    key: 'profile',
    icon: () => h('i', { class: 'i-material-symbols:person-outline text-14' }),
    show: computed(() => permissionStore.accessRoutes?.some(item => item.path === '/profile')),
  },
  {
    label: '切换厂商',
    key: 'switchVendor',
    icon: () => h('i', { class: 'i-basil:exchange-solid text-14' }),
    show: hasMultipleVendors,
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h('i', { class: 'i-mdi:exit-to-app text-14' }),
  },
])

const roleSelectRef = ref(null)
function handleSelect(key) {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'toggleRole':
      roleSelectRef.value?.open({
        onOk() {
          location.reload()
        },
      })
      break
    case 'switchVendor':
      openVendorDialog()
      break
    case 'logout':
      $dialog.confirm({
        title: '提示',
        type: 'info',
        content: '确认退出？',
        async confirm() {
          try {
            await api.logout()
          }
          catch (error) {
            console.error(error)
          }
          authStore.logout()
          $message.success('已退出登录')
        },
      })
      break
  }
}

function openVendorDialog() {
  // 设置当前选中的厂商
  const current = vendorList.value.find(v => v.isCurrent)
  selectedVendorId.value = current ? current.vendorId : null
  showVendorDialog.value = true
}

async function confirmSwitchVendor() {
  if (!selectedVendorId.value)
    return

  // 检查是否选择了同一个厂商
  const current = vendorList.value.find(v => v.isCurrent)
  if (current && current.vendorId === selectedVendorId.value) {
    showVendorDialog.value = false
    return
  }

  try {
    switching.value = true
    await api.switchVendor(selectedVendorId.value)
    $message.success('切换厂商成功')
    showVendorDialog.value = false
    // 刷新页面以重新加载权限和数据
    location.reload()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    switching.value = false
  }
}
</script>
