import { request } from '@/utils'

export default {
  getMyTasks: () => request.get('/audit/tasks/my'),
  getTaskById: taskId => request.get(`/audit/tasks/${taskId}`),
  getTasksByVendor: vendorId => request.get(`/audit/tasks/vendor/${vendorId}`),
  assignTask: data => request.post('/audit/tasks', data),
  updateTask: (taskId, data) => request.patch(`/audit/tasks/${taskId}`, data),
}
