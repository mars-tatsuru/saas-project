import { defineStore } from "pinia";

export const useStore = defineStore("counter", () => {
  const isSidebarOpen = ref(true);

  return { isSidebarOpen };
});
