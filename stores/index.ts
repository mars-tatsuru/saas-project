import { defineStore } from "pinia";

type User = {
  name: string;
  email: string;
  picture: string;
};

export const useStore = defineStore("sidebar", () => {
  const isSidebarOpen = ref<boolean>(true);
  const userData = ref<User>({
    name: "",
    email: "",
    picture: "",
  });

  return { isSidebarOpen, userData };
});
