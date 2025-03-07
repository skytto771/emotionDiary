<template>
  <div class="personal">
    <div class="personal_box" v-loading="loading">
      <div class="personal_avatar">
        <el-upload class="avatar_uploader" :show-file-list="false" :http-request="avatarUpload">
          <img
            v-if="defaultAvatar"
            class="avatar"
            :src="
              globalStare.userObj.value['avatarUrl']
                ? globalStare.userObj.value['avatarUrl']
                : defaultAvatar
            "
            alt="用户头像"
          />
          <el-icon v-else class="avatar_uploader_icon"><Plus /></el-icon>
        </el-upload>
      </div>
      <div class="personal_header">
        <h2>个人信息</h2>
        <div class="edit_box" v-if="!isEditInfo">
          <button class="ed_button btn_basic" @click="editInfo">编辑信息</button>
        </div>
        <div class="editing_box" v-else>
          <button class="ed_button btn_basic" @click="cencelEditInfo">取消</button>
          <button class="ed_button btn_primary" @click="confirmEditInfo">确认</button>
        </div>
      </div>
      <div class="personal_info">
        <div class="personal_info_item">
          <label>用户名:</label>
          <div class="personal_info_item_inp">
            <span v-if="!isEditInfo">{{ globalStare.userObj.value['username'] }}</span>
            <input
              v-else
              class="ed_input"
              type="text"
              v-model="editPersonalInfo['username']"
              placeholder="请输入新用户名"
            />
          </div>
        </div>
        <div class="personal_info_item">
          <label>邮箱:</label>
          <div class="personal_info_item_inp">
            <span v-if="!isEditInfo">{{ globalStare.userObj.value['email'] }}</span>
            <input
              v-else
              class="ed_input"
              type="text"
              v-model="editPersonalInfo['email']"
              placeholder="请输入新邮箱"
            />
          </div>
        </div>
        <div class="personal_info_item">
          <label>账号:</label>
          <div class="personal_info_item_inp">
            <span>{{ globalStare.userObj.value['account'] }}</span>
          </div>
        </div>
        <div class="personal_info_item">
          <label>注册日期:</label>
          <div class="personal_info_item_inp">
            <span>{{ globalStare.userObj.value['registrationDate'] }}</span>
          </div>
        </div>
      </div>
      <div class="getAnalysis">
        <button class="ed_button btn_primary" @click="getAnalysisFuc">立即分析我的日记</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, inject } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/img/defaultAvatar.jpg'
import formatDate from '@/utils/tools/formatDate'

const { proxy } = getCurrentInstance()
const globalStare = inject('globalState')

const editPersonalInfo = ref({})
const isEditInfo = ref(false)
const loading = ref(false)

function getUserInfo() {
  proxy.$http.get(proxy.$api.user.getUserInfo).then((res) => {
    globalStare.userObj.value = res.data
    for (let key in res.data) {
      globalStare.userObj.value[key] = res.data[key]
      if (key == 'registrationDate') {
        globalStare.userObj.value[key] = formatDate(res.data[key])
      }
    }
  })
}

function avatarUpload(file) {
  console.log(file.file, 1321)
  // 上传文件到后端
  if (file.file.size > 1024 * 1024 * 3) {
    ElMessage.error('上传图片不能大于3M')
    return
  }
  fileUpload(file.file, file.file.size).then(async (res) => {
    const imgSrc = await getFileUrl(res.data.fileID)
    const obj = {
      avatarUrl: imgSrc,
      fileID: res.data.fileID,
    }
    proxy.$http.post(proxy.$api.user.uploadAvatar, { ...obj }).then((res) => {
      ElMessage.success('上传成功')
      getUserInfo()
    })
  })
}

function editInfo() {
  for (let key in globalStare.userObj.value) {
    editPersonalInfo.value[key] = globalStare.userObj.value[key]
  }
  isEditInfo.value = true
}
function cencelEditInfo() {
  isEditInfo.value = false
  editPersonalInfo.value = {}
}
function confirmEditInfo() {
  console.log()

  proxy.$http.post(proxy.$api.user.editUserInfo, { ...editPersonalInfo.value }).then((res) => {
    ElMessage.success('编辑成功')
    getUserInfo()
    isEditInfo.value = false
  })
}

// 文件上传
async function fileUpload(file, size) {
  if (size > 1024 * 1024 * 100) {
    ElMessage.error('上传文件不能大于100M')
    return
  }
  // 创建FormData对象并添加文件信息
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileName', file.name)
  formData.append('fileSize', file.size)
  formData.append('fileType', file.type)

  console.log(file, 'file')
  loading.value = true
  if (size / 1024 / 1024 < 3) {
    // 小文件上传
    return proxy.$http
      .post(proxy.$api.files.uploadSmallFile, formData)
      .then((res) => {
        loading.value = false
        return res
      })
      .catch((error) => {
        // 处理错误
        loading.value = false
        throw error // 或者返回一个自定义的错误信息
      })
  } else {
    // 大文件上传
    showProgress.value = true
    const chunkSize = 1024 * 1024 * 3 // 每个切片3MB
    const totalSlices = Math.ceil(size / chunkSize)

    const fileFormData = new FormData()
    fileFormData.append('file', file)
    fileFormData.append('fileName', file.name)
    fileFormData.append('fileSize', file.size)
    fileFormData.append('fileType', file.type)

    const startResponse = await proxy.$http.post(proxy.$api.files.startLUpload, fileFormData)
    const fileID = startResponse.data.fileID

    if (fileID) {
      for (let sliceIndex = 0; sliceIndex < totalSlices; sliceIndex++) {
        const start = sliceIndex * chunkSize
        const end = Math.min(start + chunkSize, size)
        const chunk = file.slice(start, end)

        const chunkFormData = new FormData()
        chunkFormData.append('file', chunk)
        chunkFormData.append('fileID', fileID)
        chunkFormData.append('sliceIndex', sliceIndex)
        chunkFormData.append('sliceSize', chunk.size) // 使用实际切片大小
        chunkFormData.append('totalSlices', totalSlices)

        try {
          // 上传切片，并等待其完成
          await proxy.$http.post(proxy.$api.files.uploadLargeFile, chunkFormData)
          progress.value = +(((sliceIndex + 1) / totalSlices) * 100).toFixed(0)
        } catch (error) {
          loading.value = false
          console.error(`Error uploading slice ${sliceIndex}:`, error)
          throw error // 抛出错误以便后续处理
        }
      }
      loading.value = false
      return startResponse
    }
  }
}

function getFileUrl(fileID) {
  return proxy.$http
    .post(proxy.$api.files.getFilePath, { fileID: fileID })
    .then((res) => {
      return res.data.fileURL
    })
    .catch((err) => {
      throw err
    })
}

function getAnalysisFuc() {
  loading.value = true
  // // 情感分析模型
  // proxy.$http
  //   .get(proxy.$api.report.getUseranalysis)
  //   .then((res) => {
  //     ElMessage.success('分析完成')
  //     loading.value = false
  //   })
  //   .catch((err) => {
  //     loading.value = false
  //   })

  // ai大模型
  proxy.$http
    .get(proxy.$api.report.getUseranalysisByAI)
    .then((res) => {
      ElMessage.success('分析完成')
      loading.value = false
    })
    .catch((err) => {
      loading.value = false
    })
}
</script>

<style lang="scss">
.personal {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .personal_box {
    padding: 20px;
    background-color: var(--ed-secondary-background-color);
    border-radius: 8px;
    box-shadow: var(--ed-primary-shadow);
    width: 600px;
    max-width: 100%;
    max-height: 100%;
    .personal_avatar {
      display: flex;
      justify-content: center;
      cursor: pointer;
      .avatar_uploader {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--el-border-color);
        border-radius: 50%;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
        &:hover {
          border-color: var(--el-color-primary);
        }
        .avatar {
          display: flex;
          width: 100px; // 头像宽度
          height: 100px; // 头像高度
          border-radius: 50%; // 圆形头像
        }
        .avatar_uploader_icon {
          width: 100px;
          height: 100px;
          svg {
            width: 80%;
            height: 80%;
          }
        }
      }
    }

    .personal_header {
      display: flex;
      align-items: center; // 使头像和标题垂直居中
      justify-content: space-between;
      margin-bottom: 20px;

      h2 {
        color: var(--ed-text-color);
        flex-grow: 1; // 使标题占据剩余空间
      }

      .edit_box {
        display: flex;
      }
      .editing_box {
        display: flex;
        gap: 6px;
      }
    }

    .personal_info {
      .personal_info_item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        border-bottom: 1px solid var(--ed-border-color);

        .personal_info_item_inp {
          display: flex;
        }

        input {
          border: 0;
          border-radius: 0;
          border-bottom: 1px solid var(--ed-border-color);
        }

        label {
          white-space: nowrap;
          color: var(--ed-light-text-color);
          font-weight: bold;
        }

        span {
          color: var(--ed-text-color);
        }
      }
    }

    .getAnalysis {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      margin-top: 12px;
      button {
        width: 100%;
      }
    }
  }
}
</style>
