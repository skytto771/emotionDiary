<template>
  <div class="login">
    <div class="login_box">
      <div class="login_card" v-if="islogin">
        <div class="login_title">欢迎登陆星空情绪日记</div>
        <el-form
          class="login_form"
          ref="loginRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="auto"
        >
          <el-form-item label="账号/邮箱" prop="loginAccount">
            <el-input
              @keydown.enter="confirmLoginFuc"
              v-model="loginForm.loginAccount"
              placeholder="请输入账号/邮箱"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              @keydown.enter="confirmLoginFuc"
              type="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
            />
          </el-form-item>
        </el-form>
        <div class="form_btnBox">
          <el-button type="primary" @click="confirmLoginFuc">登录</el-button>
          <el-button @click="islogin = false">没有账号？前往注册</el-button>
        </div>
      </div>
      <div class="register_card" v-else>
        <div class="register_title">欢迎注册星空情绪日记</div>
        <el-form
          class="register_form"
          ref="registerRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="80"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="账号" prop="account">
            <el-input v-model="registerForm.account" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="conPassword">
            <el-input v-model="registerForm.conPassword" placeholder="请再次输入密码" />
          </el-form-item>
        </el-form>
        <div class="form_btnBox">
          <el-button type="primary" @click="confirmRegisterFuc">注册</el-button>
          <el-button @click="islogin = true">前往登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()

const islogin = ref(true)
const registerRef = ref(null)
const loginRef = ref(null)

const loginForm = ref({
  loginAccount: '',
  password: '',
})
const registerForm = ref({
  username: '',
  account: null,
  email: '',
  password: '',
  conPassword: '',
})

const accountVD = (rules, value, callback) => {
  const regex = /^.{6,}$/
  if (!regex.test(value)) {
    callback(new Error('请输入至少六位数的账号'))
  } else {
    callback()
  }
}

const emailVD = (rules, value, callback) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!regex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const passwordVD = (rules, value, callback) => {
  const regex =
    /^(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z\d])|(?=.*\d)(?=.*[^A-Za-z\d]))[A-Za-z\d^]*.{8,}$/
  if (!regex.test(value)) {
    callback(new Error('请输入至少八位数，且拥有两种格式的密码'))
  } else {
    callback()
  }
}

const conPasswordVD = (rules, value, callback) => {
  if (value != registerForm.value.password) {
    callback(new Error('两次密码不一致'))
  } else [callback()]
}

const loginRules = {
  loginAccount: [{ required: true, message: '请输入账号/邮箱', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: passwordVD, trigger: 'blur' },
  ],
}

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { validator: accountVD, trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: emailVD, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: passwordVD, trigger: 'blur' },
  ],
  conPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: conPasswordVD, trigger: 'blur' },
  ],
}

const confirmRegisterFuc = async () => {
  await registerRef.value.validate()
  proxy.$http.post(proxy.$api.user.register, { ...registerForm.value }).then((res) => {
    ElMessage.success(res.message)
    registerRef.value.resetFields()
    islogin.value = true
  })
}

const confirmLoginFuc = async () => {
  await loginRef.value.validate()
  proxy.$http.post(proxy.$api.user.login, { ...loginForm.value }).then((res) => {
    ElMessage.success(res.message)
    console.log(res)
    proxy.$session.setSession(res.token)
    loginRef.value.resetFields()
    router.push('/')
  })
}
</script>

<style lang="scss" scoped>
.login {
  width: 100vw;
  height: 100vh;
  .login_box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    overflow: scroll;
    background: url('@/assets/img/loginBG.png') no-repeat;
    .login_card,
    .register_card {
      width: 100%;
      max-width: 460px;
      margin-top: 160px;
      height: fit-content;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 2px 8px 16px rgb(218, 216, 216);
      background-color: #ffffffbb;
      .form_btnBox {
        display: flex;
        width: 100%;
        align-items: center;
        flex-direction: column;
        gap: 12px;
        .el-button {
          margin: 0;
        }
        button {
          width: 100%;
        }
      }
    }
    .login_card {
      .login_title {
        display: flex;
        justify-content: center;
        font-size: 18px;
        font-weight: 600;
      }
      :deep(.el-form) {
        margin-top: 16px;
      }
    }
    .register_card {
      .register_title {
        display: flex;
        justify-content: center;
        font-size: 18px;
        font-weight: 600;
      }
      :deep(.el-form) {
        margin-top: 16px;
        .register_form_btnBox {
          .el-form-item__content {
            align-items: center;
            flex-direction: column;
            gap: 12px;
            .el-button {
              margin: 0;
            }
            button {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
