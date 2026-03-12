import { request } from '@/utils'

export default {
  getMyTasks: params => request.get('/audit/tasks/my', { params }),
  getTaskById: taskId => request.get(`/audit/tasks/${taskId}`),
  getTasksByVendor: vendorId => request.get(`/audit/tasks/vendor/${vendorId}`),
  assignTask: data => request.post('/audit/tasks', data),
  updateTask: (taskId, data) => request.patch(`/audit/tasks/${taskId}`, data),
  getNodeOptions: () => request.get('/audit/tasks/nodeOptions'),
}
