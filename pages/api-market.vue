<script setup lang="ts">
definePageMeta({
  title: "api-market",
});

useHead({
  title: "api-market",
});

/************************************************
 * Determine if the user is logged in
 *************************************************/
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div class="container relative z-10 h-full max-w-none gap-5">
    <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
      api-market
    </h1>
  </div>
</template>
