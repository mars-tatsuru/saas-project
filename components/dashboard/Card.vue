<script setup lang="ts">
import { ref, watch } from "vue";
import Dropdown from "@/components/dashboard/Dropdown.vue";
import ColumnChart from "@/components/dashboard/ColumnChart.vue";

const props = defineProps<{
  title: string;
  content: string;
  dataSwapyItem: string;
}>();

const emit = defineEmits<{
  (e: "updateCardData", dataSwapyItem: string, content: string): void;
}>();

const setContent = ref(props.content);

const updateContent = (content: string) => {
  setContent.value = content;
  emit("updateCardData", props.dataSwapyItem, content);
};

// propsの変更を監視し、setContentを更新
watch(
  () => props.content,
  (newContent) => {
    setContent.value = newContent;
  },
);
</script>

<template>
  <div
    class="relative flex h-full w-full items-center justify-center rounded-md bg-white text-4xl text-gray-700 dark:bg-slate-500 dark:text-gray-300"
    :data-swapy-item="props.dataSwapyItem"
  >
    <div
      class="handle absolute right-4 top-4 z-10 h-6 w-6 cursor-pointer"
      data-swapy-handle
    >
      <!-- SVG content -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 3v6m-9 3h6m12 0h-6m-3 9v-6.5M9 6l1.705-1.952C11.315 3.35 11.621 3 12 3c.38 0 .684.35 1.295 1.048L15 6m0 12l-1.705 1.952C12.685 20.65 12.379 21 12 21c-.38 0-.684-.35-1.295-1.048L9 18m9-9l1.952 1.705C20.65 11.315 21 11.621 21 12c0 .38-.35.684-1.048 1.295L18 15M6 15l-1.952-1.705C3.35 12.685 3 12.379 3 12c0-.38.35-.684 1.048-1.295L6 9"
          color="currentColor"
        />
      </svg>
    </div>
    <Dropdown @updateContent="updateContent" />
    <div v-if="setContent === 'API'" class="h-full w-full pt-6">
      <ColumnChart />
    </div>
    <div v-else-if="setContent === 'DashBoard'">
      <div class="text-4xl">DashBoard</div>
    </div>
    <div v-else-if="setContent === 'Profile'">
      <div class="text-4xl">Profile</div>
    </div>
    <div v-else>
      <div class="text-4xl">{{ setContent }}</div>
    </div>
  </div>
</template>
