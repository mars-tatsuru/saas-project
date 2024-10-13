<script setup lang="ts">
import { ref, watch } from 'vue'
import Dropdown from '@/components/dashboard/Dropdown.vue'
import ColumnChart from '@/components/dashboard/ColumnChart.vue'
import News from '@/components/dashboard/News.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    content?: string
    dataSwapyItem?: string
  }>(),
  {
    title: undefined,
    content: undefined,
    dataSwapyItem: undefined,
  },
)

const emit = defineEmits<{
  (
    e: 'updateCardData',
    dataSwapyItem: string | undefined,
    content: string,
  ): void
}>()

const setContent = ref(props.content)

const updateContent = (content: string) => {
  setContent.value = content
  emit('updateCardData', props.dataSwapyItem!, content)
}

// watch for content changes
watch(
  () => props.content,
  (newContent) => {
    setContent.value = newContent
  },
)
</script>

<template>
  <div
    class="item relative flex h-full w-full select-none items-center justify-center rounded-md bg-white text-4xl text-gray-700 dark:bg-slate-500 dark:text-gray-300"
    :data-swapy-item="props.dataSwapyItem"
  >
    <div
      class="handle absolute right-4 top-4 z-10 h-6 w-6 cursor-pointer"
      data-swapy-handle
    >
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
    <Dropdown @update-content="updateContent" />
    <div
      v-if="setContent === 'API Usage'"
      class="item-card started relative h-full w-full px-1 pt-8"
    >
      <ColumnChart />
    </div>
    <div
      v-if="setContent === 'News'"
      class="relative h-full max-h-64 w-full overflow-scroll px-6 pb-6 pt-16"
    >
      <News />
    </div>
    <div v-if="setContent === 'Profile'">
      <div class="text-4xl">
        Profile
      </div>
    </div>
    <div
      v-if="
        setContent !== 'API Usage'
          && setContent !== 'News'
          && setContent !== 'Profile'
      "
      class="relative flex h-full min-h-52 w-full items-center justify-center overflow-hidden px-6 py-6"
    >
      <div class="text-4xl">
        {{ setContent }}
      </div>
    </div>
  </div>
</template>
