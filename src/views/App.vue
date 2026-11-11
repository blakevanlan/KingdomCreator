<template>
  <RouterView />
  <WhatIsNewModal ref="newsModal" />
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';
import { RouterView } from 'vue-router';
import WhatIsNewModal from '@/components/WhatIsNewModal.vue';

const newsModal = ref<{ open: () => void } | null>(null);

function openNewsModal() {
  newsModal.value?.open();
}

provide('openNewsModal', openNewsModal);
</script>