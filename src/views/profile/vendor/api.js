import { request } from '@/utils'

export default {
  updatePassword: data => request.put('/login/updatePassword', data, { needToken: true }),
  updateProfile: data => request.put(`/vendorUser/updateInfo`, data, { needToken: true }),
  queryAdminInfo: () => request.get('/vendorUser/queryVendorUserInfo', { needToken: true }),
  sendSmsCode: data => request.post('/login/smsCode', data, { needToken: false }),
}
