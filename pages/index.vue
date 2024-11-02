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
		<!-- header -->
		<PageHeader
			title="HOME"
			href="https://zenn.dev/tatausuru/"
			target="_blank"
			label="Zenn"
		/>
	</div>
</template>
