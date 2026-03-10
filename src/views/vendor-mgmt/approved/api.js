import { request } from '@/utils'

export default {
  getApprovedVendors: () => request.get('/vendor-mgmt/approved'),
  getVendorDetail: vendorId => request.get(`/vendor-mgmt/${vendorId}`),
  suspendVendor: (vendorId, data) => request.post(`/vendor-mgmt/${vendorId}/suspend`, data),
  banVendor: (vendorId, data) => request.post(`/vendor-mgmt/${vendorId}/ban`, data),
}
