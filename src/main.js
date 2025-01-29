import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import baseFile from './utils/index'
import api from './api/api'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './static/style/main.css'
import { themeState } from './static/style/theme' // 导入主题状态

const app = createApp(App)

app.provide('themeState', themeState) // 使用 provide 使得主题状态可以在整个应用中访问

app.config.globalProperties.$http = baseFile.http
app.config.globalProperties.$session = baseFile.session

app.use(router).use(api).use(ElementPlus)

app.mount('#app')
