<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, getCurrentInstance } from 'vue'
import { RouterView } from 'vue-router'

const { proxy } = getCurrentInstance()
</script>

<style scoped lang="scss">
.app {
  width: 100vw;
  height: 100vh;
  background-color: var(--ed-background-color);
  color: var(--ed-text-color);
}
</style>
