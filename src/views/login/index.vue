<template>
  <div class="wh-full flex-col bg-[url(@/assets/images/login_bg.webp)] bg-cover">
    <div
      class="m-auto max-w-700 min-w-345 f-c-c rounded-8 auto-bg bg-opacity-20 bg-cover p-12 card-shadow"
    >
      <div class="hidden w-380 px-20 py-35 md:block">
        <img src="@/assets/images/login_banner.webp" class="w-full" alt="login_banner">
      </div>

      <div class="w-320 flex-col px-20 py-32">
        <h2 class="f-c-c text-24 text-#6a6a6a font-normal">
          <img src="@/assets/images/logo.png" class="mr-12 h-50">
          <span class="text-24 font-bold">{{ title }}</span>
        </h2>

        <!-- 登录方式切换 -->
        <div class="mt-32 flex rounded-8 bg-#f5f5f5 p-4">
          <button
            class="flex-1 rounded-6 py-8 text-14 font-medium transition-all duration-300"
            :class="loginMode === 'account' ? 'bg-white text-primary shadow-sm' : 'text-#999 hover:text-#666'"
            @click="loginMode = 'account'"
          >
            账号密码登录
          </button>
          <button
            class="flex-1 rounded-6 py-8 text-14 font-medium transition-all duration-300"
            :class="loginMode === 'sms' ? 'bg-white text-primary shadow-sm' : 'text-#999 hover:text-#666'"
            @click="loginMode = 'sms'"
          >
            短信验证码登录
          </button>
        </div>

        <!-- 账号密码登录 -->
        <template v-if="loginMode === 'account'">
          <n-input
            v-model:value="accountInfo.username"
            autofocus
            class="mt-32 h-40 items-center"
            placeholder="请输入用户名"
            :maxlength="20"
          >
            <template #prefix>
              <i class="i-fe:user mr-12 opacity-20" />
            </template>
          </n-input>
          <n-input
            v-model:value="accountInfo.password"
            class="mt-20 h-40 items-center"
            type="password"
            show-password-on="mousedown"
            placeholder="请输入密码"
            :maxlength="20"
            @keydown.enter="handleLogin()"
          >
            <template #prefix>
              <i class="i-fe:lock mr-12 opacity-20" />
            </template>
          </n-input>

          <div class="mt-20 flex items-center">
            <n-input
              v-model:value="accountInfo.captcha"
              class="h-40 items-center"
              palceholder="请输入验证码"
              :maxlength="4"
              @keydown.enter="handleLogin()"
            >
              <template #prefix>
                <i class="i-fe:key mr-12 opacity-20" />
              </template>
              <template #suffix>
                <img
                  v-if="captchaUrl"
                  :src="captchaUrl"
                  alt="验证码"
                  height="40"
                  class="ml-12 w-80 cursor-pointer"
                  @click="initCaptcha"
                >
              </template>
            </n-input>
          </div>
        </template>

        <!-- 短信验证码登录 -->
        <template v-else>
          <n-input
            v-model:value="smsInfo.phone"
            autofocus
            class="mt-32 h-40 items-center"
            placeholder="请输入手机号"
            :maxlength="20"
          >
            <template #prefix>
              <i class="i-fe:smartphone mr-12 opacity-20" />
            </template>
          </n-input>

          <div class="mt-20 flex items-center">
            <n-input
              v-model:value="smsInfo.code"
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
          </div>
        </template>

        <div class="mt-20 flex items-center">
          <n-checkbox
            :checked="isRemember"
            label="记住我"
            :on-update:checked="(val) => (isRemember = val)"
          />

          <n-button
            class="ml-32 h-40 flex-1 rounded-5 text-16"
            type="primary"
            :loading="loading"
            @click="handleLogin()"
          >
            登录
          </n-button>
        </div>
      </div>
    </div>

    <TheFooter class="py-12" />
  </div>
</template>

<script setup>
import { useStorage } from '@vueuse/core'
import { useAuthStore } from '@/store'
import { lStorage, throttle } from '@/utils'
import api from './api'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const title = import.meta.env.VITE_TITLE

const loginMode = ref('account') // 登录模式

const accountInfo = ref({
  username: '',
  password: '',
  captcha: '',
  captchaId: '',
})

const smsInfo = ref({
  phone: '',
  code: '',
})

const captchaUrl = ref('')// 验证码图片地址

// 获取图形验证码，节流函数限制调用频率为500ms
const initCaptcha = throttle(async () => {
  try {
    const { data } = await api.getCaptcha()
    accountInfo.value.captchaId = data.captchaId
    captchaUrl.value = data.imageBase64
  }
  catch (error) {
    console.error(error)
  }
}, 500, {
  leading: true, // 立即执行第一次调用（可选，根据需求）
  trailing: false, // 防止节流结束后重复执行（可选）
})

// 尝试从本地存储获取登录信息
const localAccountInfo = lStorage.get('loginAccountInfo')
if (localAccountInfo) {
  accountInfo.value.username = localAccountInfo.username || ''
  accountInfo.value.password = localAccountInfo.password || ''
}
const localSmsInfo = lStorage.get('loginSmsInfo')
if (localSmsInfo) {
  smsInfo.value.phone = localSmsInfo.phone || ''
  smsInfo.value.code = localSmsInfo.code || ''
}

// 初始化验证码
initCaptcha()

const isRemember = useStorage('isRemember', true)
const loading = ref(false)
const sendingCode = ref(false)

// 处理登录逻辑
async function handleLogin() {
  const mode = loginMode.value

  // 账号密码登录
  if (mode === 'account') {
    const { username, password, captcha, captchaId } = accountInfo.value

    if (!username || !password)
      return $message.warning('请输入用户名和密码')
    if (!captchaUrl.value)
      return $message.warning('请输入验证码')

    try {
      loading.value = true
      $message.loading('正在验证，请稍后...', { key: 'login' })
      const { data } = await api.loginByPassword({ username, password: password.toString(), code: captcha, captchaId })
      if (isRemember.value) {
        lStorage.set('loginAccountInfo', { username, password })
      }
      else {
        lStorage.remove('loginAccountInfo')
      }
      onLoginSuccess(data)
    }
    catch (error) {
      if (error?.code === 1400) {
        initCaptcha() // 为防止爆破，验证码错误则刷新验证码
      }
      $message.destroy('login')
      console.error(error)
    }
    loading.value = false
  }
  // 短信验证码登录
  else if (mode === 'sms') {
    const { phone, code } = smsInfo.value
    if (!phone || !/^1[3-9]\d{9}$/.test(phone))
      return $message.warning('请输入正确的手机号')
    if (!code)
      return $message.warning('请输入验证码')

    try {
      loading.value = true
      $message.loading('正在验证，请稍后...', { key: 'login' })
      const { data } = await api.loginBySmsCode({ phone, code })
      if (isRemember.value) {
        lStorage.set('loginSmsInfo', { phone, code })
      }
      else {
        lStorage.remove('loginSmsInfo')
      }
      onLoginSuccess(data)
    }
    catch (error) {
      console.error(error)
    }
    loading.value = false
  }
}

// 处理登录成功后的逻辑
async function onLoginSuccess(data = {}) {
  authStore.setToken(data.token)
  $message.loading('登录中...', { key: 'login' })
  try {
    $message.success('登录成功', { key: 'login' })
    if (route.query.redirect) {
      const path = route.query.redirect
      delete route.query.redirect
      router.push({ path, query: route.query })
    }
    else {
      router.push('/')
    }
  }
  catch (error) {
    console.error(error)
    $message.destroy('login')
  }
}

async function sendSmsCode() {
  const { phone } = smsInfo.value
  if (!phone || !/^1[3-9]\d{9}$/.test(phone))
    return $message.warning('请输入正确的手机号')
  try {
    sendingCode.value = true
    await api.sendSmsCode({ phone: smsInfo.value.phone, purpose: 'LOGIN' })
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
