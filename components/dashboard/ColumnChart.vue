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
		class="size-full pb-6"
	/>
</template>

<style>
</style>
