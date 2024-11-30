<script setup lang="ts">
import { ref } from 'vue';
import { VueFlow, useVueFlow, useNodesInitialized } from '@vue-flow/core';
import type { Node, Edge } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import FlowNode from '@/components/sitemap/FlowNode.vue';
import FlowEdge from '@/components/sitemap/FlowEdge.vue';
import { useLayout } from '@/utils/useLayout';
import { useStyledLog } from '@/utils/useStyledLog';

const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

definePageMeta({
	title: 'created-sitemap',
});

useHead({
	title: 'created-sitemap',
});

const { params } = useRoute();

/************************************************
 * Determine if the user is logged in
 *************************************************/
definePageMeta({
	middleware: 'auth',
});

/************************************************
 * Sitemap
 *************************************************/
type TreeNode = {
	level?: number;
	thumbnailPath?: string;
	title?: string;
	url?: string;
	x?: number;
	y?: number;
	pageView?: number;
	[key: string]: any; // To include children nodes
};

type CrawlData = {
	created_at: string;
	id: string;
	json_data: { [key: string]: TreeNode };
	number_of_crawl_pages: string;
	number_of_crawled_page: string;
	site_url: string;
	thumbnail_path: string;
	user_id: string;
}[] | undefined;

type analyticsData = {
	date: string;
	domainName: string;
	pageView: string;
}[];

type AnalyticsItem = {
	domainName: string;
	pageView: string;
	dates: string;
};

type CrawlValue = {
	url: string;
	[key: string]: any;
};

type CrawlDataAndAnalyticsData = { [key: string]: TreeNode };

// use for checking if the nodes are initialized
const isReadyRender = ref(false);
const nodesInitialized = useNodesInitialized();

/************************************************
 * HELPER FUNCTIONS for creating Node and Edge
 ************************************************/
// 3-1: Create a node
const createNode = (id: string, value: TreeNode, parentId?: string): Node => ({
	id,
	type: 'custom',
	position: {
		x: value.x || 0,
		y: value.y || 0,
	},
	data: {
		title: value.title,
		level: value.level,
		url: value.url,
		thumbnailPath: value.thumbnailPath,
		pageView: value.pageView || null,
		dates: value.dates || '',
	},
});

// 3-2: Create an edge
const createEdge = (sourceId: string, targetId: string) => ({
	id: `${sourceId}-${targetId}`,
	type: 'custom',
	source: sourceId,
	target: targetId,
});

// 1: create data for sitemap rendering
const processData = (data: { [key: string]: TreeNode }, parentId?: string) => {
	let nodes: Node[] = [];
	let edges: Edge[] = [];

	// 3
	const processEntry = (key: string, value: TreeNode, processId?: string) => {
		const nodeId = processId ? `${processId}-${key}` : `${key}`;

		if (value.url) {
			nodes.push(createNode(nodeId, value, processId));
		}

		if (processId) {
			edges.push(createEdge(`${processId}`, `${processId}-${key}`));
		}

		// Recursively process children
		Object.entries(value).map(([childKey, childValue]) => {
			if (
				!['url', 'title', 'thumbnailPath', 'level', 'x', 'y', 'pageView', 'dates'].includes(childKey)
			) {
				// 6 Recursion
				const childProcessResult = processData(
					{ [childKey]: childValue },
					nodeId,
				);

				nodes = nodes.concat(childProcessResult.nodes);
				edges = edges.concat(childProcessResult.edges);
			}
		});
	};

	// 2
	Object.entries(data).map(([key, value]) => {
		processEntry(key, value, parentId);
	});

	return { nodes, edges };
};

/************************************************
 * Dagre FUNCTIONS for layout
 ************************************************/
const { graph, layout, previousDirection } = useLayout();
const layoutGraph = async (direction: string) => {
	nodes.value = layout(nodes.value, edges.value, direction);
};

/**************************************************************
 * `useVueFlow` provides:
 * 1. a set of methods to interact with the VueFlow instance (like `fitView`, `setViewport`, `addEdges`, etc)
 * 2. a set of event-hooks to listen to VueFlow events (like `onInit`, `onNodeDragStop`, `onConnect`, etc)
 * 3. the internal state of the VueFlow instance (like `nodes`, `edges`, `viewport`, etc)
 *************************************************************/
const {
	fitView,
	onPaneReady,
	onInit,
	onNodeDragStop,
	onConnect,
	addEdges,
	setViewport,
	toObject,
	onNodesChange,
	findEdge,
	updateEdge,
} = useVueFlow();

// initial data
const getSpecificCrawlDataFromSupabase = async (): Promise<CrawlData> => {
	const { data, error } = await client
		.from('crawl_data')
		.select('*')
		.eq('id', params.id);

	// Auth check
	if (data && data[0]?.user_id !== user.value?.id) {
		router.push('/sitemap');
		return;
	}

	if (error) {
		console.error('Failed to fetch user data:', error);
		return;
	}

	return data;
};

// get analytics data
const getSpecificGa4DataFromSupabase = async (): Promise<analyticsData> => {
	const { data, error } = await client
		.from('ga4_data')
		.select('*')
		.eq('id', params.id);

	if (data && data?.length > 0) {
		const combinedRows = data[0].analytics_data.reduce((acc: any[], item: any) => {
			const existingRow = acc.find(row =>
				row.date === item.date && row.domainName === item.domainName,
			// row.date === item.date && row.domainName === item.domainName,
			);

			if (existingRow) {
				existingRow.pageView = Number(existingRow.pageView) + Number(item.pageView);
			}
			else {
				acc.push({
					date: item.date,
					domainName: item.domainName,
					pageView: item.pageView,
				});
			}

			return acc;
		}, []);

		return combinedRows.map((item: { date: string; domainName: string; pageView: string }) => ({
			date: item.date,
			domainName: item.domainName,
			pageView: item.pageView,
		}));
	};

	if (error) {
		console.error('Failed to fetch user data:', error);
		return [];
	}

	return data[0].analytics_data;
};

// const { nodes: initialNodes, edges: initialEdges } = processData(tree);
const nodes = ref();
const edges = ref();

/************************************************************************
 * This is a Vue Flow event-hook which can be listened to from anywhere you call the composable, instead of only on the main component
 * Any event that is available as `@event-name` on the VueFlow component is also available as `onEventName` on the composable and vice versa
 *
 * onInit is called when the VueFlow viewport is initialized (INIT event)
 * onPaneReady is called when the VueFlow pane is ready (PANE_READY event)
 ***********************************************************************/
onBeforeMount(() => {
	useStyledLog('-1. onBeforeMount');
});

onMounted(async () => {
	useStyledLog('0. onMounted');
});

onInit(async (vueFlowInstance) => {
	useStyledLog('1. onInit');
});

onPaneReady(async (vueFlowInstance) => {
	useStyledLog('2. onPaneReady');

	const analyticsData = ref<analyticsData>([]);
	const crawlData = ref<CrawlData>([]);
	const crawlDataAndAnalyticsData = ref<any[]>([]);

	analyticsData.value = await getSpecificGa4DataFromSupabase();
	crawlData.value = await getSpecificCrawlDataFromSupabase();

	if (analyticsData.value.length > 0) {
		// combine crawlData and analyticsData
		const combineAnalyticsDataByDomainName = analyticsData.value.reduce((acc: any[], item: any) => {
			const existingRow = acc.find(row =>
				row.domainName === item.domainName,
			);

			if (existingRow) {
				existingRow.pageView = Number(existingRow.pageView) + Number(item.pageView);

				if (!Array.isArray(existingRow.dates)) {
					existingRow.dates = [existingRow.date];
					delete existingRow.date;
				}
				existingRow.dates.push(item.date);
			}
			else {
				acc.push({
					domainName: item.domainName,
					pageView: item.pageView,
					dates: [item.date],
				});
			}

			return acc;
		}, []);

		// TODO: Refactor this part
		if (crawlData.value && crawlData.value[0].json_data) {
			// Object.entries(crawlData.value[0].json_data).map(([key, value]) => {
			// 	const urlObject = new URL(value.url as string);
			// 	const valueUrl = urlObject.host + urlObject.pathname + urlObject.search + urlObject.hash;
			// 	const hostname = `${new URL(value.url as string).hostname}/`;

			// 	const analyticsItem = combineAnalyticsDataByDomainName.find(
			// 		(item: { domainName: string; pageView: string }) =>
			// 			item.domainName === hostname || item.domainName === `${valueUrl}/`,
			// 	);

			// 	crawlDataAndAnalyticsData.value.push({
			// 		[key]: {
			// 			...value,
			// 			pageView: analyticsItem?.pageView || 0,
			// 			dates: analyticsItem?.dates || '',
			// 		},
			// 	});

			// 	Object.entries(value).map(([childKey, childValue]) => {
			// 		if (typeof childValue === 'object') {
			// 			const childUrlObject = new URL(childValue.url as string);
			// 			const childValueUrl = childUrlObject.host + childUrlObject.pathname + childUrlObject.search + childUrlObject.hash;

			// 			const childrenAnalyticsItem = combineAnalyticsDataByDomainName.find(
			// 				(item: { domainName: string; pageView: string }) => {
			// 					return item.domainName === `${childValueUrl}`;
			// 				});

			// 			crawlDataAndAnalyticsData.value[0][key][childKey] = {
			// 				...childValue,
			// 				pageView: childrenAnalyticsItem?.pageView || 0,
			// 				dates: childrenAnalyticsItem?.dates || '',
			// 			};

			// 			Object.entries(childValue).map(([grandChildKey, grandChildValue]) => {
			// 				if (typeof grandChildValue === 'object') {
			// 					if (grandChildValue) {
			// 						console.log('grandChildValue', grandChildValue);
			// 						const grandChildUrlObject = new URL(grandChildValue.url as string);
			// 						const grandChildValueUrl = grandChildUrlObject.host + grandChildUrlObject.pathname + grandChildUrlObject.search + grandChildUrlObject.hash;

			// 						const grandChildrenAnalyticsItem = combineAnalyticsDataByDomainName.find(
			// 							(item: { domainName: string; pageView: string }) => {
			// 								return item.domainName === `${grandChildValueUrl}`;
			// 							});

			// 						crawlDataAndAnalyticsData.value[0][key][childKey][grandChildKey] = {
			// 							...grandChildValue,
			// 							pageView: grandChildrenAnalyticsItem?.pageView || 0,
			// 							dates: grandChildrenAnalyticsItem?.dates || '',
			// 						};
			// 					}
			// 				}
			// 			});
			// 		}
			// 	});
			// });

			function getUrlString(url: string): string {
				const urlObject = new URL(url);
				return urlObject.host + urlObject.pathname + urlObject.search + urlObject.hash;
			}

			function findAnalyticsItem(url: string, analyticsData: AnalyticsItem[]): AnalyticsItem | undefined {
				const urlString = getUrlString(url);
				const hostname = `${new URL(url).hostname}/`;

				return analyticsData.find(
					item => item.domainName === urlString,
				);
			}

			function processNode(
				value: CrawlValue,
				analyticsData: AnalyticsItem[],
			): CrawlValue {
				if (!value || typeof value !== 'object' || !value.url) {
					return value;
				}

				const analyticsItem = findAnalyticsItem(value.url as string, analyticsData);
				console.log('analyticsItem', analyticsItem);

				const processedValue: { [key: string]: any } = {
					...value,
					pageView: analyticsItem?.pageView || 0,
					dates: analyticsItem?.dates || '',
				};

				// Process all nested objects recursively
				Object.entries(value).forEach(([key, childValue]) => {
					if (childValue && typeof childValue === 'object') {
						processedValue[key] = processNode(childValue, analyticsData);
					}
				});

				return { ...processedValue, url: value.url };
			}

			// Main processing function
			function processCrawlData(
				crawlData: { value?: Array<{ json_data?: Record<string, any> }> },
				combineAnalyticsDataByDomainName: AnalyticsItem[],
			): Record<string, any>[] {
				if (!crawlData.value?.[0]?.json_data) {
					return [];
				}

				const result: Record<string, any>[] = [];
				const jsonData = crawlData.value[0].json_data;

				Object.entries(jsonData).forEach(([key, value]) => {
					result.push({
						[key]: processNode(value, combineAnalyticsDataByDomainName),
					});
				});

				return result;
			}

			crawlDataAndAnalyticsData.value = processCrawlData(
				crawlData,
				combineAnalyticsDataByDomainName,
			);
		}

		// if crawlDataAndAnalyticsData has value, then process the data
		if (crawlDataAndAnalyticsData.value && crawlDataAndAnalyticsData.value[0]) {
			const { nodes: specificNodes, edges: specificEdges } = processData(
				crawlDataAndAnalyticsData.value[0] as { [key: string]: TreeNode },
			);
			nodes.value = specificNodes;
			edges.value = specificEdges;
		}
	}
	else {
		if (crawlData.value && crawlData.value[0].json_data) {
			const { nodes: specificNodes, edges: specificEdges } = processData(
				crawlData.value[0].json_data,
			);
			nodes.value = specificNodes;
			edges.value = specificEdges;
		}
	}

	isReadyRender.value = true;

	nextTick(() => {
		useStyledLog('3. nextTick(finish dom update)');
		// get the first node and calculate the center of the node
		const firstNode = nodes.value[0];
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		const clientRect = firstNode?.position;
		const maxNodeLevel = Math.max(
			...nodes.value.map((node: { data: { level: any } }) => node.data.level),
		);

		if (clientRect) {
			// set the viewport to the center of the first node
			// setViewport(
			//   {
			//     x: 0,
			//     y: 0,
			//     zoom: 0.5,
			//   },
			//   { duration: 1000 },
			// );
		}

		// fit the view to the graph
		setTimeout(() => {
			vueFlowInstance.fitView({
				nodes: [nodes.value[0].id],
				offset: { x: 0, y: -200 },
				duration: 1000,
				minZoom: 0.5,
				maxZoom: 1,
				includeHiddenNodes: false,
			});
		}, 0);
	});

	useStyledLog('4.zoomed');
});

/************************************************************************
 * onNodeDragStop is called when a node is done being dragged
 *
 * Node drag events provide you with:
 * 1. the event object
 * 2. the nodes array (if multiple nodes are dragged)
 * 3. the node that initiated the drag
 * 4. any intersections with other nodes
 ***********************************************************************/
onNodeDragStop(({ event, nodes, node }) => {
	console.log('Node Drag Stop', { event, nodes, node });
});

/**************************************************************
 * onConnect is called when a new connection is created.
 *
 * You can add additional properties to your new edge (like a type or label) or block the creation altogether by not calling `addEdges`
 *************************************************************/
onConnect((connection) => {
	addEdges(connection);
});

/********************************************************************************
 * To update a node or multiple nodes, you can
 * 1. Mutate the node objects *if* you're using `v-model`
 * 2. Use the `updateNode` method (from `useVueFlow`) to update the node(s)
 * 3. Create a new array of nodes and pass it to the `nodes` ref
 ********************************************************************************/
function updatePos() {
	nodes.value = nodes.value.map((node: any) => {
		return {
			...node,
			position: {
				x: Math.random() * 400,
				y: Math.random() * 400,
			},
		};
	});
}

/**********************************************************************************
 * toObject transforms your current graph data to an easily persist-able object
 *********************************************************************************/
function logToObject() {
	console.log(toObject());
}

/***********************************************************************
 * Resets the current viewport transformation (zoom & pan)
 ***********************************************************************/
function resetTransform() {
	setViewport({ x: 0, y: 0, zoom: 1 });
}

/***********************************************************************
 * Collapse the nodes
 ***********************************************************************/
const collapseNode = (filterNodesPosition: any) => {
	// Get the same nodes and change the position
	const sameIdNodes = nodes.value.map((node: any, index: number) => {
		if (node.id.includes(filterNodesPosition[0].id)) {
			// avoid the error of using the id as querySelector
			const escapedId = CSS.escape(node.id);
			const theNode = document.querySelector(
				`[data-id=${escapedId}]`,
			) as HTMLElement;

			if (theNode && node.position?.x !== 0) {
				theNode.style.transform = `translate(${node.position?.x + index}px, ${node.position?.y + index}px)`;
				theNode.style.transition = 'transform 300ms ease-out';
			}
			else if (theNode) {
				theNode.style.transform = '';
				theNode.style.transition = '';
			}

			return {
				...node,
				data: {
					...node.data,
				},
				position: {
					x:
            node.id === filterNodesPosition[0].id
            	? filterNodesPosition[0].x
            	: filterNodesPosition[0].x + index,
					y:
            node.id === filterNodesPosition[0].id
            	? filterNodesPosition[0].y
            	: filterNodesPosition[0].y + index,
				},
			};
		}
		return node;
	});

	nodes.value = sameIdNodes;

	// remove transition after 300ms
	setTimeout(() => {
		removeTransitionStyle();
	}, 300);
};

/***********************************************************************
 * Expand the nodes
 ***********************************************************************/
const expandNode = (nodeId: string) => {
	// Get the position from localStorage
	const expandPositions = JSON.parse(localStorage.getItem(nodeId) || '[]');

	// Get the same nodes and change the position
	expandPositions.forEach((expandPosition: any) => {
		const sameIdNodes = nodes.value.map((node: any) => {
			if (node.id.includes(expandPosition.id)) {
				// avoid the error of using the id as querySelector
				const escapedId = CSS.escape(node.id);
				const theNode = document.querySelector(
					`[data-id=${escapedId}]`,
				) as HTMLElement;

				if (theNode) {
					theNode.style.transform = `translate(${expandPosition.x}px, ${expandPosition.y}px)`;
					theNode.style.transition = 'transform 300ms ease-out';
				}

				return {
					...node,
					data: {
						...node.data,
					},
					position: {
						x: expandPosition.x,
						y: expandPosition.y,
					},
				};
			}
			return node;
		});

		nodes.value = sameIdNodes;
		localStorage.removeItem(nodeId);
	});

	// remove transition after 300ms
	setTimeout(() => {
		removeTransitionStyle();
	}, 300);
};

// HELPER FUNCTION
const removeTransitionStyle = () => {
	const allNodes = document.querySelectorAll(
		'.vue-flow__node',
	) as NodeListOf<HTMLElement>;

	allNodes.forEach((node) => {
		node.style.transition = 'unset';
	});
};
</script>

<template>
	<!-- vue flow -->
	<div class="h-[calc(100vh-5.5rem)] w-full">
		<ClientOnly>
			<VueFlow
				v-show="isReadyRender"
				:nodes="nodes"
				:edges="edges"
				@nodes-initialized="layoutGraph('TB')"
			>
				<Background
					pattern-color="#aaa"
					:gap="16"
				/>

				<template #node-custom="customNodeProps">
					<FlowNode
						:id="customNodeProps.id"
						:data="customNodeProps.data"
						:nodes="nodes"
						@collapse-node="collapseNode"
						@expand-node="expandNode"
					/>
				</template>

				<template #edge-custom="customEdgeProps">
					<FlowEdge
						:id="customEdgeProps.id"
						:source-x="customEdgeProps.sourceX"
						:source-y="customEdgeProps.sourceY"
						:target-x="customEdgeProps.targetX"
						:target-y="customEdgeProps.targetY"
					/>
				</template>

				<MiniMap />
			</VueFlow>
		</ClientOnly>
	</div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import "@vue-flow/core/dist/style.css";

/* import the default theme, this is optional but generally recommended */
@import "@vue-flow/core/dist/theme-default.css";
</style>
