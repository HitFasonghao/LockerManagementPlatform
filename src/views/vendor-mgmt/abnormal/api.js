import { request } from '@/utils'

export default {
  getAbnormalVendors: () => request.get('/vendor-mgmt/abnormal'),
  getVendorDetail: vendorId => request.get(`/vendor-mgmt/${vendorId}`),
  restoreVendor: (vendorId, data) => request.post(`/vendor-mgmt/${vendorId}/restore`, data),
}
