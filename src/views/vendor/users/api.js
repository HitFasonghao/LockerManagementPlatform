import { request } from '@/utils'

export default {
  getVendorUsers: () => request.get('/vendor/users'),
  addVendorUser: username => request.post('/vendor/users', null, { params: { username } }),
  removeVendorUser: vendorUserRelationId => request.delete(`/vendor/users/${vendorUserRelationId}`),
}
