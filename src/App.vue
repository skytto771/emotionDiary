<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { RouterView } from 'vue-router'

const { proxy } = getCurrentInstance()
</script>

<style scoped lang="scss">
.app {
  width: 100vw;
  height: 100vh;
  background-color: var(--ed-background-color);
  color: var(--ed-text-color);
  font-size: 1.5;
}
</style>
