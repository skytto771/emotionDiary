<template>
  <div class="schedule">
    <div class="schedule_box">
      <div class="schedule_header">
        <div class="schedule_header_filter">
          <el-select v-model="filter['status']" placeholder="选择状态">
            <el-option
              v-for="(status, index) in scheduleStatus"
              :key="index"
              :label="status.name"
              :value="index"
            >
            </el-option>
          </el-select>
        </div>
        <div class="schedule_header_title">我的日程</div>
        <div class="schedule_header_add">
          <button class="ed_button btn_primary" @click="createNewSchedule">新增日程</button>
        </div>
      </div>
      <el-scrollbar
        style="flex: 1; height: 0"
        @scroll="scrollList"
        ref="scrollBarRef"
        v-loading="scrollLoading"
      >
        <div class="schedule_list" v-if="scheduleList.length != 0">
          <div
            class="schedule_list_item"
            v-for="(item, index) in scheduleList"
            :key="item.scheduleID"
            @click="editSchedule(item)"
          >
            <div class="schedule_list_item_left">
              <div class="schedule_item_title">{{ item.title }}</div>
              <div class="schedule_item_contain">{{ item.description }}</div>
              <div class="schedule_item_status">
                状态：
                <span :style="{ color: scheduleStatus[item.status].color }">
                  {{ scheduleStatus[item.status].name }}
                </span>
              </div>
              <div class="schedule_item_date">开始时间：{{ item.start_time }}</div>
              <div class="schedule_item_date">结束时间：{{ item.end_time }}</div>
            </div>
            <div class="schedule_list_item_right" @click.stop>
              <button class="ed_button btn_warning" @click="delSchedule(item.scheduleID)">
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </div>
        </div>
        <div class="schedule_list" v-else>暂无日程</div>
      </el-scrollbar>
    </div>
    <div class="schedule_detail">
      <el-dialog v-model="scheduleDialogVis" width="500">
        <template #title>
          <div class="schedule_info_title">{{ isAddSchedule ? '新增日程' : '编辑日程' }}</div>
        </template>
        <template #default>
          <div class="schedule_info">
            <div class="schedule_info_body">
              <div class="schedule_info_body_item">
                <div class="schedule_info_body_item_label">标题</div>
                <div class="schedule_info_body_item_inp">
                  <input
                    v-model="scheduleForm['title']"
                    class="ed_input"
                    type="text"
                    placeholder="输入标题"
                  />
                </div>
              </div>
              <div class="schedule_info_body_item">
                <div class="schedule_info_body_item_label" style="align-items: flex-start">
                  描述
                </div>
                <div class="schedule_info_body_item_inp">
                  <textarea
                    v-model="scheduleForm['description']"
                    class="ed_textarea"
                    rows="4"
                    placeholder="输入描述"
                  ></textarea>
                </div>
              </div>
              <div class="schedule_info_body_item">
                <div class="schedule_info_body_item_label">开始时间</div>
                <div class="schedule_info_body_item_inp">
                  <el-date-picker
                    v-model="scheduleForm['start_time']"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择开始时间"
                  />
                </div>
              </div>
              <div class="schedule_info_body_item">
                <div class="schedule_info_body_item_label">结束时间</div>
                <div class="schedule_info_body_item_inp">
                  <el-date-picker
                    v-model="scheduleForm['end_time']"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择结束时间"
                  />
                </div>
              </div>
              <div class="schedule_info_body_item">
                <div class="schedule_info_body_item_label">是否全天</div>
                <div class="schedule_info_body_item_inp">
                  <el-switch v-model="scheduleForm['is_all_day']" />
                </div>
              </div>
              <div class="schedule_info_body_item">
                <div class="schedule_info_body_item_label">提醒时间</div>
                <div class="schedule_info_body_item_inp">
                  <el-date-picker
                    v-model="scheduleForm['reminder_time']"
                    type="datetime"
                    placeholder="选择提醒时间"
                  />
                </div>
              </div>
              <div class="schedule_info_body_item">
                <div class="schedule_info_body_item_label">是否重复</div>
                <div class="schedule_info_body_item_inp">
                  <el-switch v-model="scheduleForm['is_repeat']" />
                </div>
              </div>
              <div class="schedule_info_body_item" v-if="scheduleForm['is_repeat']">
                <div class="schedule_info_body_item_label">重复周期</div>
                <div class="schedule_info_body_item_inp">
                  <select v-model="scheduleForm['repeat_rule']" class="ed_select">
                    <option value="0">不重复</option>
                    <option value="1">每天</option>
                    <option value="2">每周</option>
                    <option value="3">每月</option>
                    <option value="4">每年</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="schedule_info_footer">
            <button class="ed_button btn_basic" @click="cencelSubmitSchedule">取消</button>
            <button class="ed_button btn_primary" type="primary" @click="confirmSubmitSchedule">
              {{ isAddSchedule ? '确认新增' : '确认编辑' }}
            </button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, watch } from 'vue'
import { Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()

const router = useRouter()
const scrollBarRef = ref(null)
const scrollLoading = ref(false)
const scheduleDialogVis = ref(false)
const isAddSchedule = ref(true)

let scrollTimer = null

const filter = ref({
  status: '-1',
})

const pageSetting = ref({
  pageCur: 1,
  pageSize: 10,
  total: 0,
  title: null,
})

const scheduleStatus = ref({
  '-1': { name: '全部', color: '#000000' },
  0: { name: '未开始', color: '#FFA500' },
  1: { name: '进行中', color: '#00FF00' },
  2: { name: '已结束', color: '#FF0000' },
})

const scheduleForm = ref({})

const scheduleList = ref([])

watch(
  () => filter.value,
  () => {
    pageSetting.value.pageCur = 1
    getScheduleList()
  },
  { deep: true },
)

function getScheduleList() {
  const submit = { ...filter.value, ...pageSetting.value }
  if (submit['status'] || submit['status'] == 0) {
    submit['status'] = Number(submit['status'])
  }
  if (submit['status'] == '-1') {
    submit['status'] = null
  }

  proxy.$http.post(proxy.$api.schedule.getScheduleList, submit).then((res) => {
    pageSetting.value.total = res.total
    const schedules = res.data.map((item) => {
      item.is_all_day = item.is_all_day == 0 ? false : true
      item['is_repeat'] = item.repeat_rule != 0
      return item
    })
    scheduleList.value = schedules
  })
}
getScheduleList()

function scrollList(scroll) {
  const scrollEle = scrollBarRef.value.wrapRef
  const isBottom = scrollEle.scrollHeight - scroll.scrollTop - 1 <= scrollEle.clientHeight
  if (isBottom && scheduleList.value.length < pageSetting.value.total) {
    if (scrollTimer) return
    scrollLoading.value = true
    scrollTimer = setTimeout(() => {
      pageSetting.value.pageCur++
      proxy.$http
        .post(proxy.$api.schedule.getScheduleList, { ...pageSetting.value })
        .then((res) => {
          pageSetting.value.total = res.total
          const schedules = res.data.map((item) => {
            item.is_all_day = item.is_all_day == 0 ? false : true
            item['is_repeat'] = item.repeat_rule != 0
            return item
          })
          scheduleList.value = [...scheduleList.value, ...schedules]
        })
      scrollLoading.value = false
    }, 500)
  }
}

function editSchedule(scheduleItem) {
  isAddSchedule.value = false
  scheduleForm.value = { ...scheduleItem }
  scheduleDialogVis.value = true
}

function getThirtyDays() {
  const date = new Date()
}

function createNewSchedule() {
  const date = new Date().toISOString()
  const cDate = date.split('T')[0]
  scheduleForm.value = {}
  isAddSchedule.value = true
  scheduleDialogVis.value = true
}

function confirmSubmitSchedule() {
  const submit = { ...scheduleForm.value }
  console.log(isAddSchedule.value)

  if (isAddSchedule.value == true) {
    proxy.$http.post(proxy.$api.schedule.addSchedule, submit).then((res) => {
      getScheduleList()
      scheduleDialogVis.value = false
      scheduleForm.value = {}
    })
  } else {
    proxy.$http.post(proxy.$api.schedule.editSchedule, submit).then((res) => {
      getScheduleList()
      scheduleDialogVis.value = false
      scheduleForm.value = {}
    })
  }
}

function cencelSubmitSchedule() {
  scheduleDialogVis.value = false
  scheduleForm.value = {}
}

function delSchedule(scheduleID) {
  ElMessageBox.confirm('此操作将永久删除该日程, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    proxy.$http.post(proxy.$api.schedule.deleteSchedule, { scheduleID: scheduleID }).then((res) => {
      getScheduleList()
    })
  })
}

function hiddenFilter() {
  const filter = document.querySelector('.schedule_filter')
  const hidden = document.querySelector('.filter_hidden')
  const show = document.querySelector('.filter_show')
  filter.style.height = '0'
  filter.style.display = 'none'
  hidden.style.display = 'none'
  show.style.display = 'flex'
}

function showFilter() {
  const filter = document.querySelector('.schedule_filter')
  const hidden = document.querySelector('.filter_hidden')
  const show = document.querySelector('.filter_show')
  filter.style.height = 'fit-content'
  filter.style.display = 'flex'
  hidden.style.display = 'flex'
  show.style.display = 'none'
}
</script>

<style scoped lang="scss">
.schedule {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: color-mix(in srgb, var(--ed-secondary-background-color), transparent 40%);
  .schedule_box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
    .schedule_header {
      display: flex;
      width: 100%;
      height: 50px;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 0 20px;
      border-bottom: 1px solid var(--ed-border-color);
      border-bottom: 1px solid #303033;
      .schedule_header_filter {
        position: absolute;
        left: 20px;
        width: 120px;
      }
      .schedule_header_title {
        font-weight: 600;
      }
      .schedule_header_add {
        position: absolute;
        right: 20px;
      }
    }
    .schedule_list {
      flex-grow: 1;
      width: 100%;
      padding: 20px;
      .schedule_list_item:last-child {
        margin-bottom: 0;
      }
      .schedule_list_item {
        display: flex;
        justify-content: space-between;
        padding: 12px 16px;
        background-color: var(--ed-card-background);
        border-radius: 4px;
        margin-bottom: 12px;
        box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.1); // 调整阴影的大小和透明度以符合设计需求
        cursor: pointer;
        .schedule_list_item_left {
          flex: 1;
          padding: 10px; /* 添加内边距 */
          background-color: var(--ed-background-color); /* 背景色 */
          border: 1px solid var(--ed-border-color); /* 添加边框 */
          border-radius: 8px; /* 添加圆角 */

          & > div {
            display: flex;
            flex-direction: column; /* 垂直方向排列 */
            margin-bottom: 8px; /* 子元素间的间距 */
          }

          .schedule_item_title {
            font-size: 18px; /* 增加标题字体大小 */
            font-weight: bold; /* 加粗标题 */
            margin-bottom: 4px; /* 顶部间距 */
          }

          .schedule_item_contain {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3; /* 显示最多3行 */
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 6px; /* 顶部间距 */
            color: var(--ed-text-color); /* 文字颜色 */
          }

          .schedule_item_date {
            font-size: 14px; /* 规则状态和标签字体大小 */
            color: var(--ed-light-text-color); /* 颜色 */
          }

          .schedule_item_status {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin: 4px 0; /* 状态上下间距 */
            span {
              padding: 2px 6px;
              border-radius: 4px;
            }
          }

          .schedule_item_emotion {
            font-size: 14px; /* 标签字体大小相同 */
            margin-top: 12px; /* 标签距离顶部的间距 */
            color: var(--ed-primary-color); /* 标签颜色 */
          }
        }
        .schedule_list_item_right {
          opacity: 0;
          width: 0;
          transition: all ease-in-out 0.5s;
          overflow: hidden;
          button {
            height: 100%;
            width: 100%;
            padding: 0;
          }
        }
        &:hover .schedule_list_item_right {
          width: 30px;
          opacity: 1;
        }
      }
    }
  }
  .schedule_detail {
    :deep(.el-overlay-dialog) {
      display: flex;
      align-items: center;
      justify-content: center;
      .el-dialog {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 512px;
        max-height: 100%;
        overflow: hidden;
        background-color: var(--ed-background-color);
        margin: 0;
        padding: 0;
        .el-dialog__header {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 40px;
          box-sizing: border-box;
          border-bottom: 1px solid var(--ed-border-color);
          .el-dialog__headerbtn {
            width: 40px;
            height: 40px;
            color: var(--ed-Primary-icon-color);
          }
        }
        .el-dialog__body {
          width: 100%;
          flex: 1;
          height: 0;
          overflow: auto;
        }
        .el-dialog__footer {
          width: 100%;
          height: 60px;
          padding: 0;
          margin: 0;
        }
        .schedule_info_title {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .schedule_info_footer {
          display: flex;
          gap: 16px;
          width: 100%;
          height: 100%;
          justify-content: center;
          align-items: center;
        }
        .schedule_info {
          width: 100%;
          height: 400px;
          max-height: 100%;
          overflow: auto;
          .schedule_info_body {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 20px 40px;
            .schedule_info_body_item {
              display: flex;
              gap: 10px;
              width: 100%;
              align-items: center;
              .schedule_info_body_item_label {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                height: 100%;
                width: 60px;
              }
              .schedule_info_body_item_inp {
                flex: 1;
                .el-input__wrapper {
                  background-color: var(--ed-input-background-color);
                  box-shadow: 0 0 0 1px var(--ed-input-border-color);
                }
                .is-focus {
                  box-shadow: 0 0 0 1px var(--ed-input-focus-border-color);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
