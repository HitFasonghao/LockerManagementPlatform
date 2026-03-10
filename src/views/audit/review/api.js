import { request } from '@/utils'

export default {
  getVendorDetail: vendorId => request.get(`/audit/vendors/${vendorId}`),
  getAuditRecords: vendorId => request.get(`/audit/vendors/${vendorId}/records`),
  getAuditProgress: vendorId => request.get(`/vendor/${vendorId}/auditProgress`),
}
