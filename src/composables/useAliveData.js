// 当用户离开一个被 <keep-alive> 缓存的页面（组件）时，自动保存该页面的表单数据或查询条件；
// 当用户再次返回该页面时，自动恢复之前的数据状态，而不是重置为初始值。

const lastDataMap = new Map()
export function useAliveData(initData = {}, key) {
  key = key ?? useRoute().name // 默认使用路由名称作为key
  const lastData = lastDataMap.get(key) // 先去 lastDataMap 里找有没有这个页面之前存过的数据
  const aliveData = ref(lastData || { ...initData }) // 没有就用初始值

  watch(
    aliveData,
    (v) => {
      lastDataMap.set(key, v) // 每次 aliveData 变化时，更新 lastDataMap 中对应 key 的数据
    },
    { deep: true }, // 深度监听，确保对象内部属性的变化也能被捕捉到并保存
  )

  return {
    aliveData,
    reset() { // 程序员手动重置方法
      aliveData.value = { ...initData }
      lastDataMap.delete(key)
    },
  }
}
