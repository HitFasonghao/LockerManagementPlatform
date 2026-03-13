import { request } from '@/utils'

export default {
  getVendorDetail: (vendorId, recordId) => request.get(`/audit/vendors/${vendorId}`, { params: { recordId } }),
  getAuditRecords: vendorId => request.get(`/audit/vendors/${vendorId}/records`),
  getAuditProgress: auditRecordId => request.get(`/vendor/auditProgress/${auditRecordId}`),
  getTasksByRecord: recordId => request.get(`/audit/tasks/record/${recordId}`),
}
