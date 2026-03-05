import api from '@/api'
import { useAuthStore, usePermissionStore, useUserStore } from '@/store'
import { getPermissions } from '@/store/helper'

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
    if (!permissionStore.permissions.length) {
      // 有token但没有用户信息，需要重新获取用户信息和权限，并动态添加可访问的路由
      // const [user, permissions] = await Promise.all([getUserInfo(), getPermissions()])

      const permissions = await getPermissions()
      // userStore.setUser(user)
      permissionStore.setPermissions(permissions)

      // 预加载项目中 @/views 目录下所有 .vue 后缀的页面组件，生成一个路由路径到组件的映射表
      const routeComponents = import.meta.glob('@/views/**/*.vue')
      // 遍历权限路由表，把组件路径替换为对应的组件加载函数，并动态添加到router中
      permissionStore.accessRoutes.forEach((route) => {
        // 把字符串格式的组件路径（如 @/views/home/index.vue），替换成routeComponents中对应的组件加载函数
        route.component = routeComponents[route.component] || undefined
        // 避免重复添加
        !router.hasRoute(route.name) && router.addRoute(route)
      })
      // 动态添加路由后，重新触发一次当前的路由跳转，让 Vue Router 能匹配到刚添加的动态路由，完成页面跳转
      // replace: true 表示用replace 模式跳转（等价于 router.replace()），不会在浏览器的历史记录中新增一条记录
      return { ...to, replace: true }
    }

    const routes = router.getRoutes()
    if (routes.find(route => route.name === to.name))
      return true// 路由存在，直接放行

    // 判断是无权限还是404
    const { data: hasMenu } = await api.validateMenuPath(to.path)
    return hasMenu
      ? { name: '403', query: { path: to.fullPath }, state: { from: 'permission-guard' } }
      : { name: '404', query: { path: to.fullPath } }
  })
}
