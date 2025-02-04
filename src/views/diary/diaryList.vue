<template>
  <div class="diaryList">
    <div class="diaryList_box">
      <div class="diaryList_calendar" v-if="diaryShowType == 'calendar'">
        <calendar :getDiaries="getDiaries" />
      </div>
      <div class="diaryList_dateLine" v-if="diaryShowType == 'dateLine'">
        <dateLine :getDiaries="getDiaries" />
      </div>
    </div>
    <div class="changeType">
      <div
        class="changeType_item"
        :class="{ changeType_itemActive: diaryShowType == 'calendar' }"
        @click="changeShowType('calendar')"
      >
        日历
      </div>
      <div
        class="changeType_item"
        :class="{ changeType_itemActive: diaryShowType == 'dateLine' }"
        @click="changeShowType('dateLine')"
      >
        时间线
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, getCurrentInstance } from 'vue'
import calendar from './component/calendar.vue'
import dateLine from './component/dateLine.vue'

const { proxy } = getCurrentInstance()

const diaryList = ref([])
const diaryShowType = ref('calendar')

function changeShowType(type) {
  diaryShowType.value = type
  localStorage.setItem('ed_diaryShowType', type)
}

function getDiaries() {
  const submitData = {
    startTime: null,
    endTime: null,
    diaryTitle: null,
  }
  return proxy.$http
    .post(proxy.$api.diary.getDiaries, { ...submitData })
    .then((res) => {
      diaryList.value = res.data
      return res
    })
    .catch((err) => {
      throw err
    })
}

onMounted(() => {
  const diaryShowType_l = localStorage.getItem('ed_diaryShowType')
  if (diaryShowType_l) {
    diaryShowType.value = diaryShowType_l
  }
})
</script>

<style scoped lang="scss">
.diaryList {
  width: 100%;
  height: 100%;
  position: relative;
  .diaryList_box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 12vh 0;
    .diaryList_calendar {
      width: 100%;
      height: 100%;
      max-width: 952px;
    }
    .diaryList_dateLine {
      width: 100%;
      height: 100%;
      max-width: 952px;
    }
  }
  .changeType {
    position: absolute;
    top: 10px;
    right: 30px;
    display: flex;
    gap: 20px;
    background-color: var(--ed-card-background);
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    .changeType_item {
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 3px;
      transition: background-color 0.3s;
      user-select: none;
      &:hover {
        background-color: var(--ed-card-hover-background);
      }
    }
    .changeType_itemActive {
      background-color: var(--ed-card-hover-background);
    }
  }
}
</style>
