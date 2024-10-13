<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

// open/close dropdown
const isOpen = ref(false);
const emit = defineEmits(['updateContent']);
const toggleDropdown = () => {
	isOpen.value = !isOpen.value;
};

// emit event to parent for updating content
const updateContent = (content: string) => {
	emit('updateContent', content);
};

// outside click to close dropdown
const target = ref(null);
onClickOutside(target, event => (isOpen.value = false));

// select items
const selectItems = ref([
	{ id: 1, name: 'News' },
	{ id: 2, name: 'API Usage' },
	{ id: 3, name: 'Profile' },
]);
</script>

<template>
	<button
		id="multiLevelDropdownButton"
		ref="target"
		data-dropdown-toggle="multi-dropdown"
		class="absolute right-12 top-4 z-10 rounded-lg border border-gray-200 bg-white p-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
		type="button"
		@click="toggleDropdown"
	>
		<svg
			class="size-2"
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
				:key="items.id"
				@click="updateContent(`${items.name}`)"
			>
				<span
					class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
				>
					{{ items.name }}
				</span>
			</li>
		</ul>
	</div>
</template>
