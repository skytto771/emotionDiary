<template>
  <div class="calendar">
    <div class="calendar_box">
      <div class="calendar_header">
        <div class="calendar_header_pre" @click="changeMonthFuc(0)">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="calendar_header_text">{{ dateObj.year + '-' + dateObj.month }}</div>
        <div class="calendar_header_next" @click="changeMonthFuc(1)">
          <el-icon><ArrowRight /></el-icon>
        </div>
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
            v-for="(item, index) in monthArr"
            :key="index"
            class="calendar_item_date"
            :class="{
              othersMonth: !item.isThisMonth,
            }"
            :style="{
              cursor: item.day ? 'pointer' : 'auto',
              border: item.currentDate
                ? '1px solid var(--ed-active-border-color)'
                : '1px solid var(--ed-border-color)',
              backgroundColor: getCalendarColor(item.diaryEmotion),
            }"
            @click="calendarDetail(item, 'sh')"
          >
            <div>{{ item.day }}</div>
            <div>{{ item.lunar }}</div>
          </div>
        </div>
        <!-- 右侧详情面板 -->
        <div class="calendar_detail_panel" v-if="calendarDetailVis">
          <div class="panel_content">
            <div class="calendar_info_date">
              <div class="detail_item">
                <span style="font-weight: 600; font-size: 18px"
                  >星期{{ dateDetail['week'] || '--' }}</span
                >
              </div>
              <div class="detail_item">
                <label>阳历：</label>
                <span>{{ dateDetail['solarDate'] || '--' }}</span>
              </div>
              <div class="detail_item">
                <label>阴历：</label>
                <span>{{ dateDetail['lunarDate'] || '--' }}</span>
              </div>
              <div class="detail_item" v-if="dateDetail['holiday']">
                <label>节日：</label>
                <span class="holiday">{{ dateDetail['holiday'] }}</span>
              </div>
              <div
                class="auspicious-taboo"
                v-if="dateDetail['lunarAuspicious'] || dateDetail['lunarTaboo']"
              >
                <div class="auspicious">
                  <div class="label">宜：</div>
                  <div class="items">{{ (dateDetail['lunarAuspicious'] || []).join(' ') }}</div>
                </div>
                <div class="taboo">
                  <div class="label">忌：</div>
                  <div class="items">{{ (dateDetail['lunarTaboo'] || []).join(' ') }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="panel-footer">
            <button class="ed_button btn_primary" @click="toWritingFuc()">编写日记</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Solar, Lunar, HolidayUtil, SolarUtil } from 'lunar-javascript'
import { ArrowRight, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const { proxy } = getCurrentInstance()
const calendarRef = ref(null)
const diaryList = ref([])
const calendarDetailVis = ref(false)
const lastDetailClick = ref('')

const dateDetail = ref({})

const dateObj = ref({
  year: '',
  month: '',
  day: '',
})

const monthArr = ref([])

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
  const thisMonth = `${year}-${month}`
  const daysInMonth = SolarUtil.getDaysOfMonth(year, month)
  // 上个月
  const isLastYear = month == 1
  const lastMonth = `${isLastYear ? year - 1 : year}-${isLastYear ? 12 : month - 1}`
  const daysInLastMon = SolarUtil.getDaysOfMonth(
    isLastYear ? year - 1 : year,
    isLastYear ? 12 : month - 1,
  )

  // 下个月
  const isNextYear = month == 12
  const nextMonth = `${isNextYear ? year + 1 : year}-${isNextYear ? 1 : month + 1}`
  const daysInNextMon = SolarUtil.getDaysOfMonth(
    isNextYear ? year + 1 : year,
    isNextYear ? 1 : month + 1,
  )

  const monthsObj = {
    1: '一月',
    2: '二月',
    3: '三月',
    4: '四月',
    5: '五月',
    6: '六月',
    7: '七月',
    8: '八月',
    9: '九月',
    10: '十月',
    11: '十一月',
    12: '十二月',
  }

  proxy.$http.post(proxy.$api.diary.getDiaryCalendar, { month: thisMonth }).then((res) => {
    diaryList.value = res.data

    let calendarBlocks = 0
    // 初始化
    monthArr.value = []
    // 获取该月的天数
    const firstDay = new Date(year, month - 1, 1).getDay() // 获取该月第一天是星期几

    for (let i = 0; i < firstDay; i++) {
      calendarBlocks++

      const lastDay = daysInLastMon - firstDay + i + 1
      const lastMonthDate = lastMonth + `-${lastDay}`
      const oriLunar = Lunar.fromDate(new Date(lastMonthDate)).getDayInChinese()
      const monthLunar = oriLunar == '初一' ? monthsObj[month - 1 == 0 ? 12 : month - 1] : oriLunar

      const obj = {
        date: lastMonthDate,
        day: lastDay,
        diaryID: null,
        diaryEmotion: null,
        lunar: monthLunar,
        isThisMonth: false,
      }

      monthArr.value.push(obj)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      calendarBlocks++

      const thisMonthDate = thisMonth + `-${i}`
      const calendarDate = `${dateObj.value.year}-${dateObj.value.month}-${i}`
      const isCurrentDate = getDateString(calendarDate) === getDateString()

      const oriLunar = Lunar.fromDate(new Date(thisMonthDate)).getDayInChinese()
      const monthLunar = oriLunar == '初一' ? monthsObj[month] : oriLunar

      // 创建基本对象
      const baseObj = {
        date: thisMonthDate,
        day: i,
        diaryEmotion: null,
        currentDate: isCurrentDate,
        lunar: monthLunar,
        isThisMonth: true,
      }

      if (isCurrentDate) {
        calendarDetail(baseObj)
      }

      if (diaryList.value.length > 0) {
        let hasDiary = false // 用于标识是否找到日记

        for (let key in diaryList.value) {
          if (getDateString(calendarDate) === getDateString(diaryList.value[key].createdDate)) {
            hasDiary = true // 找到对应的日记
            baseObj.diaryID = diaryList.value[key].diaryID
            baseObj.diaryEmotion = diaryList.value[key].tagID
            monthArr.value.push(baseObj)
            break // 找到后退出循环
          }
        }

        // 如果未找到对应的日记，添加默认对象
        if (!hasDiary) {
          baseObj.diaryID = null
          monthArr.value.push(baseObj)
        }
      } else {
        // 如果没有日记列表，则直接添加默认对象
        baseObj.diaryID = null
        monthArr.value.push(baseObj)
      }
    }

    const finalBlocks = 7 - (calendarBlocks % 7)
    for (let i = 0; i < finalBlocks; i++) {
      const nextDay = i + 1
      const nextMonthDate = nextMonth + `-${nextDay}`
      const oriLunar = Lunar.fromDate(new Date(nextMonthDate)).getDayInChinese()
      const monthLunar = oriLunar == '初一' ? monthsObj[month] : oriLunar

      const obj = {
        date: nextMonthDate,
        day: nextDay,
        diaryID: null,
        diaryEmotion: null,
        lunar: monthLunar,
        isThisMonth: false,
      }
      monthArr.value.push(obj)
    }
  })
}
getCalendar(dateObj.value.year, dateObj.value.month)

function getCalendarColor(tagID) {
  // 积极颜色
  // 绿色 (#28a745): 代表生长、健康和和平。
  // 蓝色 (#007bff): 传达信任、稳定和专业。
  // 黄色 (#ffc107): 通常与乐观、阳光和欢快相关联。
  // 橙色 (#fd7e14): 充满活力，通常与热情和创造力相联系。
  // 消极颜色
  // 红色 (#dc3545): 常用于警告，代表危险或紧急情况。
  // 灰色 (#6c757d): 可能表示无聊或消极的情绪。
  // 棕色 (#795548): 有时与悲伤和失落感联系在一起。
  // 黑色 (#343a40): 通常与权力和优雅相关，但也可能传达沉重或消极的感觉。
  if (tagID == 0) {
    return '#dc3545'
  } else if (tagID == 1) {
    return '#28a745'
  } else if (tagID == '-1') {
    return '#808080'
  }
}

function getDateString(date) {
  if (date) {
    const obj = getDate(date)
    return obj.year + '-' + obj.month + '-' + obj.day
  }
  const obj = getDate()
  return obj.year + '-' + obj.month + '-' + obj.day
}

function changeMonthFuc(type) {
  if (type == 0) {
    const lastMonth = new Date(dateObj.value.year, dateObj.value.month - 2)
    dateObj.value = { ...getDate(lastMonth) }
    console.log(dateObj.value)

    getCalendar(dateObj.value.year, dateObj.value.month)
  }
  if (type == 1) {
    const nextMonth = new Date(dateObj.value.year, dateObj.value.month)
    dateObj.value = { ...getDate(nextMonth) }
    console.log(dateObj.value)
    getCalendar(dateObj.value.year, dateObj.value.month)
  }
}

function calendarDetail(item, type) {
  if (type == 'sh') {
    const theDate = new Date(item.date).getTime()
    const lastDate = new Date(lastDetailClick.value).getTime()
    console.log(item.date)

    lastDetailClick.value = item.date
    if (theDate == lastDate) {
      calendarDetailVis.value = !calendarDetailVis.value
    } else {
      calendarDetailVis.value = true
    }
    console.log(calendarDetailVis.value)
  }
  dateDetail.value = {}

  if (!calendarDetailVis.value) return

  dateDetail.value['diaryID'] = item.diaryID

  const theDate = new Date(item.date)
  const solar = Solar.fromDate(new Date(item.date))
  console.log(item.date, new Date(item.date), solar.toString(), 74654)

  const lunar = Lunar.fromDate(new Date(item.date))

  const holiday = HolidayUtil.getHoliday(
    theDate.getFullYear(),
    theDate.getMonth() + 1,
    theDate.getDate(),
  )

  dateDetail.value['solarDate'] = solar.toString() // 阳历日期
  dateDetail.value['lunarDate'] = lunar.toString() // 阴历日期
  dateDetail.value['week'] = solar.getWeekInChinese() // 星期

  // 获取节假日
  if (holiday) dateDetail.value['holiday'] = holiday.getName()

  // 获取宜忌
  dateDetail.value['lunarAuspicious'] = lunar.getDayYi()
  dateDetail.value['lunarTaboo'] = lunar.getDayJi()
  calendarDetailVis.value = true
}

function toWritingFuc(diabled) {
  if (dateDetail.value['solarDate'] && !diabled) {
    console.log(dateDetail.value['diaryID'])

    router.push({
      path: '/diaryList/diaryWriting',
      query: { diaryID: dateDetail.value['diaryID'], date: dateDetail.value['solarDate'] },
    })
  }
}
</script>

<style scoped lang="scss">
.calendar {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--ed-background-color); // 更加清爽的背景色
  border-radius: 8px; // 略微加大圆角
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); // 提升阴影效果

  .calendar_box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .calendar_header {
      display: flex;
      width: 100%;
      height: 60px; // 稍微增高头部区域
      align-items: center;
      justify-content: space-between;
      padding: 0 30px; // 加大左右内边距
      background-color: var(--ed-header-background-color); // 更换背景色
      border-bottom: 2px solid var(--ed-border-color); // 增加分隔线的高度和厚度

      .calendar_header_pre,
      .calendar_header_next {
        width: 30px; // 拉大控件大小
        height: 30px;
        cursor: pointer;
        user-select: none;
        font-size: 20px; // 增大字体以增加可读性
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.3s; // 增加渐变效果
        &:hover {
          color: var(--ed-primary-color); // 鼠标悬停时颜色变化
        }
      }

      .calendar_header_text {
        font-size: 18px; // 增大日期字体
        font-weight: bold;
        color: var(--ed-primary-text-color);
      }
    }

    .calendar_body {
      display: flex;
      flex-grow: 1;
      width: 100%;

      .theCalendar {
        width: 100%;
        height: 100%;
        display: grid;
        padding: 16px; // 增加内边距
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: 1fr;
        grid-gap: 10px; // 提高格子之间的间距

        & > div {
          display: flex;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          border-radius: 10px; // 提高圆角
          transition: all 0.3s; // 增加过渡效果
          &:hover {
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); // 鼠标悬停效果
          }
        }

        .calendar_item_header {
          font-weight: 700; // 加粗星期的字体
          color: var(--ed-secondary-text-color);
          background-color: var(--ed-light-background-color); // 标头背景
          border-radius: 6px; // 加大圆角
          padding: 8px 0; // 给头部增加内边距
        }

        .calendar_item_date {
          position: relative;
          width: 100%;
          height: 100%;
          flex-direction: column;
          gap: 4px; // 减少元素之间的间距
          justify-content: center;
          align-items: center;

          &.othersMonth {
            color: var(--ed-light-text-color); // 其他月份的日期颜色
          }
        }
      }
    }
  }

  .calendar_detail_panel {
    position: relative;
    width: 350px; // 加宽面板
    margin-left: 10px;
    background: var(--ed-white-background-color); // 更清新的背景色
    border-radius: 10px; // 增加圆角
    display: flex;
    flex-direction: column;
    box-shadow: var(--ed-primary-shadow); // 降低阴影强度以增加柔和感

    .panel_content {
      flex: 1;
      padding: 20px; // 调整内边距
      overflow-y: auto;

      .detail_item {
        margin-bottom: 16px; // 提高项间距
        font-size: 16px; // 调整主内容字体大小

        label {
          color: var(--ed-secondary-text-color);
          margin-right: 10px; // 增加标签与文本之间的间距
        }

        .holiday {
          color: var(--ed-color-success);
          font-style: italic;
        }
      }

      .auspicious-taboo {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--ed-border-color-light);

        .label {
          color: var(--ed-secondary-text-color);
          font-size: 14px;
          margin-bottom: 4px;
          font-weight: bold; // 用粗体来强调标签
        }

        .items {
          font-size: 14px; // 增加字体大小
          line-height: 1.5; // 增加行间距
          color: var(--ed-primary-text-color);
        }
      }
    }

    .panel-footer {
      display: flex;
      justify-content: center;
      padding: 20px;
      border-top: 1px solid var(--ed-border-color-light);
    }
  }
}
</style>
