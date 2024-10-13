<script setup lang="ts">
definePageMeta({
	title: 'HOME',
});

useHead({
	title: 'HOME',
});

/************************************************
 * Determine if the user is logged in
 *************************************************/
definePageMeta({
	middleware: 'auth',
});
</script>

<template>
	<div class="container relative z-10 h-full max-w-none gap-5 p-0">
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
			HOME
		</h1>
	</div>
</template>
