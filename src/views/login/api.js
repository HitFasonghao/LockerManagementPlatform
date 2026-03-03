import { request } from '@/utils'

export default {
  toggleRole: data => request.post('/auth/role/toggle', data),
  getUser: () => request.get('/user/detail'),
  loginByPassword: data => request.post('/login/loginByPassword', data, { needToken: false }),
  loginBySmsCode: data => request.post('/login/loginBySmsCode', data, { needToken: false }),
  sendSmsCode: data => request.post('/login/smsCode', data, { needToken: false }),
  getCaptcha: () => request.get('/login/captcha', { needToken: false }),
}
