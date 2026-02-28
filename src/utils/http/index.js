import axios from 'axios'
import { setupInterceptors } from './interceptors'

export function createAxios(options = {}) {
  const defaultOptions = {
    baseURL: import.meta.env.VITE_AXIOS_BASE_URL, // 从环境变量读取url前缀
    timeout: 12000, // 请求超时时间
  }
  const service = axios.create({
    ...defaultOptions,
    ...options,
  })
  setupInterceptors(service)// 设置请求和响应拦截器
  return service
}

export const request = createAxios()

export const mockRequest = createAxios({
  baseURL: '/mock-api',
})
