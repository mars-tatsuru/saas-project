import { defineStore } from "pinia";

export const useStore = defineStore("sidebar", () => {
  const isSidebarOpen = ref(true);

  return { isSidebarOpen };
});
