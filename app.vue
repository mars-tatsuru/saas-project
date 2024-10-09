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
		<NuxtPage />
	</NuxtLayout>
</template>
