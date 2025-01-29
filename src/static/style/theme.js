// 在一个单独的文件中，比如 theme.js
import { reactive } from 'vue'

export const themeState = reactive({
  isDark: false, // 初始主题状态
  setTheme(isDark) {
    this.isDark = isDark

    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
  },
})
