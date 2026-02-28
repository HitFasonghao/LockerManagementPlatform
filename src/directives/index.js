import { withDirectives } from 'vue'
import { router } from '@/router'

// 根据当前用户拥有的权限，动态决定页面上的某个按钮（或元素）是否显示。
// 如果没有权限，该元素会直接从 DOM 中移除。

// 权限指令
const permission = {
  mounted(el, binding) {
    // 获取当前路由的权限配置，检查用户是否拥有对应的权限码
    const currentRoute = unref(router.currentRoute)
    // 从路由的 meta 信息中获取权限码列表，如果没有则默认为空数组
    const btns = currentRoute.meta?.btns?.map(item => item.code) || []
    // binding.value 写在模板里的值 v-permission="user:delete" 这里的 user:delete 就是 binding.value
    if (!btns.includes(binding.value)) {
      el.remove() // 没有权限，直接从 DOM 中移除该元素
    }
  },
}

// 在 Vue 应用中注册全局指令，在main.js中调用
export function setupDirectives(app) {
  app.directive('permission', permission)
}

/**
 * 用于h函数使用自定义权限指令
 *
 * @param {*} vnode 虚拟节点
 * @param {*} code 权限码
 * @returns 返回一个包含权限指令的vnode
 *
 * 使用示例：withPermission(h('button', {class: 'text-red-500'}, '删除'), 'user:delete')
 *
 */
export function withPermission(vnode, code) {
  return withDirectives(vnode, [[permission, code]])
}
