import { defineStore } from 'pinia'

export const useAdminInfoStore = defineStore('adminInfo', {
  state: () => ({
    adminInfo: null,
  }),
  getters: {
    avatar() {
      return this.adminInfo?.avatar
    },
    username() {
      return this.adminInfo?.username
    },
    realName() {
      return this.adminInfo?.realName
    },
    email() {
      return this.adminInfo?.email
    },
    phone() {
      return this.adminInfo?.phone
    },
    isSuperAdmin() {
      return this.adminInfo?.isSuperAdmin || false
    },
    isActive() {
      return this.adminInfo?.isActive || false
    },
    createdTime() {
      return this.adminInfo?.createdTime || null
    },
    updatedTime() {
      return this.adminInfo?.updatedTime || null
    },
  },
  actions: {
    setUser(adminInfo) {
      this.adminInfo = adminInfo
    },
    resetUser() {
      this.$reset()
    },
  },
})
