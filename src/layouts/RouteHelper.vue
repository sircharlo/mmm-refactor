<template>
  <!-- not used -->
   <p></p>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

function searchParam(key) {
  return new URLSearchParams(location.search).get(key)
}

onBeforeMount(() => {
  const param = searchParam('page')
  if (param) {
    router.push({ path: `/${param}` })
  }
})
</script>
