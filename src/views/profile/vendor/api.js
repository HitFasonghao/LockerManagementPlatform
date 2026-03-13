import { request } from '@/utils'

export default {
  updatePassword: data => request.put('/login/updatePassword', data, { needToken: true }),
  updateProfile: data => request.put(`/vendorUser/updateInfo`, data, { needToken: true }),
  queryVendorUserInfo: () => request.get('/vendorUser/queryVendorUserInfo', { needToken: true }),
  sendSmsCode: data => request.post('/login/smsCode', data, { needToken: false }),
  updateAvatar: data => request.post('/vendorUser/updateAvatar', data, { needToken: true, headers: { 'Content-Type': 'multipart/form-data' } }),
  confirmOldPhone: data => request.post('/login/confirmOldPhone', data, { needToken: true }),
  updatePhone: data => request.put('/login/updatePhone', data, { needToken: true }),
}
