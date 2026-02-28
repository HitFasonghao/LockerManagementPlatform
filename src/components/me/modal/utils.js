// 拖拽
// @param {HTMLElement} bar - 触发拖动的元素，通常是模态框的标题栏
// @param {HTMLElement} box - 被拖动的元素，通常是模态框的容器
export function initDrag(bar, box) {
  if (!bar || !box)
    return // 不存在，直接返回

  const params = {
    left: 0,
    top: 0,
    currentX: 0,
    currentY: 0,
    flag: false,
  }

  // 获取元素的初始left和top值
  if (getCss(box, 'left') !== 'auto') {
    params.left = getCss(box, 'left')
  }
  if (getCss(box, 'top') !== 'auto') {
    params.top = getCss(box, 'top')
  }

  // 设置触发拖动元素的鼠标样式为移动图标
  bar.style.cursor = 'move'
  // 鼠标按下事件处理函数
  bar.onmousedown = function (e) {
    params.flag = true // 设置拖拽标志为true
    e.preventDefault() // 阻止默认事件
    params.currentX = e.clientX // 鼠标当前位置的X坐标
    params.currentY = e.clientY // 鼠标当前位置的Y坐标
  }
  // 鼠标松开事件处理函数
  document.onmouseup = function () {
    params.flag = false // 设置拖拽标志为false
    if (getCss(box, 'left') !== 'auto') {
      params.left = getCss(box, 'left')
    }
    if (getCss(box, 'top') !== 'auto') {
      params.top = getCss(box, 'top')
    }
  }
  // 鼠标移动事件处理函数
  document.onmousemove = function (e) {
    // 如果鼠标事件的目标不是触发拖动的元素，并且拖动标志为false，直接返回
    if (e.target !== bar && !params.flag)
      return

    e.preventDefault() // 阻止默认事件
    // 如果拖拽标志为true
    if (params.flag) {
      const nowX = e.clientX // 鼠标当前位置的X坐标
      const nowY = e.clientY // 鼠标当前位置的Y坐标
      const disX = nowX - params.currentX // 鼠标移动的X距离
      const disY = nowY - params.currentY // 鼠标移动的Y距离

      const left = Number.parseInt(params.left) + disX // 盒子元素的新left值
      const top = Number.parseInt(params.top) + disY // 盒子元素的新top值

      box.style.left = `${left}px`
      box.style.top = `${top}px`
    }
  }
}

// 获取元素的CSS样式
function getCss(element, key) {
  return element.currentStyle
    ? element.currentStyle[key]
    : window.getComputedStyle(element, null)[key]
}
