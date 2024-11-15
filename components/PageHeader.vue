<script setup lang="ts">
const props = defineProps<{
	title: string;
	href: string;
	target?: string;
	label: string;
}>();
</script>

<template>
	<div
		class="sticky top-20 z-50 flex items-center justify-between rounded-md border border-gray-200 bg-white p-6 shadow-md dark:border-[#4c4c4c] dark:bg-[#1f1f1f]"
	>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
			{{ props.title }}
		</h1>
		<Button
			as-child
			class="bg-gradient-to-r from-[#10B981] to-[#1C7C54] dark:from-white dark:to-white"
		>
			<NuxtLink
				v-if="props.href && props.label"
				:to="props.href"
				:target="props.target"
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
