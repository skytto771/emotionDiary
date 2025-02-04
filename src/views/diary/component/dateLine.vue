<template>
  <div class="dateLine">
    <div class="dateLine_box">
      <el-scrollbar>
        <div class="dateLine_list">
          <div
            class="dateLine_list_item"
            v-for="(item, index) in diaryList"
            :key="item.diaryID"
            @click="toWritingFuc(item.diaryID)"
          >
            <div class="dateLine_list_item_left">
              <div class="dateLine_item_date">{{ item.createdDate }}</div>
              <div class="dateLine_item_title">{{ item.title }}</div>
              <div class="dateLine_item_contain">
                {{ item.content }}
              </div>
              <div class="dateLine_item_emotion">{{ item.tagName }}</div>
            </div>
            <div class="dateLine_list_item_right"></div>
          </div>
        </div>
      </el-scrollbar>
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

const diaryList = ref([])

function getDiaries() {
  props.getDiaries().then((res) => {
    diaryList.value = res.data.map((item) => {
      const dateStr = item.createdDate
      item.createdDate = dateStr.split('T')[0]
      return item
    })
  })
}
getDiaries()

function toWritingFuc(diaryID) {
  router.push({
    path: '/diaryList/diaryWriting',
    query: { diaryID: diaryID },
  })
}
</script>

<style scoped lang="scss">
.dateLine {
  width: 100%;
  height: 100%;
  background-color: var(--ed-secondary-color);
  border-radius: 8px;
  .dateLine_box {
    width: 100%;
    height: 100%;
    .dateLine_list {
      width: 100%;
      height: 100%;
      padding: 30px;
      .dateLine_list_item {
        display: flex;
        justify-content: space-between;
        padding: 12px 16px;
        background-color: var(--ed-card-background);
        border-radius: 4px;
        margin-bottom: 12px;
        box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.1); // 调整阴影的大小和透明度以符合设计需求
        cursor: pointer;
        .dateLine_list_item_left {
          width: 100%;
          max-width: 50%;
          & > div {
            display: flex;
            align-items: center;
          }
          .dateLine_item_date {
            color: var(--ed-light-text-color);
            font-size: 12px;
          }
          .dateLine_item_title {
            margin-top: 6px;
            font-size: 16px;
          }
          .dateLine_item_contain {
            margin-top: 4px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 3em;
          }
          .dateLine_item_emotion {
            margin-top: 6px;
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
