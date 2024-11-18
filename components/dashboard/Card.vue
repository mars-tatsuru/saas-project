<script setup lang="ts">
import { ref, watch } from 'vue';
import Dropdown from '@/components/dashboard/Dropdown.vue';
import ColumnChart from '@/components/dashboard/ColumnChart.vue';
import News from '@/components/dashboard/News.vue';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

const props = withDefaults(
	defineProps<{
		title?: string;
		content?: string;
		dataSwapyItem?: string;
	}>(),
	{
		title: undefined,
		content: undefined,
		dataSwapyItem: undefined,
	},
);

const emit = defineEmits<{
	(
		e: 'updateCardData',
		dataSwapyItem: string,
		content: string,
	): void;
}>();

const setContent = ref(props.content);

const updateContent = (content: string) => {
	setContent.value = content;
	emit('updateCardData', props.dataSwapyItem!, content);
};

// watch for content changes
watch(
	() => props.content,
	(newContent) => {
		setContent.value = newContent;
	},
);
</script>

<template>
	<Card
		class="relative grid size-full select-none grid-rows-[80px,1fr] overflow-hidden rounded-md border border-gray-200  bg-white text-gray-700 shadow-md dark:border-[#4c4c4c] dark:bg-[#1f1f1f] dark:text-gray-300 dark:shadow-lg"
		:data-swapy-item="props.dataSwapyItem"
	>
		<CardHeader
			class="relative z-40 flex flex-row items-center justify-between"
		>
			<CardTitle>{{ setContent }}</CardTitle>
			<div class="flex items-center gap-2">
				<div
					class="handle size-6 cursor-pointer"
					data-swapy-handle
				>
					<Icon
						name="hugeicons:move"
						class="size-6"
					/>
				</div>
				<Dropdown @update-content="updateContent" />
			</div>
		</CardHeader>

		<CardContent
			class="relative z-10 overflow-auto"
		>
			<ColumnChart
				v-if="setContent === 'API Usage'"
			/>
			<News
				v-else-if="setContent === 'News'"
			/>
			<div
				v-else-if="setContent === 'Profile'"
			/>
			<div
				v-else
			>
				コンテンツが選択されてません。
			</div>
		</CardContent>
	</Card>
</template>
