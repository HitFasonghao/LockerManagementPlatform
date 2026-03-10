import { request } from '@/utils'

export default {
  getPendingAssignments: () => request.get('/audit/assignments'),
  assign: data => request.post('/audit/assignments', data),
  getAdminOptions: () => request.get('/audit/assignments/admins'),
}
