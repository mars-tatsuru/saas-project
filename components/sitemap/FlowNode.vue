<script setup lang="ts">
import {
	Handle,
	Position,
	getIncomers,
	useNode,
	useNodesData,
} from '@vue-flow/core';

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
	<div
		class="node w-[200px] whitespace-normal break-words rounded-md bg-white px-2 py-4"
	>
		<div class="mb-2 w-full">
			<NuxtImg
				v-if="props.data.thumbnailPath"
				:src="getImageFromSupabaseStorage(props.data.thumbnailPath)"
				:alt="props.data.title"
				class="w-full"
				quality="60"
				width="200"
				height="100"
				loading="lazy"
			/>
		</div>
		<h3 class="mb-2 text-xs dark:text-black">
			{{ props.data.title }}
		</h3>
		<p class="mb-2 text-xs dark:text-black">
			Level: {{ props.data?.level }}
		</p>
		<a
			v-if="props.data.thumbnailPath"
			:href="props.data.url"
			target="_blank"
			class="inline-block w-full text-xs text-sky-700"
		>
			{{ props.data.url }}
		</a>
		<p
			v-else
			class="mb-2 text-xs"
		>
			{{ props.data.url }}
		</p>
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
	</div>
</template>
