import { request } from '@/utils'

export default {
  getMyAuditRecords: params => request.get('/audit/records', { params }),
  getNodeOptions: () => request.get('/audit/tasks/nodeOptions'),
}
