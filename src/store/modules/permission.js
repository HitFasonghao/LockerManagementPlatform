import { hyphenate } from '@vueuse/core'
import { defineStore } from 'pinia'
import { isExternal } from '@/utils'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    accessRoutes: [], // 最终生成的、供路由守卫动态添加的路由配置列表
    permissions: [], // 原始的后端权限数据（未处理）
    menus: [], // 处理后的、供侧边栏渲染的菜单列表
  }),
  actions: {
    setPermissions(permissions) {
      this.permissions = permissions
      this.menus = this.permissions
        .filter(item => item.type === 'MENU')
        .map(item => this.getMenuItem(item)) // 递归处理每个菜单项，生成前端菜单格式
        .filter(item => !!item) // 过滤掉无效的菜单
        .sort((a, b) => a.order - b.order) // 根据order字段排序，order值小的排在前面
    },
    getMenuItem(item, parent) {
      const route = this.generateRoute(item, item.show ? null : parent?.key)
      // 筛选可添加的路由：启用状态 + 有路径 + 不是外部链接 → 加入accessRoutes
      if (item.enable && route.path && !route.path.startsWith('http'))
        this.accessRoutes.push(route)

      // 构造前端菜单组件需要的格式
      const menuItem = {
        label: route.meta.title,
        key: route.name,
        path: route.path,
        originPath: route.meta.originPath,
        icon: () => h('i', { class: `${route.meta.icon} text-16` }),
        order: item.order ?? 0,
      }

      // 处理子菜单（递归）
      const children = item.children?.filter(item => item.type === 'MENU') || []
      if (children.length) {
        menuItem.children = children
          .map(child => this.getMenuItem(child, menuItem))
          .filter(item => !!item) // 过滤无效子菜单
          .sort((a, b) => a.order - b.order)
        // 如果子菜单处理后为空，删除children属性（避免菜单组件渲染空列表）
        if (!menuItem.children.length)
          delete menuItem.children
      }

      // 控制菜单是否显示：show为false则返回null（会被上层filter过滤）
      if (!item.show)
        return null
      return menuItem
    },
    generateRoute(item, parentKey) {
      let originPath
      // 如果是外链，则使用原始路径，并把组件设置成iframe组件，路由路径改成 /iframe/xxx 的格式
      if (isExternal(item.path)) {
        originPath = item.path
        item.component = '/src/views/iframe/index.vue'
        item.path = `/iframe/${hyphenate(item.code)}`
      }
      // 返回标准的Vue Router路由配置对象
      return {
        name: item.code,
        path: item.path,
        redirect: item.redirect,
        component: item.component,
        meta: {
          originPath,
          icon: `${item.icon}?mask`,
          title: item.name,
          layout: item.layout,
          keepAlive: !!item.keepAlive, // 是否缓存页面
          parentKey, // 父级菜单的key
          btns: item.children // 按钮权限列表
            ?.filter(item => item.type === 'BUTTON')
            .map(item => ({ code: item.code, name: item.name })),
        },
      }
    },
    resetPermission() {
      this.$reset()
    },
  },
})
