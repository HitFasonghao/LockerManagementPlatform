<template>
  <AppPage show-footer>
    <n-card>
      <n-space align="center">
        <n-avatar round :size="100" :src="adminInfoStore.avatar" />
        <div class="ml-20">
          <div class="flex items-center text-16">
            <span>用户名:</span>
            <span class="ml-12 opacity-80">{{ adminInfoStore.username }}</span>
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
          {{ adminInfoStore.realName }}
        </n-descriptions-item>
        <n-descriptions-item label="电话">
          {{ adminInfoStore.phone }}
        </n-descriptions-item>
        <n-descriptions-item label="邮箱">
          {{ adminInfoStore.email }}
        </n-descriptions-item>
        <n-descriptions-item label="身份">
          {{ isSuperAdmin.find((item) => item.value === adminInfoStore.isSuperAdmin)?.label ?? '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="账号状态">
          {{ isAccountStatus.find((item) => item.value === adminInfoStore.isActive)?.label ?? '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="账号创建时间">
          {{ adminInfoStore.createdTime }}
        </n-descriptions-item>
        <n-descriptions-item label="最后更新时间">
          {{ adminInfoStore.updatedTime }}
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
        <n-form-item label="原密码" path="oldPassword" :rule="required">
          <n-input v-model:value="pwdForm.oldPassword" type="password" placeholder="请输入原密码" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword" :rule="required">
          <n-input v-model:value="pwdForm.newPassword" type="password" placeholder="请输入新密码" show-password-on="mousedown" />
        </n-form-item>
      </n-form>
    </MeModal>

    <MeModal ref="profileModalRef" title="修改资料" width="420px" @ok="handleProfileSave()">
      <n-form ref="profileFormRef" :model="profileForm" label-placement="left">
        <n-form-item label="昵称" path="nickName">
          <n-input v-model:value="profileForm.nickName" placeholder="请输入昵称" />
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-select
            v-model:value="profileForm.gender"
            :options="isSuperAdmin"
            placeholder="请选择性别"
          />
        </n-form-item>
        <n-form-item label="地址" path="address">
          <n-input v-model:value="profileForm.address" placeholder="请输入地址" />
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
import { useAdminInfoStore } from '@/store'
import { getUserInfo } from '@/store/helper'
import api from './api'

const adminInfoStore = useAdminInfoStore()
const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

const [pwdModalRef] = useModal()
const [pwdFormRef, pwdForm, pwdValidation] = useForm()

async function handlePwdSave() {
  await pwdValidation()
  await api.changePassword(pwdForm.value)
  $message.success('密码修改成功')
  refreshUserInfo()
}

const newAvatar = ref(adminInfoStore.avatar)
const [avatarModalRef] = useModal()
async function handleAvatarSave() {
  if (!newAvatar.value) {
    $message.error('请输入头像地址')
    return false
  }
  await api.updateProfile({ id: adminInfoStore.userId, avatar: newAvatar.value })
  $message.success('头像修改成功')
  refreshUserInfo()
}

const isSuperAdmin = [
  { label: '管理员', value: 0 },
  { label: '超级管理员', value: 1 },
]
const isAccountStatus = [
  { label: '禁用', value: 0 },
  { label: '正常', value: 1 },
]
const [profileModalRef] = useModal()
const [profileFormRef, profileForm, profileValidation] = useForm({
  id: adminInfoStore.userId,
  nickName: adminInfoStore.nickName,
  gender: adminInfoStore.adminInfo?.gender ?? 0,
  address: adminInfoStore.adminInfo?.address,
  email: adminInfoStore.adminInfo?.email,
})
async function handleProfileSave() {
  await profileValidation()
  await api.updateProfile(profileForm.value)
  $message.success('资料修改成功')
  refreshUserInfo()
}

async function refreshUserInfo() {
  const user = await getUserInfo()
  adminInfoStore.setUser(user)
}
</script>
