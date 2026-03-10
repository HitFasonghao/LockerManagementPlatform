import { request } from '@/utils'

export default {
  getMyAuditRecords: () => request.get('/audit/records'),
}
