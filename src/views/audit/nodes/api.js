import { request } from '@/utils'

export default {
  read: () => request.get('/audit/nodes'),
  create: data => request.post('/audit/nodes', data),
  update: data => request.patch(`/audit/nodes/${data.auditNodeId}`, data),
  delete: id => request.delete(`/audit/nodes/${id}`),
}
