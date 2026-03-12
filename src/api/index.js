import { request } from '@/utils'

export default {
  // request使用方式：request.post(url, data, config)
  // 获取用户信息
  getUser: () => request.get('/login/getUserInfo'),
  // 刷新token
  refreshToken: () => request.get('/auth/refresh/token'),
  // 登出
  logout: () => request.post('/auth/logout', {}, { needTip: false }),
  // 切换当前角色
  switchCurrentRole: role => request.post(`/auth/current-role/switch/${role}`),
  // 获取角色权限
  getRolePermissions: () => request.get('/login/getPermissions'),
  // 验证菜单路径
  validateMenuPath: path => request.get(`/permission/menu/validate?path=${path}`),
  // 获取厂商用户的已审核通过厂商列表
  getApprovedVendors: () => request.get('/vendorUser/approvedVendors'),
  // 切换当前厂商
  switchVendor: vendorId => request.put(`/vendorUser/switchVendor/${vendorId}`),
}
