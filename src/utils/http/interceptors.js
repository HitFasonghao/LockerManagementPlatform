import { useAuthStore } from '@/store'
import { resolveResError } from './helpers'

const SUCCESS_CODES = [1200] // 定义业务成功的code列表，后端可以根据实际情况调整

export function setupInterceptors(axiosInstance) {
  axiosInstance.interceptors.request.use(reqResolve, reqReject)
  axiosInstance.interceptors.response.use(resResolve, resReject)
}

// 请求成功处理，主要是给请求添加token等公共参数
function reqResolve(config) {
  if (config.needToken === false) {
    // 处理不需要token的请求
    return config
  }

  const { accessToken } = useAuthStore() // 从store中获取accessToken
  if (accessToken) {
    // 把token添加到请求头中
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}

// TODO:后端data中的字段和这里的不一致，需要修改
// 响应成功处理，服务器返回2xx的HTTP状态码时会进入这里
function resResolve(response) {
  const { data, status, config, statusText, headers } = response
  if (headers['content-type']?.includes('json')) {
    if (SUCCESS_CODES.includes(data?.code)) {
      return Promise.resolve(data) // 直接返回data，方便后续处理
    }

    // 处理业务层面的错误，code不在成功范围内（HTTP状态是200(OK)，但业务code是1400）
    const code = data?.code ?? status // 优先使用后端返回的code，没有则使用HTTP状态码
    const needTip = config?.needTip !== false // 默认需要提示错误信息，除非请求配置了needTip为false
    const msg = resolveResError(code, data?.msg ?? statusText, needTip) // 根据code处理对应的操作，并返回处理后的message

    return Promise.reject({ code, msg, error: data ?? response })
  }
  return Promise.resolve(data ?? response)
}

// 请求错误处理，这种情况比较少见，通常发生在请求还没发出去就挂了，比如网络异常、跨域问题等
function reqReject(error) {
  return Promise.reject(error)
}

// 响应错误处理，服务器返回非2xx的HTTP状态码时会进入这里（Axios 原生层面的错误）
async function resReject(error) {
  if (!error || !error.response) {
    const code = error?.code
    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, error.message)
    return Promise.reject({ code, message, error })
  }

  const { data, status, config } = error.response
  const code = data?.code ?? status

  const needTip = config?.needTip !== false
  const message = resolveResError(code, data?.message ?? error.message, needTip)
  return Promise.reject({ code, message, error: error.response?.data || error.response })
}
