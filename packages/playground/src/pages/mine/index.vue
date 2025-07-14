<template>
  <view class="content">
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, getCurrentInstance } from 'vue'
const title = ref('我的 原生navigation')
</script>

<style>
.content {
  height: 100vh;
  background-color: bisque;
  overflow-y: auto;
}
.placeholder {
  height: 100rpx;
  margin-top: 50rpx;
  background-color: #fff;
}
</style>
