<script setup lang="ts">
const props = defineProps<{
	title: string;
	href: string;
	label: string;
}>();
</script>

<template>
	<div
		class="sticky top-20 z-40 flex items-center justify-between rounded-md border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-slate-800"
	>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
			{{ props.title }}
		</h1>
		<Button
			as-child
			class="bg-gradient-to-r from-[#4B81F5] to-[#2C4B8F] dark:from-white dark:to-white"
		>
			<NuxtLink
				v-if="props.href && props.label"
				:to="props.href"
			>
				{{ props.label }}
			</NuxtLink>
		</Button>
	</div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import "@vue-flow/core/dist/style.css";

/* import the default theme, this is optional but generally recommended */
@import "@vue-flow/core/dist/theme-default.css";
</style>
