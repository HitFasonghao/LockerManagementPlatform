import { request } from '@/utils'

export default {
  getApprovedVendors: params => request.get('/vendor-mgmt/approved', { params }),
  getVendorDetail: vendorId => request.get(`/vendor-mgmt/${vendorId}`),
  suspendVendor: (vendorId, data) => request.post(`/vendor-mgmt/${vendorId}/suspend`, data),
  banVendor: (vendorId, data) => request.post(`/vendor-mgmt/${vendorId}/ban`, data),
}
