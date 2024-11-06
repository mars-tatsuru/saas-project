<script setup lang="ts">
const route = useRoute();

/************************
 * SEO
 *************************/
useHead({
	// or as a function
	titleTemplate: (productCategory) => {
		return productCategory ? `${productCategory} - SaaS kit` : 'SaaS kit';
	},
	meta: [{ property: 'og:title', content: `SaaS kit - ${route.meta.title}` }],
});
</script>

<template>
	<NuxtLayout>
		<!-- loading bar -->
		<NuxtLoadingIndicator
			:color="'#1C7C54'"
			:height="4"
			:duration="5000"
			:throttle="0"
		/>
		<NuxtPage />
		<Toaster />
	</NuxtLayout>
</template>
