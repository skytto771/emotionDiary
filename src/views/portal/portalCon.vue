<template>
  <div class="portalCon">
    <div class="portalCon_box">
      <div class="portalFw"><portalFw :userObj="userObj"></portalFw></div>
      <div class="portal_main">
        <div class="portal_main_right"><RouterView /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import portalFw from './portalFw.vue'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const userObj = ref({})

onMounted(() => {
  proxy.$http
    .get(proxy.$api.user.checkLogin)
    .then((res) => {
      console.log(res)
      userObj.value = res.data
    })
    .catch((err) => {
      if (err.response.data.code == 'NOT_LOGIN') {
        router.replace('/login')
      }
    })
})
</script>

<style lang="scss">
.portalCon {
  width: 100%;
  height: 100%;
  .portalCon_box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .portalFw {
      width: 100%;
      height: 50px;
    }
    .portal_main {
      width: 100%;
      height: calc(100% - 50px);
      display: flex;
      .portal_main_left {
        width: fit-content;
        height: 100%;
      }
      .portal_main_right {
        flex-grow: 1;
      }
    }
  }
}
</style>
