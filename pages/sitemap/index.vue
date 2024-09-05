<script setup lang="ts">
definePageMeta({
  title: "sitemap",
});

useHead({
  title: "sitemap",
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
      site map
    </h1>
    <NuxtLink to="/sitemap/created-sitemap" class="text-blue-500">
      Go created-sitemap page
    </NuxtLink>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import "@vue-flow/core/dist/style.css";

/* import the default theme, this is optional but generally recommended */
@import "@vue-flow/core/dist/theme-default.css";
</style>
