<script setup lang="ts">
import { useStore } from "@/stores/index";
import { onClickOutside } from "@vueuse/core";

const route = useRoute();
const store = useStore();

/************************
 * header toggle
 *************************/
const header = ref<HTMLElement | null>(null);
watch(
  () => store.isSidebarOpen,
  () => {
    header.value?.classList.toggle("md:!w-[calc(100%-4rem)]");
  },
);

/************************
 * profile card toggle
 *************************/
const isProfileCardOpen = ref(false);

const openProfile = () => {
  isProfileCardOpen.value = true;
};

// button以外をおしたらカードも閉じる
const target = ref(null);
onClickOutside(target, (event) => (isProfileCardOpen.value = false));
</script>

<template>
  <nav
    class="fixed right-0 top-0 z-50 w-full border-b border-gray-200 bg-white duration-300 md:w-[calc(100%-16rem)] dark:border-gray-700 dark:bg-gray-800"
    ref="header"
  >
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="relative flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
          <AppBreadCrumb />
        </div>
        <div class="flex items-center">
          <div class="ms-3 flex items-center">
            <div>
              <button
                type="button"
                class="flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                aria-expanded="false"
                data-dropdown-toggle="dropdown-user"
                @click="openProfile"
              >
                <img
                  class="h-8 w-8 rounded-full"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="user photo"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AppProfileCard
      v-if="isProfileCardOpen"
      ref="target"
      class="absolute -bottom-[320px] right-4"
    />
  </nav>
</template>
