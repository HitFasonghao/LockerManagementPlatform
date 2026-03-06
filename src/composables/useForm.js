import { cloneDeep } from 'lodash-es'

export function useForm(initFormData = {}) {
  // 创建一个表单引用，用于获取表单实例
  const formRef = ref(null)
  // 创建响应式的表单数据模型，使用cloneDeep深拷贝，避免影响原始数据
  const formModel = ref(cloneDeep(initFormData))
  // 定义通用的表单验证规则
  const rules = {
    required: {
      required: true,
      message: '此为必填项',
      trigger: ['blur', 'change'],
    },
    phone: {
      pattern: /^1[3-9]\d{9}$/, // 匹配1开头，第二位3-9，后9位数字
      message: '请输入正确的中国大陆手机号',
      trigger: ['input', 'blur'],
    },
  }
  const validation = () => {
    return formRef.value?.validate()
  }
  return [formRef, formModel, validation, rules]
}
