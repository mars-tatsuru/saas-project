<script setup lang="ts">
definePageMeta({
	title: 'api',
});

useHead({
	title: 'api',
});

/************************************************
 * Determine if the user is logged in
 *************************************************/
definePageMeta({
	middleware: 'auth',
});
</script>

<template>
	<div class="container p-0 relative z-10 h-full max-w-none gap-5">
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
			api
		</h1>
	</div>
</template>
