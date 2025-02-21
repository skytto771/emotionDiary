<template>
  <div class="diaryWriting">
    <div class="diaryWriting_box">
      <div class="diary_book" v-loading="loading">
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
                @ready="onEditorReady"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="diary_footer">
        <div @click="goBack" class="ed_button btn_basic">返回</div>
        <div @click="submitDiary" class="ed_button btn_primary">保存</div>
      </div>
    </div>

    <uploadProgress
      v-if="showProgress"
      v-model="progress"
      :showProgress="showProgress"
      @changeShow="handleChangeShow"
    ></uploadProgress>
  </div>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ref, getCurrentInstance, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import uploadProgress from '../components/uploadProgress.vue'

const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()
const progress = ref(null)
const showProgress = ref(false)
const loading = ref(false)

const diaryForm = ref({
  title: '',
  content: '',
  content_html: '',
  diaryID: null,
  date: '',
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
  diaryForm.value.date = route.query.date
  if (submitTimer) clearTimeout(submitTimer)
  submitTimer = setTimeout(() => {
    proxy.$http.post(proxy.$api.diary.addDiary, { ...diaryForm.value }).then((res) => {
      console.log(res)

      const diaryID = res.data.diaryID
      if (diaryID) {
        diaryForm.value.diaryID = diaryID
      }
      ElMessage.success('保存成功')
      submitTimer = null
    })
  }, 300)
}

function onEditorReady(quill) {
  const toolbar = quill.getModule('toolbar')
  // 照片添加
  toolbar.addHandler('image', () => {
    // 创建一个文件输入框
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = ['image/*'] // 只接受图片格式

    // 添加事件监听器，处理选中的文件
    input.onchange = (event) => {
      const file = event.target.files[0] // 获取选中的文件
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          // 上传文件到后端
          if (file.size > 1024 * 1024 * 3) {
            ElMessage.error('上传图片不能大于3M')
            return
          }
          fileUpload(file, file.size).then(async (res) => {
            const imgSrc = await getFileUrl(res.data.fileID)

            // 插入图片到编辑器
            const range = quill.getSelection() // 获取光标位置
            quill.insertEmbed(range.index, 'image', imgSrc) // 在光标位置插入图片
            quill.setSelection(range.index + 1) // 移动光标到图片后面
          })
        }
        reader.readAsDataURL(file) // 读取文件
      }
    }

    // 触发文件输入框的点击事件
    input.click()
  })

  // 视频添加
  toolbar.addHandler('video', () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = ['video/*'] // 只接受视频格式

    // 添加事件监听器，处理选中的文件
    input.onchange = (event) => {
      const file = event.target.files[0] // 获取选中的文件
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          // 上传文件到后端
          fileUpload(file, file.size).then(async (res) => {
            const videoSrc = await getFileUrl(res.data.fileID)
            // 插入图片到编辑器
            const range = quill.getSelection() // 获取光标位置
            quill.insertEmbed(range.index, 'video', videoSrc) // 在光标位置插入视频
            quill.setSelection(range.index + 1) // 移动光标到图片后面
          })
        }
        reader.readAsDataURL(file) // 读取文件
      }
    }

    // 触发文件输入框的点击事件
    input.click()
  })
}

// 文件上传
// 文件上传
async function fileUpload(file, size) {
  if (size > 1024 * 1024 * 100) {
    ElMessage.error('上传文件不能大于100M')
    return
  }
  // 创建FormData对象并添加文件信息
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileName', file.name)
  formData.append('fileSize', file.size)
  formData.append('fileType', file.type)

  console.log(file, 'file')
  loading.value = true
  if (size / 1024 / 1024 < 3) {
    // 小文件上传
    return proxy.$http
      .post(proxy.$api.files.uploadSmallFile, formData)
      .then((res) => {
        loading.value = false
        return res
      })
      .catch((error) => {
        // 处理错误
        loading.value = false
        throw error // 或者返回一个自定义的错误信息
      })
  } else {
    // 大文件上传
    showProgress.value = true
    const chunkSize = 1024 * 1024 * 3 // 每个切片3MB
    const totalSlices = Math.ceil(size / chunkSize)

    const fileFormData = new FormData()
    fileFormData.append('file', file)
    fileFormData.append('fileName', file.name)
    fileFormData.append('fileSize', file.size)
    fileFormData.append('fileType', file.type)

    const startResponse = await proxy.$http.post(proxy.$api.files.startLUpload, fileFormData)
    const fileID = startResponse.data.fileID

    if (fileID) {
      for (let sliceIndex = 0; sliceIndex < totalSlices; sliceIndex++) {
        const start = sliceIndex * chunkSize
        const end = Math.min(start + chunkSize, size)
        const chunk = file.slice(start, end)

        const chunkFormData = new FormData()
        chunkFormData.append('file', chunk)
        chunkFormData.append('fileID', fileID)
        chunkFormData.append('sliceIndex', sliceIndex)
        chunkFormData.append('sliceSize', chunk.size) // 使用实际切片大小
        chunkFormData.append('totalSlices', totalSlices)

        try {
          // 上传切片，并等待其完成
          await proxy.$http.post(proxy.$api.files.uploadLargeFile, chunkFormData)
          progress.value = +(((sliceIndex + 1) / totalSlices) * 100).toFixed(0)
        } catch (error) {
          loading.value = false
          console.error(`Error uploading slice ${sliceIndex}:`, error)
          throw error // 抛出错误以便后续处理
        }
      }
      loading.value = false
      return startResponse
    }
  }
}

function getFileUrl(fileID) {
  return proxy.$http
    .post(proxy.$api.files.getFilePath, { fileID: fileID })
    .then((res) => {
      return res.data.fileURL
    })
    .catch((err) => {
      throw err
    })
}

function handleChangeShow(bool) {
  console.log(bool)
}

onMounted(() => {
  // 赋值富文本内容
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
      overflow: hidden;
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
        height: calc(100% - 75px);
        .diary_body_note {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          .diary_body_note_label {
            height: 25px; // 标签高度稍作调整
            margin-bottom: 10px;
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
              height: 0;
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
      height: 60px;
      flex-wrap: wrap;
    }
  }
}
</style>
