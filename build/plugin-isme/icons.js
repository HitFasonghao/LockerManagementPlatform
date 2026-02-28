import { getIcons } from '..'

// 当vite打包时，插件会遍历调用所有resolveId方法来处理特定的模块ID，
// 当这个特殊的ID 与该模块的'isme:icons' 相同时，会返回一个以'\0'开头的特殊标识符，这样Vite就知道这是一个虚拟模块，不需要在文件系统中查找它。
// 然后，当Vite需要加载这个模块时，它会用这个以'\0'开头的特殊标识符去调用load方法，在这里返回一个包含所有图标名称的JavaScript代码字符串。
// 这样，就可以通过导入 'isme:icons' 来获取所有图标的名称列表。

const PLUGIN_ICONS_ID = 'isme:icons'
export function pluginIcons() {
  return {
    name: 'isme:icons',
    resolveId(id) {
      if (id === PLUGIN_ICONS_ID)
        return `\0${PLUGIN_ICONS_ID}`
    },
    load(id) {
      if (id === `\0${PLUGIN_ICONS_ID}`) {
        return `export default ${JSON.stringify(getIcons())}`
      }
    },
  }
}
