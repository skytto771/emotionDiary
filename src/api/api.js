let baseUrl = 'http://127.0.0.1:5000'
const joinBaseUrl = function (url) {
  return baseUrl + url
}

const api = {
  user: {
    register: joinBaseUrl('/register'),
    login: joinBaseUrl('/login'),
    forgotPassword: joinBaseUrl('/forgotPassword'),
    checkLogin: joinBaseUrl('/checkLogin'),
  },
  diary: {
    getDiaries: joinBaseUrl('/getDiaries'),
    getDiaryDetail: joinBaseUrl('/getDiaryDetail'),
    addDiary: joinBaseUrl('/addDiary'),
    updateDiary: joinBaseUrl('/updateDiary'),
    deleteDiary: joinBaseUrl('/deleteDiary'),
    getAnalysis: joinBaseUrl('/getAnalysis'),
  },
}

//注册组件
const install = function (Vue) {
  Vue.config.globalProperties.$api = api
}

export default { install }
