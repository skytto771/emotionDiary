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
    getUserInfo: joinBaseUrl('/getUserInfo'),
    editUserInfo: joinBaseUrl('/editUserInfo'),
    uploadAvatar: joinBaseUrl('/uploadAvatar'),
  },
  diary: {
    getDiaryCalendar: joinBaseUrl('/getDiaryCalendar'),
    getDiaryList: joinBaseUrl('/getDiaryList'),
    getDiaryDetail: joinBaseUrl('/getDiaryDetail'),
    addDiary: joinBaseUrl('/addDiary'),
    updateDiary: joinBaseUrl('/updateDiary'),
    deleteDiary: joinBaseUrl('/deleteDiary'),
    getAnalysis: joinBaseUrl('/getAnalysis'),
  },
  schedule: {
    getScheduleList: joinBaseUrl('/getScheduleList'),
    addSchedule: joinBaseUrl('/addSchedule'),
    editSchedule: joinBaseUrl('/editSchedule'),
    deleteSchedule: joinBaseUrl('/deleteSchedule'),
  },
  files: {
    uploadSmallFile: joinBaseUrl('/uploadSmallFile'),
    startLUpload: joinBaseUrl('/startLUpload'),
    uploadLargeFile: joinBaseUrl('/uploadLargeFile'),
    mergeFileSlices: joinBaseUrl('/mergeFileSlices'),
    getFilePath: joinBaseUrl('/getFilePath'),
  },
  report: {
    getUseranalysis: joinBaseUrl('/getUseranalysis'),
    getUseranalysisByAI: joinBaseUrl('/getUseranalysisByAI'),
    getUserEmotionData: joinBaseUrl('/getUserEmotionData'),
    getDiariesSuggestion: joinBaseUrl('/getDiariesSuggestion'),
  },
}

//注册组件
const install = function (Vue) {
  Vue.config.globalProperties.$api = api
}

export default { install }
