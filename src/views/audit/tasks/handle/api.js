import { request } from '@/utils'

export default {
  getTaskById: taskId => request.get(`/audit/tasks/${taskId}`),
  getVendorDetail: vendorId => request.get(`/audit/vendors/${vendorId}`),
  qualificationAudit: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/qualification`, data),
  techTestAudit: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/techTest`, data),
  performanceTest: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/performanceTest`, data),
  finalApproval: (vendorId, data) => request.post(`/audit/vendors/${vendorId}/finalApproval`, data),
}
