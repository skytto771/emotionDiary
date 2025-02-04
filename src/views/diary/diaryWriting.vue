<template>
  <div class="diaryWriting">
    <div class="diaryWriting_box">
      <div class="diary_book">
        <div class="diary_title">
          <div class="diary_title_label">标题</div>
          <div class="diary_title_inp"><el-input v-model="diaryForm.title"></el-input></div>
        </div>
        <div class="diary_body">
          <div class="diary_body_note">
            <div class="diary_body_note_label">内容</div>
            <div class="diary_body_note_inp">
              <QuillEditor
                :toolbar="toolbarOptions"
                ref="quillRef"
                theme="snow"
                @textChange="setContent"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="diary_footer">
        <div @click="goBack" class="diary_button back_button">返回</div>
        <div @click="submitDiary" class="diary_button submit_button">保存</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ref, getCurrentInstance, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()

const diaryForm = ref({
  title: '',
  content: '',
  content_html: '',
})
const quillRef = ref()
let submitTimer = null

//富文本输入框工具栏
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
]

const setContent = () => {
  const text = quillRef.value.getText()
  const html = quillRef.value.getHTML()
  diaryForm.value.content = text
  diaryForm.value.content_html = html
}

function goBack() {
  router.go(-1)
}

function submitDiary() {
  if (submitTimer) clearTimeout(submitTimer)
  submitTimer = setTimeout(() => {
    proxy.$http.post(proxy.$api.diary.addDiary, { ...diaryForm.value }).then((res) => {
      console.log(res)
      ElMessage.success('保存成功')
      submitTimer = null
    })
  }, 300)
}

onMounted(() => {
  const diaryID = route.query.diaryID || null
  if (diaryID) {
    proxy.$http.post(proxy.$api.diary.getDiaryDetail, { diaryID: diaryID }).then((res) => {
      for (let key in diaryForm.value) {
        for (let ckey in res.data) {
          if (key == ckey) {
            diaryForm.value[key] = res.data[key]
          }
          if (key == 'content_html') {
            quillRef.value.setHTML(res.data[key])
          }
        }
      }
    })
  }
})
</script>

<style scoped lang="scss">
.diaryWriting {
  width: 100%;
  height: 100%;
  min-height: 560px;
  background-color: var(--ed-background-color); // 背景颜色略显柔和
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  position: relative;
  .diaryWriting_box {
    width: 100%;
    max-width: 800px; // 限制最大宽度，增加可读性
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    padding-bottom: 0;
    box-shadow: var(--ed-primary-shadow);
    border-radius: 12px; // 更加圆润的边角
    overflow: hidden;
    .diary_book {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      background-color: var(
        --ed-secondary-background-color
      ); // 日记本的背景为白色，给人以清新的感觉
      border-radius: 12px;
      padding: 20px;
      box-sizing: border-box;

      .diary_title {
        width: 100%;
        height: 50px; // 稍微增高标题栏
        display: flex;
        gap: 10px;
        margin-bottom: 25px;

        .diary_title_label {
          display: flex;
          height: 100%;
          align-items: center;
          justify-content: center;
          font-weight: bold; // 标题加粗
        }

        .diary_title_inp {
          flex-grow: 1;

          :deep(.el-input) {
            height: 100%;
            border-radius: 8px; // 圆润边角
            .el-input__wrapper {
              background-color: var(--ed-input-background-color);
              border: 1px solid var(--ed-input-border-color);
              box-shadow: none;
            }
          }
        }
      }

      .diary_body {
        width: 100%;
        flex-grow: 1; // 使内容区占满剩余空间
        .diary_body_note {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;

          .diary_body_note_label {
            height: 25px; // 标签高度稍作调整
            font-weight: bold; // 标签加粗
          }

          .diary_body_note_inp {
            height: calc(100% - 35px);
            display: flex;
            flex-direction: column;
            overflow: hidden; /* 超出部分隐藏 */

            :deep(.ql-toolbar) {
              background-color: var(--ed-card-background);
              border: 1px solid var(--ed-input-border-color);
              border-radius: 8px;
              .ql-picker-label:hover,
              button:hover {
                background-color: var(--ed-card-hover-background);
              }
            }

            :deep(.ql-container) {
              flex-grow: 1;
              border-radius: 8px;
              background-color: var(--ed-input-background-color);
              border: 1px solid var(--ed-input-border-color);
            }
          }
        }
      }
    }
    .diary_footer {
      display: flex;
      align-content: center;
      justify-content: center;
      gap: 10px;
      height: 50px;
      flex-wrap: wrap;
      .diary_button {
        display: flex;
        border-radius: 8px;
        padding: 10px 20px;
        box-sizing: border-box;
        box-shadow: var(--ed-primary-shadow);
        height: fit-content;
        cursor: pointer;
        user-select: none;

        &.back_button {
          background-color: var(--ed-secondary-color);
          color: var(--ed-light-text-color);
        }

        &.submit_button {
          background-color: var(--ed-primary-color);
          color: #ffffff;
        }
      }
    }
  }
}
</style>
