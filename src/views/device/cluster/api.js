import { request } from '@/utils'

export default {
  create: data => request.post('/cluster/create', data),
  list: params => request.get('/cluster/list', { params }),
  detail: clusterId => request.get(`/cluster/detail/${clusterId}`),
  updateCabinetStatus: data => request.put('/cluster/cabinet/status', data),
  removeCabinet: cabinetId => request.delete(`/cluster/cabinet/${cabinetId}`),
}
