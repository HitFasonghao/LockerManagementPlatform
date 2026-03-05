import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  formatters: true,
  stylistic: true,
  rules: {
    'n/prefer-global/process': 'off',
    'no-undef': 'error',
    'no-fallthrough': 'off',
    'vue/block-order': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-unused-vars': 'off', // 关闭 ESLint 的 no-unused-vars 规则，交由 eslint-plugin-unused-imports 处理未使用的变量和导入
    'unused-imports/no-unused-vars': 'off', // 关闭 eslint-plugin-unused-imports 的 no-unused-vars 规则，交由 ESLint 处理未使用的变量（但不处理未使用的导入）
  },
  languageOptions: {
    globals: {
      h: 'readonly',
      unref: 'readonly',
      provide: 'readonly',
      inject: 'readonly',
      markRaw: 'readonly',
      defineAsyncComponent: 'readonly',
      nextTick: 'readonly',
      useRoute: 'readonly',
      useRouter: 'readonly',
      Message: 'readonly',
      $loadingBar: 'readonly',
      $message: 'readonly',
      $dialog: 'readonly',
      $notification: 'readonly',
      $modal: 'readonly',
    },
  },
})
