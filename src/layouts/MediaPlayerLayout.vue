<template>
  <q-app class="no-scroll fitSnugly">
  <q-layout class="bg-black text-white" style="align-content: center;">
      <!-- This is where pages get injected -->
      <router-view />

  </q-layout>
  </q-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

document.body.style.overflow = 'hidden'
document.title = 'Media Player'

export default defineComponent({
  setup() {
    return {}
  }
})
</script>
