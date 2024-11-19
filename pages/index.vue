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

/************************************************
 * Crawl submit function
 *************************************************/
const VITE_CRAWL_API = import.meta.env.VITE_CRAWL_API;
const dimensionValues = ref<string[]>([]);
const analytics = ref<any>([]);
const getAnalytics = async () => {
	try {
		const response = await fetch(`${VITE_CRAWL_API}/analytics`, {
			method: 'GET',
			credentials: 'include',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		analytics.value = data[0];

		console.log(data[0].rows);

		data[0].rows.forEach((row: any) => {
			dimensionValues.value.push(row.metricValues[0]);
		});
	}
	catch (error) {
		console.error('Crawling failed:', error);
	}
};
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

		<!-- main -->
		<div class="mt-4 min-h-[calc(100vh-12.5rem)] w-full rounded-md border border-gray-200 bg-white p-6 dark:border-[#4c4c4c] dark:bg-[#1f1f1f]">
			<Button
				@click="getAnalytics"
			>
				アナリティクス取得
			</Button>

			<div class="mt-6">
				<!-- {{ dimensionValues }} -->
				<pre>{{ analytics }}</pre>
			</div>
		</div>
	</div>
</template>
