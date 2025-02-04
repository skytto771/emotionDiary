<template>
  <div class="portalFw">
    <div class="portalFw_box">
      <div class="portalFw_left">
        <div class="portalFw_left_box">
          <div class="portalFw_left_logo">
            <img src="@/static/img/EDlogo.png" alt="" />
          </div>
          <div class="portalFw_left_title">情绪日记</div>
        </div>
      </div>
      <div class="portalFw_menu">
        <div class="menu">
          <div
            class="menu_item"
            v-for="(item, index) in menuList"
            :key="item.index"
            :class="{ menuActive: item.index == activeRoute }"
            @click="menuRouter(item.index)"
          >
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
      <div class="portalFw_right">
        <div class="portalFw_right_box">
          <div class="toggle_theme">
            <el-switch
              @change="toggleTheme"
              v-model="isDart"
              inline-prompt
              active-text="夜晚"
              inactive-text="白天"
            />
          </div>
          <el-dropdown class="avatar_dropdown">
            <div class="avatar_box">
              <div class="name">张三</div>
              <div class="avatar">
                <img src="@/static/img/imgError.png" alt="" />
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <template #default>
                    <span>个人中心</span>
                  </template>
                </el-dropdown-item>
                <el-dropdown-item divided @click="exitFuc">
                  <template #default>
                    <span class="exit">退出</span>
                  </template>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, getCurrentInstance, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const { proxy } = getCurrentInstance()

const isDart = ref(false)
const themeState = inject('themeState')
const activeRoute = ref(null)

const menuList = ref([
  {
    name: '日记',
    index: '/diaryList',
  },
  {
    name: '社区',
    index: '/community',
  },
])

function toggleTheme(val) {
  localStorage.setItem('ed_isDartTheme', JSON.stringify(val))
  themeState.setTheme(val)
  isDart.value = val
}

function exitFuc() {
  router.replace('/login')
  proxy.$session.delSession()
}

function menuRouter(path) {
  activeRoute.value = path
  router.push(path)
}

onMounted(() => {
  const isDartTheme_l = JSON.parse(localStorage.getItem('ed_isDartTheme'))
  if (isDartTheme_l) {
    themeState.setTheme(isDartTheme_l)
    isDart.value = isDartTheme_l
  }

  activeRoute.value = '/' + route.fullPath.trim().split('/')[1]
})
</script>

<style lang="scss">
.portalFw {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid var(--ed-border-color);
  .portalFw_box {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    .portalFw_left {
      .portalFw_left_box {
        display: flex;
        align-items: center;
      }
      .portalFw_left_logo {
        display: flex;
        align-items: center;
        width: 28px;
        height: 28px;
        margin-right: 8px;
        img {
          height: 100%;
        }
        .logo {
          width: 100%;
          fill: var(--logo-heart-color);
          .pen {
            fill: var(--logo-pen-color); /* 应用笔颜色 */
          }
          .wave {
            stroke: var(--logo-wave-color); /* 应用波浪线颜色 */
            stroke-linecap: round; /* 波浪线端点圆润 */
          }
        }
      }
      .portalFw_left_title {
        font-size: 18px;
        font-weight: 500;
      }
    }
    .portalFw_right {
      .portalFw_right_box {
        display: flex;
        align-items: center;
        & > div {
          padding: 0 6px;
        }
      }
      .toggle_theme {
        border-right: 1px solid var(--ed-border-color);
        box-sizing: border-box;
        :deep(.el-switch) {
          --el-switch-on-color: #34495e;
        }
      }
      .avatar_box {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding-right: 0 !important;
        outline: none;
        .name {
          color: var(--ed-text-color);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
    .portalFw_menu {
      height: 100%;
      .menu {
        height: 100%;
        display: flex;
        background-color: var(--ed-menu-background);
        .menu_item {
          display: flex;
          align-content: center;
          height: 100%;
          padding: 0 20px;
          color: var(--ed-text-color);
          cursor: pointer;
          transition: 0.3s all;
          &:hover {
            background-color: var(--ed-menu-item-hover);
            color: var(--ed-active-text-color);
          }
          span {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .menuActive {
          background-color: var(--ed-menu-item-hover);
          color: var(--ed-active-text-color);
        }
      }
    }
  }
}
</style>
