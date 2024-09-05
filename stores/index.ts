import { defineStore } from "pinia";

type User = {
  name: string;
  email: string;
  picture: string;
};

export const useStore = defineStore("sidebar", () => {
  /************************************************
   * Sidebar state
   *************************************************/
  const isSidebarOpen = ref<boolean>(true);

  /************************************************
   * user's data
   *************************************************/
  const userData = ref<User>({
    name: "",
    email: "",
    picture: "",
  });

  return { isSidebarOpen, userData };
});
