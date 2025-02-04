<template>
  <div class="calendar">
    <div class="calendar_box">
      <div class="calendar_header">
        <div class="calendar_header_pre" @click="changeMonthFuc(0)"><</div>
        <div class="calendar_header_text">{{ dateObj.year + '-' + dateObj.month }}</div>
        <div class="calendar_header_next" @click="changeMonthFuc(1)">></div>
      </div>
      <div class="calendar_body">
        <div class="theCalendar" ref="calendarRef">
          <div class="calendar_item_header">日</div>
          <div class="calendar_item_header">一</div>
          <div class="calendar_item_header">二</div>
          <div class="calendar_item_header">三</div>
          <div class="calendar_item_header">四</div>
          <div class="calendar_item_header">五</div>
          <div class="calendar_item_header">六</div>
          <div
            class="calendar_item_date"
            :style="{
              cursor: item.day ? 'pointer' : 'auto',
              backgroundColor: item.currentDate ? '#f7f7f7' : 'transparent',
            }"
            v-for="(item, index) in monthArr"
            :key="index"
            @click="toWritingFuc(item.diaryID)"
          >
            {{ item.day }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  getDiaries: Function,
})

const router = useRouter()
const calendarRef = ref(null)
const diaryList = ref([])

const dateObj = ref({
  year: '',
  month: '',
  day: '',
})

const monthArr = ref([
  {
    day: 1,
    diaryID: null,
    diaryEmotion: null,
  },
])

function getDate(value) {
  let date = new Date()
  if (value) {
    date = new Date(value)
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const seconde = date.getSeconds()
  return { year: year, month: month, day: day, hour: hour, minute: minute, seconde: seconde }
}
dateObj.value = { ...getDate() }

function getCalendar(year, month) {
  props.getDiaries().then((res) => {
    diaryList.value = res.data

    let calendarBlocks = 0
    // 初始化
    monthArr.value = []
    // 获取该月的天数
    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDay = new Date(year, month - 1, 1).getDay() // 获取该月第一天是星期几

    for (let i = 0; i < firstDay; i++) {
      calendarBlocks++
      const obj = {
        day: null,
        diaryID: null,
        diaryEmotion: null,
      }
      monthArr.value.push(obj)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const calendarDate = dateObj.value.year + '-' + dateObj.value.month + '-' + i
      function getDateString(date) {
        if (date) {
          const obj = getDate(date)
          return obj.year + '-' + obj.month + '-' + obj.day
        }
        const obj = getDate()
        return obj.year + '-' + obj.month + '-' + obj.day
      }
      if (diaryList.value.length > 0) {
        diaryList.value.forEach((item) => {
          if (getDateString(calendarDate) == getDateString(item.createdDate)) {
            calendarBlocks++
            const obj = {
              day: i,
              diaryID: item.diaryID,
              diaryEmotion: null,
              currentDate: getDateString(calendarDate) == getDateString(),
            }
            monthArr.value.push(obj)
          } else {
            calendarBlocks++
            const obj = {
              day: i,
              diaryID: null,
              diaryEmotion: null,
              currentDate: getDateString(calendarDate) == getDateString(),
            }
            monthArr.value.push(obj)
          }
        })
      } else {
        calendarBlocks++
        const obj = {
          day: i,
          diaryID: null,
          diaryEmotion: null,
          currentDate: getDateString(calendarDate) == getDateString(),
        }
        monthArr.value.push(obj)
      }
    }

    const finalBlocks = 7 - (calendarBlocks % 7)
    for (let i = 0; i < finalBlocks; i++) {
      const obj = {
        day: null,
        diaryID: null,
        diaryEmotion: null,
      }
      monthArr.value.push(obj)
    }
  })
}
getCalendar(dateObj.value.year, dateObj.value.month)

function changeMonthFuc(type) {
  if (type == 0) {
    const lastMonth = new Date(dateObj.value.year, dateObj.value.month - 2)
    dateObj.value = { ...getDate(lastMonth) }
    getCalendar(dateObj.value.year, dateObj.value.month)
  }
  if (type == 1) {
    const nextMonth = new Date(dateObj.value.year, dateObj.value.month)
    dateObj.value = { ...getDate(nextMonth) }
    getCalendar(dateObj.value.year, dateObj.value.month)
  }
}

function toWritingFuc(diaryID) {
  router.push({
    path: '/diaryList/diaryWriting',
    query: { diaryID: diaryID },
  })
}
</script>

<style scoped lang="scss">
.calendar {
  width: 100%;
  height: 100%;
  background-color: var(--ed-secondary-color);
  border-radius: 6px;
  .calendar_box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .calendar_header {
      display: flex;
      width: 100%;
      height: 50px;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      border: 1px solid var(--ed-border-color);
      border-bottom: 1px solid #303033;
      .calendar_header_pre,
      .calendar_header_next {
        width: 20px;
        height: 20px;
        cursor: pointer;
        user-select: none;
      }
      .calendar_header_text {
        font-size: 16px;
      }
    }
    .calendar_body {
      flex-grow: 1;
      width: 100%;
      .theCalendar {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: 1fr;
        & > div {
          display: flex;
          justify-content: center;
          align-items: center;
          border-right: 1px solid var(--ed-border-color);
          border-bottom: 1px solid var(--ed-border-color);
          box-sizing: border-box;
        }
        & > div:nth-child(7n-6) {
          border-left: 1px solid var(--ed-border-color);
        }
      }
    }
  }
}
</style>
