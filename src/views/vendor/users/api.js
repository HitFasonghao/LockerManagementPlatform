import { request } from '@/utils'

export default {
  getVendorUsers: vendorId => request.get(`/vendor/${vendorId}/users`),
  addVendorUser: (vendorId, username) => request.post(`/vendor/${vendorId}/users`, null, { params: { username } }),
  removeVendorUser: (vendorId, vendorUserId) => request.delete(`/vendor/${vendorId}/users/${vendorUserId}`),
}
