import { request } from '@/utils'

export default {
  getMyVendors: () => request.get('/vendor/myVendors'),
  saveDraft: data => request.post('/vendor/draft', data),
  deleteDraft: vendorId => request.delete(`/vendor/draft/${vendorId}`),
  submit: data => request.post('/vendor/submit', data),
  resubmit: (vendorId, data) => request.post(`/vendor/${vendorId}/resubmit`, data),
  getAuditProgress: vendorId => request.get(`/vendor/${vendorId}/auditProgress`),
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
