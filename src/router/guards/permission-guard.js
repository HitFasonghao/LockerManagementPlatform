import api from '@/api'
import { useAuthStore, usePermissionStore, useUserStore } from '@/store'
import { getPermissions, getUserInfo } from '@/store/helper'

const WHITE_LIST = ['/login', '/404']
export function createPermissionGuard(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    // 没有token的情况
    if (!token) {
      if (WHITE_LIST.includes(to.path))
        return true // 白名单中直接进入
      // 没有访问权限的页面将被重定向到登录页面，并携带当前页面地址作为参数，以便登录成功后可以重定向回原页面
      return { path: 'login', query: { ...to.query, redirect: to.path } }
    }

    // 有token的情况
    if (to.path === '/login')
      return { path: '/' } // 已登录访问登录页，直接跳首页
    if (WHITE_LIST.includes(to.path))
      return true

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    if (!userStore.userInfo) {
      // 有token但没有用户信息，需要重新获取用户信息和权限，并动态添加可访问的路由
      const [user, permissions] = await Promise.all([getUserInfo(), getPermissions()])
      userStore.setUser(user)
      permissionStore.setPermissions(permissions)

      const routeComponents = import.meta.glob('@/views/**/*.vue')
      permissionStore.accessRoutes.forEach((route) => {
        route.component = routeComponents[route.component] || undefined
        !router.hasRoute(route.name) && router.addRoute(route)
      })
      return { ...to, replace: true }
    }

    const routes = router.getRoutes()
    if (routes.find(route => route.name === to.name))
      return true

    // 判断是无权限还是404
    const { data: hasMenu } = await api.validateMenuPath(to.path)
    return hasMenu
      ? { name: '403', query: { path: to.fullPath }, state: { from: 'permission-guard' } }
      : { name: '404', query: { path: to.fullPath } }
  })
}
