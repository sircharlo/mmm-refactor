<template>
  <!-- not used -->
  <p></p>
</template>

<script setup>
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

function searchParam(key) {
  try {
    return new URLSearchParams(location.search).get(key);
  } catch (error) {
    console.error(error);
    return '';
  }
}

onBeforeMount(() => {
  try {
    const param = searchParam('page');
    if (param) {
      router.push({ path: `/${param}` });
    }
  } catch (error) {
    console.error(error);
  }
});
</script>
