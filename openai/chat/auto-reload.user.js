// ==UserScript==
// @author       Lete114
// @version      0.1
// @name         ChatGPT 错误自动刷新
// @description  (自用脚本) 报错自动刷新，并填充之前报错的提问内容，保活
// @match        https://chat.openai.com/*
// @icon         https://chat.openai.com/favicon.ico
// @namespace    https://github.com/Lete114/my-tampermonkey-scripts
// @grant        GM_registerMenuCommand
// ==/UserScript==

;(function () {
  'use strict'

  const $ = (Selector) => document.querySelector(Selector)
  const $$ = (Selector) => document.querySelectorAll(Selector)

  const key = 'ChatGPT_question_cache'
  const activateURL = 'https://chat.openai.com/api/auth/session'
  const activateSecond = Number(localStorage.getItem('activateSecond')) || 60

  let activateTimer = activateChatGPT(activateSecond)
  let isCatch = false
  function activateChatGPT(ms) {
    return setInterval(() => {
      fetch(activateURL).catch(() => {
        clearInterval(activateTimer)
        // 请求错误时重试 1 次
        // 如果重试后依然错误，则重新加载页面
        if (isCatch) return location.reload()
        isCatch = true
        activateTimer = activateChatGPT(ms)
      })
    }, ms * 1000)
  }

  const promptString = '自定义激活时间(单位秒)'
  GM_registerMenuCommand(promptString, function () {
    const second = Number(window.prompt(promptString, activateSecond))
    if (second) {
      clearInterval(activateTimer)
      localStorage.setItem('activateSecond', second)
      activateTimer = activateChatGPT(second)
    }
  })

  window.addEventListener('load', () => {
    const value = sessionStorage.getItem(key)
    if (!value) return
    const id = setInterval(() => {
      const input = $('textarea')
      const mask = $$('.rounded-sm')
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
    const el = $$('.border-red-500')
    if (el && el.length) {
      // 灰色 div 容器（ChatGPT 回复）
      const ai = document.querySelectorAll('div.bg-gray-50')
      const last = ai[ai.length - 1]
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
