import { request } from '@/utils'

export default {
  changePassword: data => request.post('/auth/password', data),
  updateProfile: data => request.patch(`/user/profile/${data.id}`, data),
  queryAdminInfo: () => request.get('/admin/queryUserInfo', { needToken: true }),
  sendSmsCode: data => request.post('/login/smsCode', data, { needToken: false }),
}
