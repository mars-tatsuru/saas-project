<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { useStore } from '@/stores/index';

const route = useRoute();
const store = useStore();

/************************
 *  handle breadcrumb
 *************************/
const pagePath = ref<string[]>([]);

watchEffect(() => {
	const path = route.path.split('/').filter(p => p);
	const upperCasePath = path.map(p => p.charAt(0).toUpperCase() + p.slice(1));
	const removeHyphenPath = upperCasePath.map(p => p.replace('-', ' '));
	pagePath.value = removeHyphenPath;
});
</script>

<template>
	<nav
		class="flex"
		aria-label="Breadcrumb"
	>
		<ol
			class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse"
		>
			<li class="inline-flex items-center">
				<NuxtLink
					to="/"
					class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
				>
					<svg
						class="me-2.5 h-3 w-3"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
						/>
					</svg>
					HOME
				</NuxtLink>
			</li>
			<li
				v-for="path in pagePath"
				:key="path"
			>
				<NuxtLink
					:to="`/${path}`"
					class="flex items-center"
				>
					<svg
						class="mx-1 h-3 w-3 text-gray-400 rtl:rotate-180"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 6 10"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m1 9 4-4-4-4"
						/>
					</svg>
					<span
						class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400"
					>
						{{ path }}
					</span>
				</NuxtLink>
			</li>
		</ol>
	</nav>
</template>
