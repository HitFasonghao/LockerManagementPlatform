<template>
  <AppPage show-footer>
    <n-card>
      <n-space align="center">
        <div class="relative">
          <n-avatar round :size="100" :src="userInfo.avatar || undefined" />
          <n-button
            class="absolute bottom-0 right-0"
            circle
            size="small"
            type="primary"
            :loading="avatarUploading"
            @click="triggerAvatarUpload"
          >
            <template #icon>
              <i class="i-fe:camera" />
            </template>
          </n-button>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          >
        </div>
        <div class="ml-20">
          <div class="flex items-center text-16">
            <span>用户名:</span>
            <span class="ml-12 opacity-80">{{ userInfo.username }}</span>
          </div>
          <div class="mt-20 flex items-center text-16">
            <span>密码:</span>
            <span class="ml-12 opacity-80">********</span>
            <n-button class="ml-32" type="primary" text @click="pwdModalRef.open()">
              <i class="i-fe:edit mr-4" />
              修改密码
            </n-button>
          </div>
        </div>
      </n-space>
    </n-card>

    <n-card class="mt-20" title="个人资料信息">
      <template #header-extra>
        <n-button type="primary" text @click="profileModalRef.open()">
          <i class="i-fe:edit mr-4" />
          修改资料
        </n-button>
      </template>

      <n-descriptions
        label-placement="left"
        :label-style="{ width: '200px', textAlign: 'center' }"
        :column="1"
        bordered
      >
        <n-descriptions-item label="姓名">
          {{ userInfo.realName }}
        </n-descriptions-item>
        <n-descriptions-item label="电话">
          {{ userInfo.phone }}
        </n-descriptions-item>
        <n-descriptions-item label="邮箱">
          {{ userInfo.email }}
        </n-descriptions-item>
        <n-descriptions-item label="账号状态">
          {{ statusMap[userInfo.status] ?? '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="最后修改密码时间">
          {{ userInfo.passwordChangedTime }}
        </n-descriptions-item>
        <n-descriptions-item label="账号创建时间">
          {{ userInfo.createdTime }}
        </n-descriptions-item>
        <n-descriptions-item label="最后更新时间">
          {{ userInfo.updatedTime }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <MeModal ref="pwdModalRef" title="修改密码" width="420px" @ok="handlePwdSave()">
      <n-form ref="pwdFormRef" :model="pwdForm" label-placement="left" require-mark-placement="left">
        <n-form-item label="新密码" path="newPassword" :rule="pwdRules.required">
          <n-input v-model:value="pwdForm.newPassword" type="password" placeholder="请输入新密码" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirmPassword" :rule="confirmRule">
          <n-input v-model:value="pwdForm.confirmPassword" type="password" placeholder="请确认新密码" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item label="验证码" path="code" :rule="pwdRules.required">
          <n-input
            v-model:value="pwdForm.code"
            class="h-40 items-center"
            placeholder="请输入验证码"
            :maxlength="6"
            @keydown.enter="handlePwdSave()"
          >
            <template #prefix>
              <i class="i-fe:shield mr-12 opacity-20" />
            </template>
            <template #suffix>
              <n-button
                text
                type="primary"
                size="small"
                :loading="sendingCode"
                :disabled="sendingCode || !userInfo.phone"
                @click.stop="sendSmsCode"
              >
                {{ sendingCode ? '发送中...' : '获取验证码' }}
              </n-button>
            </template>
          </n-input>
        </n-form-item>
      </n-form>
    </MeModal>

    <MeModal ref="profileModalRef" title="修改资料" width="420px" @ok="handleProfileSave()">
      <n-form ref="profileFormRef" :model="profileForm" label-placement="left" require-mark-placement="left">
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="profileForm.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item label="姓名" path="realName">
          <n-input v-model:value="profileForm.realName" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="profileForm.email" placeholder="请输入邮箱" />
        </n-form-item>
      </n-form>
    </MeModal>
  </AppPage>
</template>

<script setup>
import { MeModal } from '@/components'
import { useForm, useModal } from '@/composables'
import api from './api'

const userInfo = ref({
  username: '',
  realName: '',
  phone: '',
  email: '',
  avatar: '',
  status: '',
  passwordChangedTime: '',
  createdTime: '',
  updatedTime: '',
})
const sendingCode = ref(false)
const avatarUploading = ref(false)
const avatarInputRef = ref(null)

const statusMap = {
  active: '正常',
  locked: '锁定',
  inactive: '未启用',
}

onMounted(async () => {
  try {
    const { data } = await api.queryVendorUserInfo()
    userInfo.value = {
      username: data.username || '',
      realName: data.realName || '',
      phone: data.phone || '',
      email: data.email || '',
      avatar: data.avatar || '',
      status: data.status || '',
      passwordChangedTime: data.passwordChangedTime || '',
      createdTime: data.createdTime || '',
      updatedTime: data.updatedTime || '',
    }
  }
  catch (error) {
    console.error(error)
    $message.error('用户信息获取失败')
  }
})

/**
 * 更换头像功能
 */
function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

async function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file)
    return
  if (!file.type.startsWith('image/')) {
    $message.warning('请选择图片文件')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    $message.warning('图片大小不能超过2MB')
    return
  }
  try {
    avatarUploading.value = true
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.updateAvatar(formData)
    userInfo.value.avatar = data
    $message.success('头像更换成功')
  }
  catch (error) {
    console.error(error)
    $message.error('头像更换失败')
  }
  finally {
    avatarUploading.value = false
    e.target.value = ''
  }
}

/**
 * 修改密码功能
 */

const [pwdModalRef] = useModal()
const [pwdFormRef, pwdForm, pwdValidation, pwdRules] = useForm({
  newPassword: '',
  confirmPassword: '',
  code: '',
})
const updatePwdForm = {
  password: '',
  code: '',
}
const confirmRule = [
  {
    required: true,
    message: '此项为必填项',
    trigger: ['input', 'blur'],
  },
  {
    validator: (rule, value) => {
      if (!value)
        return new Error('请确认新密码')
      if (value !== pwdForm.value.newPassword) {
        return new Error('两次输入的密码不一致')
      }
      return true
    },
    trigger: ['input', 'blur'],
  },
]

async function handlePwdSave() {
  await pwdValidation()
  updatePwdForm.password = pwdForm.value.newPassword
  updatePwdForm.code = pwdForm.value.code
  await api.updatePassword(updatePwdForm)
  $message.success('密码修改成功')
}

/**
 * 修改个人资料功能
 */
const [profileModalRef] = useModal()
const [profileFormRef, profileForm, profileValidation, profileRules] = useForm({
  username: userInfo.value.username,
  realName: userInfo.value.realName,
  email: userInfo.value.email,
})
async function handleProfileSave() {
  await profileValidation()
  const submitData = convertEmptyStringToNull({ ...profileForm.value })
  await api.updateProfile(submitData)
  $message.success('资料修改成功')
  refreshUserInfo()
}

async function refreshUserInfo() {
  const { data } = await api.queryVendorUserInfo()
  userInfo.value.username = data.username || ''
  userInfo.value.realName = data.realName || ''
  userInfo.value.email = data.email || ''
}

async function sendSmsCode() {
  const { phone } = userInfo.value
  if (!phone || !/^1[3-9]\d{9}$/.test(phone))
    return $message.warning('请输入正确的手机号')
  try {
    sendingCode.value = true
    await api.sendSmsCode({ phone, purpose: 'UPDATE_PASSWORD' })
    $message.success('验证码发送成功')
  }
  catch (error) {
    console.error(error)
    $message.error('验证码发送失败')
  }
  finally {
    sendingCode.value = false
  }
}

function convertEmptyStringToNull(obj) {
  const result = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = (obj[key] === '' || (typeof obj[key] === 'string' && obj[key].trim() === ''))
        ? null
        : obj[key]
    }
  }
  return result
}
</script>
