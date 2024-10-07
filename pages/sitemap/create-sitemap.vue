<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
  title: "create-sitemap",
  middleware: "auth",
});

useHead({
  title: "create-sitemap",
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const siteUrl = ref<string>("");
const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const crawlResult = ref<any>(null);
const testImageUrl = ref<string | null>(null);

const startCrawling = async () => {
  if (!user.value?.id) {
    errorMessage.value = "User not authenticated";
    return;
  }

  if (!siteUrl.value) {
    errorMessage.value = "Site URL is required";
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;
  crawlResult.value = null;

  try {
    const response = await fetch(
      `http://0.0.0.0:8000/crawl?userId=${user.value.id}&siteUrl=${siteUrl.value}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    crawlResult.value = data;
    console.log("Crawl data:", data);
  } catch (error) {
    console.error("Crawling failed:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "An unknown error occurred";
  } finally {
    isLoading.value = false;
  }
};

const getImagesFromSupabase = async () => {
  if (!user.value?.id) {
    errorMessage.value = "User not authenticated";
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;
  crawlResult.value = null;

  try {
    const { data } = await client.storage
      .from("thumbnail")
      .getPublicUrl("public/ja.png");
    // .list("public", {
    //   limit: 100,
    //   offset: 0,
    //   sortBy: { column: "created_at", order: "desc" },
    // });
    console.log("Images data:", data);
    testImageUrl.value = data?.publicUrl;
  } catch (error) {
    console.error("Getting images failed:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "An unknown error occurred";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container relative z-10 h-full max-w-none gap-5">
    <div class="mb-3 flex items-center gap-2">
      <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Create Site Map
      </h1>
      <button
        type="button"
        @click="getImagesFromSupabase"
        class="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Get images
      </button>
    </div>

    <NuxtImg
      v-if="testImageUrl"
      :src="testImageUrl"
      alt="test image"
      class="h-40 w-40"
    />

    <form @submit.prevent="startCrawling" class="max-w-sm">
      <div class="mb-5">
        <label
          for="siteUrl"
          class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Site URL
        </label>
        <input
          type="url"
          id="siteUrl"
          v-model="siteUrl"
          class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="https://example.com"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        {{ isLoading ? "Crawling..." : "Start Crawling" }}
      </button>
    </form>

    <div v-if="errorMessage" class="mt-4 text-red-500">
      {{ errorMessage }}
    </div>

    <div v-if="crawlResult" class="mt-4">
      <h2 class="text-xl font-semibold">Crawl Result:</h2>
      <pre class="mt-2 whitespace-pre-wrap">{{
        JSON.stringify(crawlResult, null, 2)
      }}</pre>
    </div>
  </div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>
