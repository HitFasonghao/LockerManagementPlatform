<template>
  <AppPage show-footer>
    <n-card>
      <n-space align="center">
        <div class="relative">
          <n-avatar round :size="100" :src="adminInfo.avatar || undefined" />
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
            <span class="ml-12 opacity-80">{{ adminInfo.username }}</span>
          </div>
          <div class="mt-20 flex items-center text-16">
            <span>密码:</span>
            <span class="ml-12 opacity-80">********</span>
            <n-button class="ml-32" type="primary" text @click="pwdModalRef.open()">
              <i class="i-fe:edit mr-4" />
              修改密码
            </n-button>
            <span class="ml-48">手机号:</span>
            <span class="ml-12 opacity-80">{{ adminInfo.phone }}</span>
            <n-button class="ml-32" type="primary" text @click="openPhoneModal()">
              <i class="i-fe:phone mr-4" />
              改绑手机号
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
          {{ adminInfo.realName }}
        </n-descriptions-item>
        <n-descriptions-item label="邮箱">
          {{ adminInfo.email }}
        </n-descriptions-item>
        <n-descriptions-item label="身份">
          {{ isSuperAdmin.find((item) => item.value === adminInfo.isSuperAdmin)?.label ?? '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="账号状态">
          {{ isAccountStatus.find((item) => item.value === adminInfo.isActive)?.label ?? '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="账号创建时间">
          {{ adminInfo.createdTime }}
        </n-descriptions-item>
        <n-descriptions-item label="最后更新时间">
          {{ adminInfo.updatedTime }}
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
                :disabled="sendingCode || !adminInfo.phone"
                @click.stop="sendSmsCode"
              >
                {{ sendingCode ? '发送中...' : '获取验证码' }}
              </n-button>
            </template>
          </n-input>
        </n-form-item>
      </n-form>
    </MeModal>

    <MeModal ref="phoneModalRef" :title="phoneStep === 1 ? '验证当前手机号' : '绑定新手机号'" width="420px" @ok="handlePhoneSave">
      <template v-if="phoneStep === 1">
        <n-form label-placement="left" require-mark-placement="left">
          <n-form-item label="当前手机号">
            <n-input :value="adminInfo.phone" disabled />
          </n-form-item>
          <n-form-item label="验证码" required>
            <n-input
              v-model:value="phoneForm.oldCode"
              class="h-40 items-center"
              placeholder="请输入验证码"
              :maxlength="6"
            >
              <template #prefix>
                <i class="i-fe:shield mr-12 opacity-20" />
              </template>
              <template #suffix>
                <n-button
                  text
                  type="primary"
                  size="small"
                  :loading="sendingPhoneCode"
                  :disabled="sendingPhoneCode || phoneCooldown > 0"
                  @click.stop="sendPhoneCode(adminInfo.phone)"
                >
                  {{ phoneCooldown > 0 ? `${phoneCooldown}s后重试` : (sendingPhoneCode ? '发送中...' : '获取验证码') }}
                </n-button>
              </template>
            </n-input>
          </n-form-item>
        </n-form>
      </template>
      <template v-else>
        <n-form label-placement="left" require-mark-placement="left">
          <n-form-item label="新手机号">
            <n-input v-model:value="phoneForm.newPhone" placeholder="请输入新手机号" :maxlength="11" />
          </n-form-item>
          <n-form-item label="验证码">
            <n-input
              v-model:value="phoneForm.newCode"
              class="h-40 items-center"
              placeholder="请输入验证码"
              :maxlength="6"
            >
              <template #prefix>
                <i class="i-fe:shield mr-12 opacity-20" />
              </template>
              <template #suffix>
                <n-button
                  text
                  type="primary"
                  size="small"
                  :loading="sendingPhoneCode"
                  :disabled="sendingPhoneCode || phoneCooldown > 0 || !phoneForm.newPhone"
                  @click.stop="sendPhoneCode(phoneForm.newPhone)"
                >
                  {{ phoneCooldown > 0 ? `${phoneCooldown}s后重试` : (sendingPhoneCode ? '发送中...' : '获取验证码') }}
                </n-button>
              </template>
            </n-input>
          </n-form-item>
        </n-form>
      </template>
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

const adminInfo = ref({
  username: '',
  realName: '',
  phone: '',
  email: '',
  avatar: '',
  isSuperAdmin: false,
  isActive: false,
  createdTime: '',
  updatedTime: '',
})
const sendingCode = ref(false)
const avatarUploading = ref(false)
const avatarInputRef = ref(null)

onMounted(async () => {
  try {
    const { data } = await api.queryAdminInfo()
    adminInfo.value = {
      username: data.username || '',
      realName: data.realName || '',
      phone: data.phone || '',
      email: data.email || '',
      avatar: data.avatar || '',
      isSuperAdmin: data.isSuperAdmin || false,
      isActive: data.isActive || false,
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
    adminInfo.value.avatar = data
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
 * 改绑手机号功能
 */
const [phoneModalRef] = useModal()
const phoneStep = ref(1)
const sendingPhoneCode = ref(false)
const phoneCooldown = ref(0)
let phoneCooldownTimer = null
const phoneForm = ref({
  oldCode: '',
  newPhone: '',
  newCode: '',
})

function openPhoneModal() {
  phoneStep.value = 1
  phoneForm.value = { oldCode: '', newPhone: '', newCode: '' }
  phoneCooldown.value = 0
  if (phoneCooldownTimer) {
    clearInterval(phoneCooldownTimer)
    phoneCooldownTimer = null
  }
  phoneModalRef.value.open()
}

function startCooldown() {
  phoneCooldown.value = 60
  phoneCooldownTimer = setInterval(() => {
    phoneCooldown.value--
    if (phoneCooldown.value <= 0) {
      clearInterval(phoneCooldownTimer)
      phoneCooldownTimer = null
    }
  }, 1000)
}

async function sendPhoneCode(phone) {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone))
    return $message.warning('请输入正确的手机号')
  try {
    sendingPhoneCode.value = true
    await api.sendSmsCode({ phone, purpose: 'UPDATE_PHONE' })
    $message.success('验证码发送成功')
    startCooldown()
  }
  catch (error) {
    console.error(error)
    $message.error('验证码发送失败')
  }
  finally {
    sendingPhoneCode.value = false
  }
}

async function handlePhoneSave() {
  if (phoneStep.value === 1) {
    if (!phoneForm.value.oldCode || !/^\d{6}$/.test(phoneForm.value.oldCode)) {
      $message.warning('请输入6位验证码')
      return false
    }
    try {
      await api.confirmOldPhone({ code: phoneForm.value.oldCode })
      $message.success('验证成功，请输入新手机号')
      phoneStep.value = 2
      phoneCooldown.value = 0
      if (phoneCooldownTimer) {
        clearInterval(phoneCooldownTimer)
        phoneCooldownTimer = null
      }
    }
    catch (error) {
      console.error(error)
      $message.error('验证码错误')
    }
    return false
  }
  else {
    if (!phoneForm.value.newPhone || !/^1[3-9]\d{9}$/.test(phoneForm.value.newPhone)) {
      $message.warning('请输入正确的新手机号')
      return false
    }
    if (!phoneForm.value.newCode || !/^\d{6}$/.test(phoneForm.value.newCode)) {
      $message.warning('请输入6位验证码')
      return false
    }
    try {
      await api.updatePhone({
        oldCode: phoneForm.value.oldCode,
        newCode: phoneForm.value.newCode,
        phone: phoneForm.value.newPhone,
      })
      $message.success('手机号修改成功')
      adminInfo.value.phone = phoneForm.value.newPhone
    }
    catch (error) {
      console.error(error)
      $message.error('手机号修改失败')
      return false
    }
  }
}

/**
 * 修改个人资料功能
 */
const [profileModalRef] = useModal()
const [profileFormRef, profileForm, profileValidation, profileRules] = useForm({
  username: adminInfo.value.username,
  realName: adminInfo.value.realName,
  email: adminInfo.value.email,
})
async function handleProfileSave() {
  await profileValidation()
  const submitData = convertEmptyStringToNull({ ...profileForm.value })
  await api.updateProfile(submitData)
  $message.success('资料修改成功')
  refreshUserInfo()
}

const isSuperAdmin = [
  { label: '管理员', value: false },
  { label: '超级管理员', value: true },
]
const isAccountStatus = [
  { label: '禁用', value: false },
  { label: '正常', value: true },
]

async function refreshUserInfo() {
  const { data } = await api.queryAdminInfo()
  adminInfo.value.username = data.username || ''
  adminInfo.value.realName = data.realName || ''
  adminInfo.value.email = data.email || ''
}

async function sendSmsCode() {
  const { phone } = adminInfo.value
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
