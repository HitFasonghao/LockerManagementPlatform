import { request } from '@/utils'

export default {
  getMyVendors: () => request.get('/vendor/myVendors'),
  getAuditProgress: vendorId => request.get(`/vendor/${vendorId}/auditProgress`),
}
