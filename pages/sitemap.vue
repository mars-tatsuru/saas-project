<script setup lang="ts">
import { ref } from "vue";
import { VueFlow, useVueFlow, useNodesInitialized } from "@vue-flow/core";
import type { Node, Edge } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import tree from "@/data/site_tree.json";
import FlowNode from "@/components/sitemap/FlowNode.vue";
import FlowEdge from "@/components/sitemap/FlowEdge.vue";
import { useLayout } from "@/utils/useLayout";

definePageMeta({
  title: "sitemap",
});

useHead({
  title: "sitemap",
});

type TreeNode = {
  level?: number;
  thumbnailPath?: string;
  title?: string;
  url?: string;
  x?: number;
  y?: number;
  [key: string]: any; // To include children nodes
};

// use for checking if the nodes are initialized
const isReadyRender = ref(false);
const nodesInitialized = useNodesInitialized();

// Utility Functions
const styledLog = (message: string, data: any = null): void => {
  // Skip logging in production
  if (process.env.ENVIRONMENT === "production") {
    return;
  }

  const styles = {
    prefix:
      "color: yellow; background-color: black; font-size: 14px; font-weight: bold; padding: 2px;",
    message:
      "color: limegreen; background-color: black; font-size: 14px; padding: 2px;",
    data: "color: white; background-color: black; font-size: 14px; padding: 2px;",
  };
  console.log(
    `%cDEBUG: %c${message}`,
    styles.prefix,
    styles.message,
    data || "",
  );
};

/************************************************
 * HELPER FUNCTIONS for creating Node and Edge
 ************************************************/
//3-1: Create a node
const createNode = (id: string, value: TreeNode, parentId?: string): Node => ({
  id,
  type: "custom",
  position: {
    x: value.x || 0,
    y: value.y || 0,
  },
  data: {
    title: value.title,
    level: value.level,
    url: value.url,
    thumbnailPath: value.thumbnailPath,
  },
});

// 3-2: Create an edge
const createEdge = (sourceId: string, targetId: string) => ({
  id: `${sourceId}-${targetId}`,
  type: "custom",
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
        !["url", "title", "thumbnailPath", "level", "x", "y"].includes(childKey)
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
} = useVueFlow();

// initial data
const { nodes: initialNodes, edges: initialEdges } = processData(tree);
const nodes = ref(initialNodes);
const edges = ref(initialEdges);

/************************************************************************
 * This is a Vue Flow event-hook which can be listened to from anywhere you call the composable, instead of only on the main component
 * Any event that is available as `@event-name` on the VueFlow component is also available as `onEventName` on the composable and vice versa
 *
 * onInit is called when the VueFlow viewport is initialized (INIT event)
 * onPaneReady is called when the VueFlow pane is ready (PANE_READY event)
 ***********************************************************************/
onBeforeMount(() => {
  styledLog("-1. onBeforeMount");
});

onMounted(() => {
  styledLog("0. onMounted");
  isReadyRender.value = true;
});

onInit(async (vueFlowInstance) => {
  styledLog("1. onInit");
});

onPaneReady(async (vueFlowInstance) => {
  styledLog("2. onPaneReady");

  // fit the view to the graph
  vueFlowInstance.fitView({
    nodes: [nodes.value[0].id],
  });

  nextTick(() => {
    styledLog("3. nextTick(finish dom update)");
    // get the first node and calculate the center of the node
    const firstNode = nodes.value[0];
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const clientRect = firstNode?.position;
    const maxNodeLevel = Math.max(
      ...nodes.value.map((node) => node.data.level),
    );

    if (clientRect) {
      // set to the first node
      setViewport(
        {
          x: -clientRect.x / 2 + windowWidth / 2 - 200, // 200 is width of the node
          y: clientRect.y - windowHeight / maxNodeLevel + 50, // windowHeight / maxNodeLevel is the height of the node rendered
          zoom: 0.5,
        },
        { duration: 1000 },
      );
    }
  });

  styledLog("4.zoomed");
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
  console.log("Node Drag Stop", { event, nodes, node });
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
 * Toggles the dark mode
 ***********************************************************************/
// our dark mode toggle flag
const dark = ref(false);
function toggleDarkMode() {
  dark.value = !dark.value;
}

/***********************************************************************
 * Collapse the nodes
 ***********************************************************************/
const collapseNode = (filterNodesPosition: any) => {
  // Get the same nodes and change the position
  const sameIdNodes = nodes.value.map((node: any) => {
    if (node.id.includes(filterNodesPosition[0].id)) {
      // avoid the error of using the id as querySelector
      const escapedId = CSS.escape(node.id);
      const theNode = document.querySelector(
        `[data-id=${escapedId}]`,
      ) as HTMLElement;

      if (theNode && node.position?.x !== 0) {
        theNode.style.transform = `translate(${node.position?.x}px, ${node.position?.y}px)`;
        theNode.style.transition = "transform 300ms ease-out";
      } else if (theNode) {
        theNode.style.transform = "";
        theNode.style.transition = "";
      }

      return {
        ...node,
        data: {
          ...node.data,
        },
        position: {
          x: filterNodesPosition[0].x,
          y: filterNodesPosition[0].y,
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
  const expandPositions = JSON.parse(localStorage.getItem(nodeId) || "[]");

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
          theNode.style.transition = "transform 300ms ease-out";
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
    ".vue-flow__node",
  ) as NodeListOf<HTMLElement>;

  allNodes.forEach((node) => {
    node.style.transition = "unset";
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
        :class="{ dark }"
        @nodesInitialized="layoutGraph('TB')"
      >
        <Background pattern-color="#aaa" :gap="16" />

        <template #node-custom="customNodeProps">
          <FlowNode
            :id="customNodeProps.id"
            :data="customNodeProps.data"
            :nodes="nodes"
            @collapseNode="collapseNode"
            @expandNode="expandNode"
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
