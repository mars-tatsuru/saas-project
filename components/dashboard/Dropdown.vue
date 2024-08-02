<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

// open/close dropdown
const isOpen = ref(false);
const emit = defineEmits(["updateContent"]);
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// emit event to parent for updating content
const updateContent = (content: string) => {
  emit("updateContent", content);
};

// outside click to close dropdown
const target = ref(null);
onClickOutside(target, (event) => (isOpen.value = false));

// select items
const selectItems = ref([
  { id: 1, name: "Dashboard" },
  { id: 2, name: "API" },
  { id: 3, name: "Profile" },
]);
</script>

<template>
  <button
    id="multiLevelDropdownButton"
    data-dropdown-toggle="multi-dropdown"
    class="absolute right-12 top-2 inline-flex cursor-pointer items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    type="button"
    @click="toggleDropdown"
    ref="target"
  >
    change content
    <svg
      class="ms-3 h-2.5 w-2.5"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 6"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m1 1 4 4 4-4"
      />
    </svg>
  </button>

  <!-- Dropdown menu -->
  <div
    id="multi-dropdown"
    class="absolute right-12 top-14 z-10 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700"
    :class="isOpen ? 'block' : 'hidden'"
  >
    <ul
      class="py-2 text-sm text-gray-700 dark:text-gray-200"
      aria-labelledby="multiLevelDropdownButton"
    >
      <li
        v-for="items in selectItems"
        @click="updateContent(`${items.name}`)"
        :key="items.id"
      >
        <a
          href="#"
          class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          {{ items.name }}
        </a>
      </li>
    </ul>
  </div>
</template>
