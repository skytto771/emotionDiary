<template>
  <div class="diaryList">
    <div class="diaryList_box" ref="dragBoxRef">
      <div class="diaryList_calendar" v-if="diaryShowType == 'calendar'">
        <calendar :getDiaries="getDiaries" />
      </div>
      <div class="diaryList_dateLine" v-if="diaryShowType == 'dateLine'">
        <dateLine :getDiaries="getDiaries" />
      </div>
    </div>
    <div v-if="showSearch" class="searchOverlay">
      <div class="searchBox">
        <div class="searchHeader">
          <div class="searchHeader_inp">
            <input class="ed_input" v-model="searchObj.title" placeholder="请输入标题名"></input>
          </div>
          <div class="searchHeader_type">
            <div class="searchHeader_type_item">
              <div class="searchHeader_type_item_label">起始时间</div>
              <div class="searchHeader_type_item_inp">
                <el-date-picker
                    style="width: 240px;"
                    v-model="searchObj.timeRange"
                    type="datetimerange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    clearable
                >
                </el-date-picker>

              </div>
            </div>
          </div>
          <div @click="performSearch" class="ed_button btn_primary">搜索</div>
        </div>
        <div class="searchResults" v-if="searchList.length != 0" v-loading="searchLoading">
          <div class="searchResults_item" v-for="item,index in searchList" :key="item.diaryID">
            <div class="diaryItem">
              <div class="diaryItem_Title"><h3>{{ item.title }}</h3></div>
              <div class="diaryItem_Date">{{ new Date(item.createdDate).toLocaleDateString() }}</div>
              <div class="diaryItem_Content" v-html="item.content"></div>
              <div class="diaryItem_Tag" :class="`tag-${item.tagID}`">{{ item.tagName }}</div>
            </div>
          </div>
        </div>
        <div class="searchResults" v-else style="display: flex;justify-content: center;">
          <h4>请点击搜索按钮进行搜索</h4>
        </div>
        <div class="closeButton" @click="toggleSearch"><button class="ed_button btn_basic">关闭</button></div>
      </div>
    </div>
    <div
      class="changeType"
      ref="changeTypeRef"
      :draggable="true"
      @dragstart="dragStartFuc($event)"
      @dragend="dragEndFuc($event)"
    >
      <div class="drag_icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 48 48"
          width="20"
          height="20"
          style=""
          filter="none"
        >
          <g>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M19 10C19 12.2091 17.2091 14 15 14C12.7909 14 11 12.2091 11 10C11 7.79086 12.7909 6 15 6C17.2091 6 19 7.79086 19 10ZM15 28C17.2091 28 19 26.2091 19 24C19 21.7909 17.2091 20 15 20C12.7909 20 11 21.7909 11 24C11 26.2091 12.7909 28 15 28ZM15 42C17.2091 42 19 40.2091 19 38C19 35.7909 17.2091 34 15 34C12.7909 34 11 35.7909 11 38C11 40.2091 12.7909 42 15 42Z"
              fill="rgba(16,16,16,1)"
              stroke="current"
            ></path>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M37 10C37 12.2091 35.2091 14 33 14C30.7909 14 29 12.2091 29 10C29 7.79086 30.7909 6 33 6C35.2091 6 37 7.79086 37 10ZM33 28C35.2091 28 37 26.2091 37 24C37 21.7909 35.2091 20 33 20C30.7909 20 29 21.7909 29 24C29 26.2091 30.7909 28 33 28ZM33 42C35.2091 42 37 40.2091 37 38C37 35.7909 35.2091 34 33 34C30.7909 34 29 35.7909 29 38C29 40.2091 30.7909 42 33 42Z"
              fill="rgba(16,16,16,1)"
              stroke="current"
            ></path>
          </g>
        </svg>
      </div>
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
      <div class="search changeType_item" @click="toggleSearch">搜索</div>
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
const dragOffset = ref({})
const filterText = ref('')

const showSearch = ref(false)
const searchList = ref([])

const dragBoxRef = ref(null)
const changeTypeRef = ref(null)
const searchLoading = ref(false)

const searchObject = {
  title: '',
  timeRange: '',
}

const searchObj = ref({ ...searchObject })

function changeShowType(type) {
  diaryShowType.value = type
  localStorage.setItem('ed_diaryShowType', type)
}

function applyFilter() {}

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

function dragStartFuc(e) {
  dragOffset.value = {}
  dragOffset.value['offsetY'] = e.offsetY
  dragOffset.value['offsetX'] = e.offsetX
  console.log(e.clientY - e.offsetY, e.clientX - e.offsetX, 'client')
}
function dragEndFuc(e) {
  const changeType = changeTypeRef.value
  const dragBox = dragBoxRef.value

  const dragBoxWidth = dragBox.offsetWidth
  const dragBoxHeight = dragBox.offsetHeight

  const width = e.target.offsetWidth
  const height = e.target.offsetHeight

  const getY = e.clientY - dragOffset.value.offsetY - 50
  const getX = e.clientX - dragOffset.value.offsetX
  const getXR = dragBoxWidth - getX - width

  let positionY = 0
  let positionX = 0
  if (getY + height <= dragBoxHeight) {
    positionY = getY >= 0 ? getY : 0
  } else {
    positionY = dragBoxHeight - height
  }
  if (getXR + width <= dragBoxWidth) {
    positionX = getXR >= 0 ? getXR : 0
  } else {
    positionX = dragBoxWidth - width
  }

  changeType.style.left = 'auto'
  changeType.style.top = positionY + 'px'
  changeType.style.right = positionX + 'px'
  changeType.style.bottom = 'auto'

  const savePositonObj = { top: positionY + 'px', right: positionX + 'px' }
  localStorage.setItem('changeTypePositon', JSON.stringify(savePositonObj))
}

// 打开/关闭搜索框
function toggleSearch() {
  showSearch.value = !showSearch.value
}

// 执行搜索操作
function performSearch() {
  // 在这里实现实际的搜索逻辑
  // 示例：假设我们用静态数据来模拟搜索结果
  const submitObj = {
    title:searchObj.value.title,
    startTime:searchObj.value.timeRange[0]?searchObj.value.timeRange[0]:null,
    endTime:searchObj.value.timeRange[1]?searchObj.value.timeRange[0]:null
  }
  searchLoading.value = true
  proxy.$http.post(proxy.$api.diary.getDiaries,submitObj).then(res=>{
    searchList.value = res.data
    searchLoading.value = false
  }).catch(err=>{
    searchLoading.value = false
  })
  
}

onMounted(() => {
  const diaryShowType_l = localStorage.getItem('ed_diaryShowType')
  if (diaryShowType_l) {
    diaryShowType.value = diaryShowType_l
  }

  const changeTypePositon = JSON.parse(localStorage.getItem('changeTypePositon'))
  if (changeTypePositon) {
    changeTypeRef.value.style.left = 'auto'
    changeTypeRef.value.style.top = changeTypePositon.top
    changeTypeRef.value.style.right = changeTypePositon.right
    changeTypeRef.value.style.bottom = 'auto'
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
    flex-direction: column;
    align-items: center;
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
    align-items: center;
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
    .drag_icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      cursor: pointer;
      user-select: none;
      svg {
        stroke: var(--ed-Primary-icon-color);
      }
    }
    .search {
      cursor: pointer;
    }
  }
  .searchOverlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;

    .searchBox {
      display: flex;
      flex-direction: column;
      max-width: 100%;
      max-height: 100%;
      width: 1000px;
      height: 560px;
      box-sizing: border-box;
      background: var(--ed-background-color);
      padding: 20px;
      border-radius: 12px;
      box-shadow: var(--ed-primary-shadow);
      .searchHeader {
        display: flex;
        height: 40px;
        margin-bottom: 10px;
        align-items: center;
        justify-content: center;
        .searchHeader_inp {
          margin-right: 8px;
          width: 180px;
        }
        .searchHeader_type {
          display: flex;
          gap: 6px;
          height: 100%;
          align-items: center;
          margin-right: 8px;
          .searchHeader_type_item {
            display: flex;
            align-items: center;
            height: 100%;
            gap: 4px;
            white-space: nowrap;
            :deep(.el-date-editor){
              background-color: var(--ed-input-background-color);

            }
          }
        }
      }

      .searchResults {
        height: 0;
        flex: 1;
        overflow-y: auto;
        .searchResults_item{
          .diaryItem {
            border: 1px solid var(--ed-border-color);
            border-radius: 8px;
            padding: 12px;
            margin: 8px 0;
            background-color: var(--ed-secondary-background-color);
            box-shadow: var(--ed-primary-shadow);
            
            .diaryItem_Title {
              font-size: 16px;
              font-weight: bold;
              color: var(--ed-text-color);
            }
            
            .diaryItem_Date {
              font-size: 12px;
              color: var(--ed-light-text-color);
              margin-bottom: 8px;
            }
            
            .diaryItem_Content {
              font-size: 14px;
              color: var(--ed-text-color);
              margin-bottom: 8px;
            }
            
            .diaryItem_Tag {
              font-size: 12px;
              padding: 4px 8px;
              border-radius: 4px;
              color: white;
              
              &.tag-0 {
                background-color: #f44336; /* 消极标签颜色 */
              }
              
              &.tag-1 {
                background-color: #4caf50; /* 积极标签颜色 */
              }
              
              &.tag--1 {
                background-color: #9e9e9e; /* 未分析标签颜色 */
              }
            }
          }

        }
      }

      .closeButton {
        height: 40px;
        text-align: center;
        cursor: pointer;
        color: red;
        margin-top: 10px;
        button{
          width: 100%;
        }
      }
    }
  }
}
</style>
