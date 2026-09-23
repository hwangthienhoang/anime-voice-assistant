<script setup>
import { RouterLink } from 'vue-router';
import PagePlaceholder from '@/shared/ui/PagePlaceholder.vue';
</script>

<template>
  <PagePlaceholder title="Không tìm thấy trang" description="Đường dẫn này chưa có trong ứng dụng.">
    <RouterLink :to="{ name: 'stage' }">Về sân khấu</RouterLink>
  </PagePlaceholder>
</template>
