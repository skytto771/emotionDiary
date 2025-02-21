<template>
  <div class="uploadProgress">
    <div class="uploadProgress_box">
      <div class="uploadProgress_header">
        <div class="uploadProgress_header_left"></div>
        <div class="uploadProgress_header_right">
          <div class="close" @click="closeUpload">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
      </div>
      <div class="uploadProgress_body">
        <div class="upload_info">正在上传中...</div>
        <div class="progress_bar">
          <el-progress :percentage="modelValue" :text-inside="true" :stroke-width="12" />
        </div>
      </div>
      <div class="uploadProgress_footer">
        <button class="btn_basic">取消</button>
        <!-- <button class="btn_primary">暂停</button> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  showProgress: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue', 'changeShow'])

watch(
  () => props.modelValue,
  (val) => {
    emit('update:modelValue', val)
  },
)

function closeUpload() {
  emit('changeShow', false)
}
</script>

<style lang="scss" scoped>
.uploadProgress {
  position: fixed;
  width: 400px;
  height: 150px;
  right: 20px;
  bottom: 20px;
  background-color: var(--ed-card-background);
  box-shadow: var(--ed-primary-shadow);
  border-radius: 6 px;
  overflow: hidden;
  z-index: 8888;
  .uploadProgress_box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .uploadProgress_header {
      display: flex;
      justify-content: space-between;
      padding: 0 12px;
      align-items: center;
      height: 30px;
      width: 100%;
      background-color: var(--ed-primary-color);
      .uploadProgress_header_left {
      }
      .uploadProgress_header_right {
      }
    }
    .uploadProgress_body {
      flex-grow: 1;
      height: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4px 16px;
      .upload_info {
        margin-bottom: 4px;
      }
      .progress_bar {
      }
    }
    .uploadProgress_footer {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      width: 100%;
    }
  }
  .close {
    width: 20px;
    height: 20px;
    color: var(--ed-Primary-icon-color);
    cursor: pointer;
    svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
