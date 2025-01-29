<template>
  <div class="portalFw">
    <div class="portalFw_box">
      <div class="portalFw_left">
        <div class="portalFw_left_box">
          <div class="portalFw_left_title">情绪日记</div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const isDart = ref(false)
const themeState = inject('themeState')

function toggleTheme() {
  themeState.setTheme(isDart)
}
</script>

<style lang="scss">
.portalFw {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid var(--ed-border-color);
  .portalFw_box {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    .portalFw_left {
    }
    .portalFw_right {
      .toggle_theme {
        :deep(.el-switch) {
          --el-switch-on-color: #34495e;
        }
      }
    }
  }
}
</style>
