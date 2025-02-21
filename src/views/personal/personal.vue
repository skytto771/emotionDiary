<template>
  <div class="personal">
    <div class="personal_box">
      <div class="personal_avatar">
        <el-upload class="avatar_uploader" :show-file-list="false" :http-request="avatarUpload">
          <img v-if="defaultAvatar" class="avatar" :src="defaultAvatar" alt="用户头像" />
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
          <span>{{ personalInfo.username }}</span>
        </div>
        <div class="personal_info_item">
          <label>邮箱:</label>
          <span>{{ personalInfo.email }}</span>
        </div>
        <div class="personal_info_item">
          <label>注册日期:</label>
          <span>{{ personalInfo.registrationDate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import defaultAvatar from '@/static/img/defaultAvatar.jpg'

const { proxy } = getCurrentInstance()

const personalInfo = ref({})
const isEditInfo = ref(false)

function getUserInfo() {
  proxy.$http.get(proxy.$api.user.getUserInfo).then((res) => {
    personalInfo.value = res.data
  })
}

function avatarUpload() {
  console.log(123)
}

function editInfo() {
  isEditInfo.value = true
}
function cencelEditInfo() {
  isEditInfo.value = false
}
function confirmEditInfo() {
  isEditInfo.value = false
}

onMounted(() => {
  getUserInfo()
})
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
        padding: 10px 0;
        border-bottom: 1px solid var(--ed-border-color);

        label {
          color: var(--ed-light-text-color);
          font-weight: bold;
        }

        span {
          color: var(--ed-text-color);
        }
      }
    }
  }
}
</style>
