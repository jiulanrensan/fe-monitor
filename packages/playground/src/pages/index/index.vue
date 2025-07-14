<template>
  <view class="content">
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import reqFetch from '@/utils/request'
import { onMounted, ref, getCurrentInstance } from 'vue'
const title = ref('首页 自定义navigation')
onMounted(async () => {
  init()
})
async function init() {
  try {
    const res = await reqFetch({
      url: 'https://www.example.com/request',
      method: 'GET',
      useComplete: true
    })
    console.log('res', res)
  } catch (error) {
    console.log('error', error)
  }
}
</script>

<style>
.content {
  /* height: 100vh; */
  background-color: bisque;
  /* overflow-y: auto; */
}
</style>
