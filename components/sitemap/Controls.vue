<script setup lang="ts">
import { Panel } from '@vue-flow/core';
import { useDebounce } from '@vueuse/core';
import { Icon } from '@iconify/vue';

const props = defineProps({
	hitCount: {
		type: Number,
		default: 0,
	},
});

const emit = defineEmits(['search-dom', 'moveUp', 'moveDown']);
const siteTitle = ref<string>('');

const debouncedSiteTitle = useDebounce(siteTitle, 500);
watch(debouncedSiteTitle, (newValue) => {
	emit('search-dom', newValue);
});

const orderPerHitCount = ref<number>(0);
const countUp = () => {
	if (props.hitCount - 1 === orderPerHitCount.value) return;
	orderPerHitCount.value += 1;
	emit('moveUp', orderPerHitCount.value);
};
const countDown = () => {
	if (1 > orderPerHitCount.value) return;
	orderPerHitCount.value -= 1;
	emit('moveDown', orderPerHitCount.value);
};
watch(() => props.hitCount, (newValue) => {
	orderPerHitCount.value = 0;
});
</script>

<template>
	<Panel
		class="w-96 rounded-md bg-white p-2"
		position="top-right"
	>
		<div class="flex w-full max-w-sm items-center gap-1.5">
			<div class="relative w-full">
				<Input
					v-model="siteTitle"
					placeholder="サイトタイトル"
					class="w-full"
				/>
				<span
					v-if="props.hitCount > 0"
					class="absolute inset-y-0 end-0 flex items-center justify-center px-2 text-xs"
				>
					{{ orderPerHitCount + 1 }}/{{ props.hitCount }}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<Button
					variant="ghost"
					class="h-fit p-2"
					@click="countDown"
				>
					<Icon
						icon="mingcute:up-fill"
						class=""
					/>
				</Button>
				<Button
					variant="ghost"
					class="h-fit p-2"
					@click="countUp"
				>
					<Icon
						icon="mingcute:down-fill"
						class=""
					/>
				</Button>
			</div>
		</div>
	</Panel>
</template>
