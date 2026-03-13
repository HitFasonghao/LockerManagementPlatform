import { request } from '@/utils'

export default {
  getMyVendorInfo: () => request.get('/vendor/myVendorInfo'),
  getMyApprovedVendors: () => request.get('/vendor/myApprovedVendors'),
}
