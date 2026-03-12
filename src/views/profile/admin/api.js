import { request } from '@/utils'

export default {
  updatePassword: data => request.put('/login/updatePassword', data, { needToken: true }),
  updateProfile: data => request.put(`/admin/updateInfo`, data, { needToken: true }),
  queryAdminInfo: () => request.get('/admin/queryUserInfo', { needToken: true }),
  sendSmsCode: data => request.post('/login/smsCode', data, { needToken: false }),
  updateAvatar: data => request.post('/admin/updateAvatar', data, { needToken: true, headers: { 'Content-Type': 'multipart/form-data' } }),
}
