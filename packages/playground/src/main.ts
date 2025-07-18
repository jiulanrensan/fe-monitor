import { createSSRApp } from 'vue'
import { init } from '@fe-monitor/sdk'
const { regenerateSessionId, reportLog } = init({
  host: 'http://127.0.0.1:3001',
  report: '/report',
  pid: 'jz',
  aid: 'JXGFSC',
  uid: '1234567890',
  maxBreadcrumbs: 5,
  timeout: 1000,
  retryTimes: 3
})
setTimeout(() => {
  reportLog({
    content: 'testtesttesttest'
  })
}, 5000)
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
