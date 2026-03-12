import { request } from '@/utils'

export default {
  getMyVendorInfo: () => request.get('/vendor/myVendorInfo'),
  refreshPlatformToken: () => request.post('/vendor/refreshPlatformToken'),
}
