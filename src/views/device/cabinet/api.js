import { request } from '@/utils'

export default {
  // 同步寄存柜
  sync: () => request.post('/cabinet/sync'),
  // 分页查询寄存柜
  list: params => request.get('/cabinet/list', { params }),
  // 分配种类
  assignKind: data => request.put('/cabinet/assignKind', data),
  // 分配柜群
  assignCluster: data => request.put('/cabinet/assignCluster', data),
  // 种类下拉选项
  kindOptions: () => request.get('/cabinet/kindOptions'),
  // 柜群下拉选项
  clusterOptions: () => request.get('/cabinet/clusterOptions'),
}
