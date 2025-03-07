<template>
  <div class="report">
    <div class="report_box" v-loading="loading">
      <el-scrollbar>
        <div class="my_report">
          <div class="report_title">情绪日记报告</div>
          <div class="report_info">
            <h2>统计信息</h2>
            <div class="report_info_item">积极情绪日记数量: {{ positiveCount }}</div>
            <div class="report_info_item">消极情绪日记数量: {{ negativeCount }}</div>
            <div class="report_info_item">情绪分数: {{ moodScore }}</div>
            <div class="report_info_item" id="suggest">{{ suggestion }}</div>
          </div>
          <div>
            <h2>最近的积极日记</h2>
            <ul>
              <li v-for="diary in recentPositiveDiaries" :key="diary.diaryID">
                {{ diary.title }} - {{ diary.content }}
              </li>
            </ul>
          </div>
          <div>
            <h2>最近的消极日记</h2>
            <ul>
              <li v-for="diary in recentNegativeDiaries" :key="diary.diaryID">
                {{ diary.title }} - {{ diary.content }}
              </li>
            </ul>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'

const { proxy } = getCurrentInstance()

// 定义变量
const positiveCount = ref(0)
const negativeCount = ref(0)
const moodScore = ref(0)
const recentPositiveDiaries = ref([])
const recentNegativeDiaries = ref([])
const suggestion = ref('')
const loading = ref(false)
const reportDate = ref({
  start_time: '',
  end_time: '',
})

const suggestMessage = ref({
  2: '你的情绪状态非常好，继续保持积极！',
  1: '你的情绪状态整体较好，试着多做一些让自己快乐的事情！',
  0: '你的情绪状态平衡，但可以尝试增加积极体验。',
  '-1': '你的情绪状态略有波动，考虑寻求朋友的支持或做一些活动来改善心情。',
  '-2': '你的情绪状态较差，建议考虑专业帮助或和朋友倾诉。',
})

async function calculateMood(emotionData) {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  let score = 0
  let submitInfo = ''

  // 遍历情绪数据
  emotionData.forEach((entry, index) => {
    const entryDate = new Date(entry.createdDate)
    const str =
      `第${index + 1}篇日记：` + entry.content + `标签：${entry.tagID == '1' ? '积极' : '消极'}`

    submitInfo += str + '\n'

    if (entryDate >= thirtyDaysAgo && entryDate <= today) {
      if (entry.tagID == '1') {
        score += 1 // 积极情绪 +1
      } else if (entry.tagID == '0') {
        score -= 1 // 消极情绪 -1
      }
    }
  })

  proxy.$http
    .post(proxy.$api.report.getDiariesSuggestion, { info: submitInfo })
    .then((res) => {
      if (res.suggest) {
        suggestion.value = res.suggest.replaceAll('# ', '').replaceAll('#', '').replaceAll('*', '')
      }

      loading.value = false
    })
    .then(() => {
      moodScore.value = score
    })

  return score
}

function getEmotion() {
  const submit = { ...reportDate.value }
  loading.value = true
  proxy.$http.post(proxy.$api.report.getUserEmotionData, submit).then(async (res) => {
    // 处理返回的数据
    if (res.data) {
      const diaries = res.data
      const suggest = res.suggest
      positiveCount.value = diaries.filter((diary) => diary.tagID == '1').length
      negativeCount.value = diaries.filter((diary) => diary.tagID == '0').length

      // 获取最近的积极和消极日记
      recentPositiveDiaries.value = diaries
        .filter((diary) => diary.tagID == 1)
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 3) // 最近三个

      recentNegativeDiaries.value = diaries
        .filter((diary) => diary.tagID == 0)
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 3) // 最近三个

      // 计算情绪分数
      moodScore.value = await calculateMood(diaries)
    }
  })
}

onMounted(() => {
  getEmotion()
})
</script>

<style scoped lang="scss">
.report {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .report_box {
    width: 800px;
    height: 680px;
    max-width: 100%;
    max-height: 100%;
    box-shadow: var(--ed-primary-shadow);
    background-color: var(--ed-secondary-background-color);
    border-radius: 8px;
    .my_report {
      padding: 20px;
      .report_info {
        .report_info_item {
          margin-top: 6px;
          color: var(--ed-text-color); /* 文字颜色 */
          font-size: 1rem; /* 字体大小 */
          line-height: 1.5; /* 行高 */
        }
        #suggest {
          color: var(--ed-primary-color);
          white-space: pre-wrap; /* 保持换行 */
        }
      }
    }
    .report_title {
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      color: var(--ed-primary-color);
      margin-bottom: 20px;
    }
    h2 {
      margin-top: 30px; /* 上边距 */
      color: var(--ed-text-color); /* 文字颜色 */
      border-bottom: 1px solid var(--ed-border-color); /* 边框 */
      padding-bottom: 10px; /* 下内边距 */
    }

    ul {
      list-style-type: none; /* 去除列表项圆点 */
      padding: 0; /* 去除内边距 */
      li {
        margin: 10px 0; /* 上下边距 */
        padding: 10px; /* 内边距 */
        background-color: var(--ed-card-background); /* 悬浮工具栏背景 */
        border-radius: 4px; /* 圆角 */

        /* Hover效果 */
        &:hover {
          background-color: var(--ed-card-hover-background); /* 悬浮工具 hover 背景颜色 */
        }
        // 响应式设计，适应小屏幕
        @media (max-width: 600px) {
          padding: 8px; /* 内边距缩小 */
        }
      }
    }
  }
}
</style>
