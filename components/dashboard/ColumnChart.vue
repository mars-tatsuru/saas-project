<script setup lang="ts">
// ref: https://stackblitz.com/edit/nuxt-starter-mmn2ed?file=nuxt.config.ts,app.vue,plugins%2Fapexchart.client.ts

const data = [
	{ name: 'Jan', total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
	{ name: 'Feb', total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
	{ name: 'Mar', total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
	{ name: 'Apr', total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
	{ name: 'May', total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
	{ name: 'Jun', total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
	{ name: 'Jul', total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
];
</script>

<template>
	<h3 class="absolute left-4 top-4 text-2xl">
		API Usage
	</h3>
	<BarChart
		index="name"
		:data="data"
		:categories="['total', 'predicted']"
		:y-formatter="(tick, i) => {
			return typeof tick === 'number'
				? `$ ${new Intl.NumberFormat('us').format(tick).toString()}`
				: ''
		}"
		:type="'grouped'"
		class="h-36 w-full"
	/>
</template>

<style>
</style>
