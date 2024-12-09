<script setup lang="ts">
import {
	Handle,
	Position,
	getIncomers,
	useNode,
	useNodesData,
} from '@vue-flow/core';
import { Icon } from '@iconify/vue';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

const client = useSupabaseClient();

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	data: {
		type: Object,
		required: true,
	},
	nodes: {
		type: Array,
		required: true,
	},
});

const emit = defineEmits(['collapseNode', 'expandNode']);

const collapse = () => {
	// get all nodes and nodeId
	const nodes = props.nodes;
	const nodeId = props.id;

	// if includes nodeId, return node
	const filteredNodes = nodes.filter((node: any) => {
		if (node.id.includes(nodeId)) {
			return node;
		}
	});

	// get position of filtered nodes
	const filterNodesPosition = filteredNodes.map((node: any) => {
		const theNode = document.getElementById(node.id);
		const nodePositionX = node.position.x;
		const nodePositionY = node.position.y;

		return {
			id: node.id,
			x: nodePositionX,
			y: nodePositionY,
		};
	});

	// save position to localStorage
	localStorage.setItem(nodeId, JSON.stringify(filterNodesPosition));

	emit('collapseNode', filterNodesPosition);
};

const expand = () => {
	emit('expandNode', props.id);
};

const getImageFromSupabaseStorage = (thumbnailPath: string) => {
	const { data } = client.storage.from('thumbnail').getPublicUrl(thumbnailPath);
	return data.publicUrl;
};
</script>

<template>
	<Handle
		id="bottom"
		type="source"
		:position="Position.Bottom"
	/>
	<Handle
		id="top"
		type="target"
		:position="Position.Top"
	/>
	<Card
		class="node relative w-[250px] dark:border-[#4c4c4c] dark:bg-[#1E1E1E]"
	>
		<!-- analytics -->
		<div
			v-if="props.data.thumbnailPath && props.data.pageView"
			class="absolute right-2 top-2 z-30"
		>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger as-child>
						<Button
							variant="outline"
							class="size-fit p-1"
						>
							<Icon
								icon="logos:google-analytics"
								class="size-4 dark:bg-[#1f1f1f]"
							/>
						</Button>
					</TooltipTrigger>
					<TooltipContent
						class="p-4 dark:bg-[#1f1f1f]"
					>
						<p
							v-if="props.data.dates"
							class="mb-1 text-sm dark:text-white"
						>
							{{ props.data?.dates[0] }}~{{ props.data?.dates[props.data?.dates.length - 1] }}
						</p>
						<p
							v-if="props.data.pageView"
							class="text-xs dark:text-white"
						>
							<span class="text-base font-semibold text-[#10B981]">{{ props.data?.pageView }}</span> views
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>

		<!-- thumbnail -->
		<div
			v-if="props.data.thumbnailPath"
			class="relative mb-2 h-[120px] w-full overflow-hidden"
		>
			<NuxtImg
				v-if="props.data.thumbnailPath"
				:src="getImageFromSupabaseStorage(props.data.thumbnailPath)"
				:alt="props.data.title"
				class="size-full rounded-t-lg object-fill"
				quality="60"
				loading="lazy"
			/>
		</div>

		<CardContent
			class="p-3"
		>
			<!-- title -->
			<h3
				v-if="props.data.thumbnailPath"
				class="truncate text-xs dark:text-white"
			>
				{{ props.data.title }}
			</h3>

			<!-- url -->
			<div class="">
				<a
					v-if="props.data.thumbnailPath"
					:href="props.data.url"
					target="_blank"
					class="inline-block w-full truncate text-xs text-[#344aab] dark:text-[#6c7ecd]"
				>
					{{ props.data.url }}
				</a>
				<p
					v-else
					class="truncate text-xs"
				>
					{{ props.data.url }}
				</p>
			</div>

			<!-- level -->
			<!-- <p class="mb-2 text-xs dark:text-black">
				Level: {{ props.data?.level }}
			</p> -->

			<!-- button -->
		<!-- <div class="flex items-center gap-2">
			<Button
				class="mt-2 h-fit rounded-sm p-1 text-xs"
				@click="collapse"
			>
				collapse
			</Button>
			<Button
				class="mt-2 h-fit rounded-sm p-1 text-xs"
				@click="expand"
			>
				expand
			</Button>
		</div> -->
		</CardContent>
	</Card>
</template>
