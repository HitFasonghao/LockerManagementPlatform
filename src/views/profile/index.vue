<template>
  <AppPage show-footer>
    <n-card>
      <n-space align="center">
        <n-avatar round :size="100" :src="adminInfo.avatar" />
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
          </div>
          <!--
          <div class="mt-16 flex items-center">
            <n-button type="primary" ghost @click="avatarModalRef.open()">
              更改头像
            </n-button>
            <span class="ml-12 opacity-60">
              修改头像只支持在线链接，不提供上传图片功能，如有需要可自行对接！
            </span>
          </div>
          -->
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
        <n-descriptions-item label="电话">
          {{ adminInfo.phone }}
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

    <MeModal ref="avatarModalRef" width="420px" title="更改头像" @ok="handleAvatarSave()">
      <n-input v-model:value="newAvatar" />
    </MeModal>

    <MeModal ref="pwdModalRef" title="修改密码" width="420px" @ok="handlePwdSave()">
      <n-form
        ref="pwdFormRef"
        :model="pwdForm"
        label-placement="left"
        require-mark-placement="left"
      >
        <n-form-item label="新密码" path="oldPassword" :rule="pwdRules.required">
          <n-input v-model:value="pwdForm.newPassword" type="password" placeholder="请输入新密码" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirmPassword" :rule="pwdRules.required">
          <n-input v-model:value="pwdForm.confirmPassword" type="password" placeholder="请确认新密码" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item label="验证码" path="code" :rule="pwdRules.required">
          <n-input
            v-model:value="pwdForm.code"
            class="h-40 items-center"
            palceholder="请输入验证码"
            :maxlength="6"
            @keydown.enter="handleLogin()"
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
                :disabled="sendingCode || !smsInfo.phone"
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
        <n-form-item label="用户名" path="username" :rule="profileRules.required">
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
import { getUserInfo } from '@/store/helper'
import api from './api'

const adminInfo = ref({
  username: '',
  realName: '',
  phone: '',
  email: '',
  isSuperAdmin: false,
  isActive: false,
  createdTime: '',
  updatedTime: '',
})
const sendingCode = ref(false)

onMounted(async () => { // 页面加载时获取用户信息
  try {
    const { data } = await api.queryAdminInfo()
    adminInfo.value = {
      username: data.username || '',
      realName: data.realName || '',
      phone: data.phone || '',
      email: data.email || '',
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
 * 修改密码功能
 */

const [pwdModalRef] = useModal()
const [pwdFormRef, pwdForm, pwdValidation, pwdRules] = useForm()
async function handlePwdSave() {
  await pwdValidation()
  await api.changePassword(pwdForm.value)
  $message.success('密码修改成功')
  refreshUserInfo()
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
  await api.updateProfile(profileForm.value)
  $message.success('资料修改成功')
  refreshUserInfo()
}

const newAvatar = ref(adminInfo.value.avatar)
const [avatarModalRef] = useModal()
async function handleAvatarSave() {
  if (!newAvatar.value) {
    $message.error('请输入头像地址')
    return false
  }
  await api.updateProfile({ id: adminInfo.value.userId, avatar: newAvatar.value })
  $message.success('头像修改成功')
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
  const user = await getUserInfo()
  adminInfo.value.setUser(user)
}

async function sendSmsCode() {
  const { phone } = adminInfo.value
  if (!phone || !/^1[3-9]\d{9}$/.test(phone))
    return $message.warning('请输入正确的手机号')
  try {
    sendingCode.value = true
    await api.sendSmsCode({ phone, purpose: 'LOGIN' })
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
</script>
