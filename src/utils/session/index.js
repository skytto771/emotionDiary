const session = {
  sessionName: 'QS3MGT_SESSION',
  timeout: 20, //设置本地session过期时间,单位为分钟
  /* 获取token */
  getToken: function () {
    var sessionData = this.getSession()

    if (sessionData != null) {
      return sessionData.accesstoken || sessionData.token
    } else {
      return ''
    }
  },
  /* 获取 */
  getSession: function () {
    var data = localStorage.getItem(this.sessionName)
    var session = JSON.parse(data)
    return session
  },
  /* 设置session*/
  setSession: function (session) {
    var data = JSON.stringify(session)
    localStorage.setItem(this.sessionName, data)
  },
  /* 删除本地session */
  delSession: function () {
    localStorage.removeItem(this.sessionName)
  },
  /* 设置sessionName */
  //   setSessionName:function(name){
  //       sessionObj.sessionName = name;
  // },

  /**访问服务器接口，判断是否登录 */
  isLogin: function () {},
}

export default session
