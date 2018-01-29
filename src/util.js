/* istanbul ignore next */

import Vue from 'vue'

const isServer = Vue.prototype.$isServer
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const ieVersion = isServer ? 0 : Number(document.documentMode)

/* istanbul ignore next */
const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}
/* istanbul ignore next */
const camelCase = function (name) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1')
}

/* istanbul ignore next */
export const on = (function () {
  if (!isServer && document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
export const off = (function () {
  if (!isServer && document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
export const once = function (el, event, fn) {
  var listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/* istanbul ignore next */
export function hasClass (el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1)    { throw new Error('className should not contain space.') }
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/* istanbul ignore next */
export function addClass (el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName
      }
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

/* istanbul ignore next */
export function removeClass (el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ')
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

/* istanbul ignore next */
export const getStyle =
  ieVersion < 9
    ? function (element, styleName) {
      if (isServer) return
      if (!element || !styleName) return null
      styleName = camelCase(styleName)
      if (styleName === 'float') {
        styleName = 'styleFloat'
      }
      try {
        switch (styleName) {
          case 'opacity':
            try {
              return element.filters.item('alpha').opacity / 100
            } catch (e) {
              return 1.0
            }
          default:
            return element.style[styleName] || element.currentStyle
                ? element.currentStyle[styleName]
                : null
        }
      } catch (e) {
        return element.style[styleName]
      }
    }
    : function (element, styleName) {
      if (isServer) return
      if (!element || !styleName) return null
      styleName = camelCase(styleName)
      if (styleName === 'float') {
        styleName = 'cssFloat'
      }
      try {
        var computed = document.defaultView.getComputedStyle(element, '')
        return element.style[styleName] || computed
            ? computed[styleName]
            : null
      } catch (e) {
        return element.style[styleName]
      }
    }

/* istanbul ignore next */
export function setStyle (element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value)
        ? ''
        : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}

export function getScrollview (el) {
  let currentNode = el
  while (
    currentNode &&
    currentNode.tagName !== 'HTML' &&
    currentNode.tagName !== 'BODY' &&
    currentNode.nodeType === 1
  ) {
    let overflowY = document.defaultView.getComputedStyle(currentNode)
      .overflowY
    if (overflowY === 'scroll' || overflowY === 'auto') {
      return currentNode
    }
    currentNode = currentNode.parentNode
  }
  return window
}

export function checkInview (scrollView, el) {
  const contentHeight =
    scrollView == window ? document.body.offsetHeight : scrollView.offsetHeight
  const contentTop =
    scrollView === window ? 0 : scrollView.getBoundingClientRect().top

  const post = el.getBoundingClientRect().top - contentTop
  const posb = post + el.offsetHeight

  return (
    (post >= 0 && post < contentHeight) || (posb > 0 && posb <= contentHeight)
  )
}

export const isIOS = !!((window.navigator && window.navigator.userAgent) ||
  ''
).match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

export const pageScroll = (function () {
  const fn = function (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  let islock = false

  return {
    lock: function (el) {
      if (islock) return
      islock = true;
      (el || document).addEventListener('touchmove', fn)
    },
    unlock: function (el) {
      islock = false;
      (el || document).removeEventListener('touchmove', fn)
    }
  }
})()

//Copy from iView. https://www.iviewui.com/
export function scrollTop (el, from = 0, to, duration = 500) {
  if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function (callback) {
              return window.setTimeout(callback, 1000 / 60);
          }
      );
  }
  const difference = Math.abs(from - to);
  const step = Math.ceil(difference / duration * 50);

  function scroll(start, end, step) {
      if (start === end) return;

      let d = (start + step > end) ? end : start + step;
      if (start > end) {
          d = (start - step < end) ? end : start - step;
      }

      if (el === window) {
          window.scrollTo(d, d);
      } else {
          el.scrollTop = d;
      }
      window.requestAnimationFrame(() => scroll(d, end, step));
  }

  scroll(from, to, step);
};

export const isBoolean = val => typeof val === 'boolean'

export const isString = val => typeof val === 'string'

export const isNumber = val => typeof val === 'number'

export const isFunction = val => typeof val === 'function'

export const isDate = val =>
  Object.prototype.toString
  .call(val)
  .match(/^(\[object )(\w+)\]$/i)[2]
  .toLowerCase() === 'date'

export const isArray = Array.isArray

export const isObject = val => typeof val === 'object'
