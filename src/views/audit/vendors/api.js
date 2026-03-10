import { request } from '@/utils'

export default {
  getVendorList: (params = {}) => request.get('/audit/vendors', { params }),
}
