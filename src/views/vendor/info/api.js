import { request } from '@/utils'

export default {
  getMyVendors: () => request.get('/vendor/myVendors'),
}
