<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "@/components/dashboard/Card.vue";
import { createSwapy } from "swapy";

definePageMeta({
  title: "HOME",
});

useHead({
  title: "HOME",
});

const isReady = ref(false);

type CardDataType = {
  title: string;
  content: string;
  dataSwapyItem: string;
};

// card data
const cardData = ref<Record<string, CardDataType>>({
  a: { title: "Card A", content: "A", dataSwapyItem: "a" },
  b: { title: "Card B", content: "B", dataSwapyItem: "b" },
  c: { title: "Card C", content: "C", dataSwapyItem: "c" },
  d: { title: "Card D", content: "D", dataSwapyItem: "d" },
  e: { title: "Card E", content: "E", dataSwapyItem: "e" },
  f: { title: "Card F", content: "F", dataSwapyItem: "f" },
  g: { title: "Card E", content: "G", dataSwapyItem: "g" },
  h: { title: "Card F", content: "H", dataSwapyItem: "h" },
});

type SlotItemType = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | null;

// default slot items
const DEFAULT: Record<string, SlotItemType> = {
  "1": "a",
  "2": "b",
  "3": "c",
  "4": "d",
  "5": "e",
  "6": "f",
  "7": "g",
  "8": "h",
};

// slot items
const slotItems = ref<Record<string, SlotItemType>>(DEFAULT);

// emit updateCardData event
const updateCardData = (dataSwapyItem: string, newContent: string) => {
  if (dataSwapyItem in cardData.value) {
    cardData.value[dataSwapyItem].content = newContent;
    localStorage.setItem("cardDataItems", JSON.stringify(cardData.value));
  }
};

// initialize slot items
onMounted(async () => {
  const slotItem = localStorage.getItem("slotItem");
  const cardDataItems = localStorage.getItem("cardDataItems");

  if (slotItem) {
    slotItems.value = JSON.parse(slotItem);
  }

  if (cardDataItems) {
    cardData.value = JSON.parse(cardDataItems);
  }

  isReady.value = true;

  await nextTick();

  const container = document.querySelector(".container");

  if (container) {
    try {
      const swapy = createSwapy(container, {
        animation: "dynamic",
      });

      if (!swapy) {
        throw new Error("Swapy instance is undefined");
      }

      swapy.onSwap(({ data }) => {
        if (data?.object) {
          localStorage.setItem("slotItem", JSON.stringify(data.object));
        }
      });
    } catch (error) {
      console.error("Error creating Swapy:", error);
    }
  } else {
    console.error("Container element not found");
  }
});

function getItemById(itemId: SlotItemType) {
  if (itemId && itemId in cardData.value) {
    return { component: Card, props: cardData.value[itemId] };
  }
  return { component: null, props: {} };
}

const slotClasses = {
  "1": "col-start-1 col-end-2 bg-gray-100",
  "2": "col-start-2 col-end-4 bg-slate-400",
  "3": "col-start-1 col-end-3 bg-slate-400",
  "4": "col-start-3 col-end-4 bg-gray-100",
  "5": "col-start-1 col-end-2 bg-gray-100",
  "6": "col-start-2 col-end-4 bg-slate-400",
  "7": "col-start-1 col-end-3 bg-slate-400",
  "8": "col-start-3 col-end-4 bg-gray-100",
};
</script>

<template>
  <div
    v-if="isReady"
    class="container relative z-10 grid h-full max-w-none grid-cols-3 grid-rows-[1fr_1fr_1fr] gap-5"
  >
    <div
      v-for="slotId in Object.keys(slotItems)"
      :key="slotId"
      :class="[
        'rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800',
        slotClasses[slotId as keyof typeof slotClasses],
      ]"
      :data-swapy-slot="slotId"
    >
      <component
        :is="getItemById(slotItems[slotId]).component"
        v-bind="getItemById(slotItems[slotId]).props"
        @updateCardData="updateCardData"
      />
    </div>
  </div>
</template>
