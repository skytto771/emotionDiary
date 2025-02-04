import axios from 'axios'
import session from '../session/index'
import { ElMessage } from 'element-plus'

var axiosObj = axios.create({
  withCredentials: true /* 跨域时携带cookie */,
})

/*Http请求拦截器默认以json格式请求*/
axiosObj.interceptors.request.use(
  (config) => {
    var token = session.getToken()

    config.headers.Authorization = token /*设置默认请求头*/
    config.timeout = 120000 /*设置请求超时时间为2分钟*/
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/*Http响应拦截器*/
axiosObj.interceptors.response.use(
  (response) => {
    var resData = response.data

    //流文件不处理
    if (response.headers['content-type'] == 'application/octet-stream') {
      return resData
    }

    var code = resData.code
    var msg = resData.message || '未知错误'

    if (code === 'SUCCESS') {
      return resData
    }

    return Promise.reject(code) //在catch中可以捕捉，根据code处理对应的异常
  },
  (error) => {
    var resData = error.response.data

    var code = resData.code
    var msg = resData.message || '未知错误'

    if (code === 'NOT_LOGIN') {
      ElMessage({ showClose: true, message: '请先登录', type: 'error' })

      session.delSession()
      window.location.href = window.location.href.split('/#/')[0] + '/#/pub/login' //跳转到登录页
    } else if (code === 'NO_AUTH') {
      ElMessage.error('您没有权限')
    } else if (code === 'PARAM_ERROR') {
      ElMessage.error('参数错误:' + msg)
    } else if (code === 'TYPECAST_ERROR') {
      ElMessage.error('类型转换错误:' + msg)
    } else if (code === 'EXCEPTION') {
      ElMessage.error('未知错误！')
    } else {
      //自定义错误代码
      ElMessage.error(msg)
    }

    return Promise.reject(error)
  },
)

/* 定义formdata格式请求 */
axiosObj.formDataPost = (url, params) => {
  return axios({
    method: 'post',
    url: url,
    data: params,
    transformRequest: [
      function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'))
        return ret
      },
    ],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

/*导出axios实例给入口统一注册到vue中*/
export default axiosObj
