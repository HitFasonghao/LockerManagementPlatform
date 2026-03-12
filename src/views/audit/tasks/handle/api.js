import { request } from '@/utils'

export default {
  getTaskById: taskId => request.get(`/audit/tasks/${taskId}`),
  getVendorDetail: vendorId => request.get(`/audit/vendors/${vendorId}`),
  qualificationAudit: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/qualification`, data),
  functionalTestAudit: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/functionalTest`, data),
  performanceTest: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/performanceTest`, data),
  finalApproval: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/finalApproval`, data),
}
