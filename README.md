目录说明

```java
|-- .vscode                             // VS Code 编辑器配置
|   |-- extensions.json                 // 推荐安装的插件列表
|   |-- settings.json                   // 项目级别的编辑器设置
|-- build                               // 构建脚本与配置目录
|   |-- plugin-isme                     // 自定义构建插件
|   |   |-- icons.js                    // 获取图标名称列表
|   |   |-- page-paths.js               // 获取.vue文件路径列表
|   |   |-- index.js
|   |-- index.js                        // 提供两个方法供icon.js和page-paths.js使用
|-- node_modules                        // 依赖包目录 (通常无需修改)
|-- public                              // 静态资源目录 (打包时直接复制)
|-- src                                 // 源代码目录 (核心开发区域)
|   |-- api                             // API 接口管理
|   |   |-- index.js                    // API 统一配置和导出（写了前端需要用到的所有后端接口）
|   |-- assets                          // 静态资源目录
|   |   |-- icons                       // 图标资源
|   |   |   |-- feather
|   |   |   |-- isme
|   |   |   |-- dynamic-icons.js        // 动态图标加载配置
|   |   |-- images                      // 图片资源
|   |-- components                      // 公共组件目录
|   |   |-- common                      // 通用基础组件
|   |   |   |-- AppCard.vue             // 应用卡片组件
|   |   |   |-- AppPage.vue             // 应用页面容器组件
|   |   |   |-- CommonPage.vue          // 通用页面布局组件
|   |   |   |-- LayoutSetting.vue       // 页面右侧中间，布局设置组件
|   |   |   |-- TheFooter.vue           // 页脚组件
|   |   |   |-- TheLogo.vue             // 页面左上角，Logo（HIT）
|   |   |   |-- ThemeSetting.vue        // 顶栏中，主题色设置组件
|   |   |   |-- ToggleTheme.vue         // 顶栏中，主题切换组件
|   |   |   |-- index.js
|   |   |-- me
|   |   |   |-- crud
|   |   |   |   |-- index.vue           // 搜索+表格页面组件
|   |   |   |   |-- QueryItem.vue       // 查询项组件
|   |   |   |-- modal                   // 弹窗相关组件
|   |   |   |   |-- index.vue           // 弹窗组件
|   |   |   |-- utils.js                // 弹窗拖拽函数（服务index.vue）
|   |   |   |-- index.js
|   |   |-- index.js
|   |-- composables                     // 组合式函数 (Hooks)
|   |   |-- index.js
|   |   |-- useAliveData.js             // 数据保活函数
|   |   |-- useCrud.js                  // CRUD 逻辑封装函数
|   |   |-- useForm.js                  // 表单逻辑封装 Hook
|   |   |-- useModal.js                 // 弹窗逻辑封装 Hook
|   |-- directives
|   |   |-- index.js                    // 按钮级权限控制工具
|   |-- layouts                         // 布局组件
|   |   |-- components                  // 布局内部组件
|   |   |-- empty                       // 空白布局
|   |   |-- full                        // 全屏布局
|   |   |-- normal                      // 标准布局
|   |   |-- simple                      // 简洁布局
|   |-- router
|   |   |-- guards
|   |   |   |-- index.js                // 把其他四个守卫合成一个配置方法
|   |   |   |-- page-loading-guard.js   // 加载状态守卫
|   |   |   |-- page-title-guard.js     // 页面标题守卫
|   |   |   |-- permission-guard.js     // 权限验证守卫（重要）
|   |   |   |-- tab-guard.js            // Tab 标签页守卫
|   |   |-- basic-routes.js             // 基础路由配置
|   |   |-- index.js                    // 提供方法，供其他模块（main.js）配置路由使用
|   |-- store                           // 状态管理 (Pinia/Vuex)
|   |   |-- modules
|   |   |   |-- app.js                  // 应用全局状态
|   |   |   |-- auth.js                 // 认证授权状态
|   |   |   |-- index.js
|   |   |   |-- permission.js           // 权限状态
|   |   |   |-- router.js               // 路由状态
|   |   |   |-- tab.js                  // Tab 标签页状态
|   |   |   |-- user.js                 // 用户信息状态
|   |   |-- helper.js                   // 辅助函数（获取用户信息，获取角色权限）
|   |   |-- index.js                    // Store 入口文件
|   |-- styles                          // 全局样式
|   |   |-- global.css
|   |   |-- reset.css
|   |-- utils                           // 工具函数库
|   |   |-- http
|   |   |   |-- helplers.js             // 业务失败时，根据code封装不同的错误信息
|   |   |   |-- interceptors.js         // 实现拦截器逻辑（请求和响应在成功和失败时的处理）
|   |   |   |-- index.js                // 配置Axios对象（url前缀、超时时间、设置请求和响应拦截器）
|   |   |-- storage
|   |   |   |-- index.js                // 封装本地存储和会话存储的工厂函数，并导出两个单例对象
|   |   |   |-- storage.js              // 定义createStorage的工厂函数
|   |   |-- common.js                   // 通用工具函数
|   |   |-- index.js
|   |   |-- js.js                       // JS 相关工具函数
|   |   |-- naiveTools.js               // Naive UI 相关工具函数
|   |-- views                           // 页面视图组件
|   |   |-- base                        // 基础功能页面
|   |   |-- demo_upload                 // 图片上传页面
|   |   |-- error-page                  // 错误页面
|   |   |   |-- 403.vue                 // 403 禁止访问页面
|   |   |   |-- 404.vue                 // 404 未找到页面
|   |   |-- home                        // 首页
|   |   |-- iframe                      // 内嵌页面
|   |   |-- login                       // 登录页
|   |   |-- pms                         // 权限管理系统页面
|   |   |-- profile                     // 个人中心页面
|   |-- App.vue                         // 根组件
|   |-- main.js                         // 应用入口文件
|   |-- settings.js                     // 配置文件（各种常量）
|-- .editorconfig                       // 编辑器统一风格配置
|-- .env                                // 全局环境变量
|-- .env.development                    // 开发环境变量
|-- .env.production                     // 生产环境变量
|-- .gitignore                          // Git 忽略文件配置
|-- .npmrc                              // NPM 包管理器配置
|-- eslint.config.js                    // ESLint 代码检查配置
|-- index.html                          // HTML 入口模板
|-- jsconfig.json                       // JS 项目配置文件 (用于路径别名等)
|-- package-lock.json                   // 依赖版本锁定文件 (NPM)
|-- package.json                        // 项目元数据与依赖管理
|-- pnpm-lock.yaml                      // 依赖版本锁定文件 (PNPM)
|-- README.md                           // 项目说明文档
|-- uno.config.js                       // UnoCSS 原子化 CSS 配置
|-- vite.config.js                      // Vite 构建工具配置文件
```
