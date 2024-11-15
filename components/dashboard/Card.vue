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
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="100%"
						height="100%"
					>
						<path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M12 3v6m-9 3h6m12 0h-6m-3 9v-6.5M9 6l1.705-1.952C11.315 3.35 11.621 3 12 3c.38 0 .684.35 1.295 1.048L15 6m0 12l-1.705 1.952C12.685 20.65 12.379 21 12 21c-.38 0-.684-.35-1.295-1.048L9 18m9-9l1.952 1.705C20.65 11.315 21 11.621 21 12c0 .38-.35.684-1.048 1.295L18 15M6 15l-1.952-1.705C3.35 12.685 3 12.379 3 12c0-.38.35-.684 1.048-1.295L6 9"
							color="currentColor"
						/>
					</svg>
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
				class="text-4xl"
			>
				{{ setContent }}
			</div>
		</CardContent>
	</Card>
</template>
