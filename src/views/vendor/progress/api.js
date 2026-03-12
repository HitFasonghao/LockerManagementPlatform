import { request } from '@/utils'

export default {
  getMyVendors: () => request.get('/vendor/myVendors'),
  getMyAuditRecords: params => request.get('/vendor/myAuditRecords', { params }),
  getAuditProgress: vendorId => request.get(`/vendor/${vendorId}/auditProgress`),
  getVendorSnapshot: (vendorId, recordId) => request.get(`/audit/vendors/${vendorId}`, { params: { recordId } }),
  getTasksByRecord: recordId => request.get(`/audit/tasks/record/${recordId}`),
  resubmit: (vendorId, data) => request.post(`/vendor/${vendorId}/resubmit`, data),
  uploadLicense: (file, oldUrl) => {
    const formData = new FormData()
    formData.append('file', file)
    if (oldUrl)
      formData.append('oldUrl', oldUrl)
    return request.post('/vendor/upload/license', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
