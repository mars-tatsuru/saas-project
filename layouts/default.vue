<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppSidebar from "@/components/AppSidebar.vue";
import { useStore } from "@/stores/index";

const route = useRoute();
const store = useStore();

/************************
 * header toggle
 *************************/
const main = ref<HTMLElement | null>(null);
watch(
  () => store.isSidebarOpen,
  () => {
    main.value?.classList.toggle("md:!w-[calc(100%-4rem)]");
  },
);
</script>

<template>
  <div class="whole bg-white dark:bg-black">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Header -->
    <AppHeader />

    <!-- Main -->
    <div
      class="ml-auto min-h-screen bg-slate-100 p-4 transition-all duration-300 md:w-[calc(100%-16rem)] dark:bg-slate-900"
      ref="main"
    >
      <div class="mt-14 min-h-[calc(100vh-5.5rem)] w-full dark:border-gray-700">
        <slot />
      </div>
    </div>
  </div>
</template>
