import { request } from '@/utils'

export default {
  list: params => request.get('/cabinetKind/list', { params }),
  create: data => request.post('/cabinetKind/create', data),
  update: data => request.put('/cabinetKind/update', data),
  delete: kindId => request.delete(`/cabinetKind/delete/${kindId}`),
}
