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
const router = useRouter();

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
    siteUrl.value = "";
  }
};
</script>

<template>
  <div class="container relative z-10 h-full max-w-none gap-5">
    <!-- header -->
    <div
      class="sticky top-16 z-40 mb-3 flex items-center justify-between rounded-md border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-slate-800"
    >
      <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        site map
      </h1>
      <NuxtLink
        to="/sitemap"
        class="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        sitemap一覧へ
      </NuxtLink>
    </div>

    <!-- form -->
    <div
      class="rounded-md border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-slate-800"
    >
      <div class="mb-5">
        <h2 class="mb-8 text-xl font-semibold text-gray-800 dark:text-gray-100">
          項目入力欄
        </h2>
        <div class="mb-10">
          <div class="mb-6 w-full">
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
          <div class="mb-6 w-full">
            <label
              for="siteUrl"
              class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              何らかのオプション
            </label>
            <input
              type="url"
              id="siteUrl"
              disabled
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="何らかのオプション(今はない)"
              required
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        @click="startCrawling"
        :disabled="isLoading"
        class="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        {{ isLoading ? "Crawling..." : "Start Crawling" }}
      </button>
    </div>
  </div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>
