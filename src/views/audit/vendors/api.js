import { request } from '@/utils'

export default {
  getVendorList: (params = {}) => request.get('/audit/vendors', { params }),
  getVendorDetail: vendorId => request.get(`/audit/vendors/${vendorId}`),
  getAuditRecords: vendorId => request.get(`/audit/vendors/${vendorId}/records`),
  qualificationAudit: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/qualification`, data),
  techTestAudit: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/techTest`, data),
  finalApproval: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/finalApproval`, data),
}
