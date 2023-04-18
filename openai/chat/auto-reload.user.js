// ==UserScript==
// @author       Lete114
// @version      0.1
// @name         ChatGPT 错误自动刷新
// @description  (自用脚本) 报错自动刷新，并填充之前报错的提问内容
// @match        https://chat.openai.com/*
// @icon         https://chat.openai.com/favicon.ico
// @namespace    https://github.com/Lete114/my-tampermonkey-scripts
// ==/UserScript==

;(function () {
  'use strict'

  const $ = (Selector) => document.querySelector(Selector)
  const $$ = (Selector) => document.querySelectorAll(Selector)

  let key = 'ChatGPT_question_cache'

  window.addEventListener('load', () => {
    let value = sessionStorage.getItem(key)
    if (!value) return
    const id = setInterval(() => {
      let input = $('textarea')
      let mask = $$('.rounded-sm')
      if (!input || !(mask && mask.length)) return
      if (!input.value) input.value = value
      input.nextElementSibling.removeAttribute('disabled')
      // 如果需要自动提交就解开下方代码的注释
      // input.parentElement.querySelector('button').click()
      sessionStorage.setItem(key, '')
      clearInterval(id)
    }, 2000)
  })

  const id = setInterval(() => {
    let el = $$('.border-red-500')
    if (el && el.length) {
      // 灰色 div 容器（ChatGPT 回复）
      let ai = document.querySelectorAll('div.bg-gray-50')
      let last = ai[ai.length - 1]
      if (last.textContent) {
        sessionStorage.setItem(
          key,
          last.previousSibling.querySelector('.whitespace-pre-wrap').textContent
        )
        clearInterval(id)
        location.reload()
      }
    }
  }, 500)
})()
