<script setup lang="ts">
import { useStore } from "@/stores/index";

const route = useRoute();
const store = useStore();
const router = useRouter();
const client = useSupabaseClient();
const user = useSupabaseUser();


/************************
 * sign out
 *************************/
const signOutWithGoogle = async () => {
  if (user.value) {
    await client.auth.signOut();
    store.userData = {
      name: "",
      email: "",
      picture: "",
    };
    router.push("/login");
  } else {
    router.push("/login");
  }

};

/************************
 * sidebar menu
 *************************/
const routePath = ref(route.path);
const isOpen = ref(false);

const openMenu = () => {
  if (!store.isSidebarOpen) {
    return;
  }
  isOpen.value = !isOpen.value;
};

watch(() => route.path, (path) => {
  routePath.value = path;
  console.log(path);
});

onMounted(() => {
  // set sidebar open/close
  store.isSidebarOpen = JSON.parse(localStorage.getItem("isSidebarOpen") || "true");
  sidebar.value?.classList.toggle("!w-16", !store.isSidebarOpen);
});

/************************
 * sidebar toggle
 *************************/
const sidebar = ref<HTMLElement | null>(null);
const toggleSidebar = () => {
  store.isSidebarOpen = !store.isSidebarOpen;
  sidebar.value?.classList.toggle("!w-16");

  isOpen.value = false;

  // set local storage
  localStorage.setItem("isSidebarOpen", store.isSidebarOpen.toString());
};
</script>

<template>
  <aside
    id="logo-sidebar"
    class="fixed grid grid-cols-1 grid-rows-[60px_1fr] gap-4 px-3 left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-width duration-300 sm:translate-x-0 dark:border-gray-700 dark:bg-gray-800"
    aria-label="Sidebar"
    ref="sidebar"
  >
    <div class="flex items-center justify-between rtl:justify-end">
      <NuxtLink to="/" class="flex">
        <span
          class="self-center whitespace-nowrap text-xl font-semibold sm:text-2xl dark:text-white"
          :class="!store.isSidebarOpen && 'hidden'"
        >
          SaaS Kit
        </span>
      </NuxtLink>
      <button
        data-drawer-target="logo-sidebar"
        data-drawer-toggle="logo-sidebar"
        aria-controls="logo-sidebar"
        type="button"
        class="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        @click="toggleSidebar"
      >
        <svg
          class="h-6 w-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>
    </div>
    <div
      class="relative grid h-full grid-cols-1 grid-rows-[1fr_100px] bg-white dark:bg-gray-800 pb-4"
    >
      <ul class="w-full space-y-2 font-medium overflow-y-auto">
        <li>
          <NuxtLink
            to="/"
            class="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="routePath === '/' && 'bg-gray-100 dark:bg-gray-700'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em"
              height="1.5em"
              viewBox="0 0 24 24"
              class="flex-shrink-0"
            >
              <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"/>
            </svg>
            <span
              class="ms-3"
              :class="!store.isSidebarOpen ? 'hidden delay-150' : 'delay-150'"
            >
              HOME
            </span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/dashboard"
            class="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="routePath === '/dashboard' && 'bg-gray-100 dark:bg-gray-700'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5rem"
              height="1.5rem"
              viewBox="0 0 36 36"
              class="flex-shrink-0"
            >
              <path
                fill="currentColor"
                d="m25.18 12.32l-5.91 5.81a3 3 0 1 0 1.41 1.42l5.92-5.81Z"
                class="clr-i-outline clr-i-outline-path-1"
              />
              <path
                fill="currentColor"
                d="M18 4.25A16.49 16.49 0 0 0 5.4 31.4l.3.35h24.6l.3-.35A16.49 16.49 0 0 0 18 4.25m11.34 25.5H6.66a14.43 14.43 0 0 1-3.11-7.84H7v-2H3.55A14.4 14.4 0 0 1 7 11.29l2.45 2.45l1.41-1.41l-2.43-2.46A14.4 14.4 0 0 1 17 6.29v3.5h2V6.3a14.47 14.47 0 0 1 13.4 13.61h-3.48v2h3.53a14.43 14.43 0 0 1-3.11 7.84"
                class="clr-i-outline clr-i-outline-path-2"
              />
              <path fill="none" d="M0 0h36v36H0z" />
            </svg>
            <span
              class="ms-3"
              :class="!store.isSidebarOpen ? 'hidden delay-150' : 'delay-150'"
            >
              Dashboard
            </span>
          </NuxtLink>
        </li>
        <li>
          <button
            type="button"
            class="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            aria-controls="dropdown-example"
            data-collapse-toggle="dropdown-example"
            @click="openMenu"
            :class="routePath === '/api' || routePath === '/api-market' ? 'bg-gray-100 dark:bg-gray-700' : ''"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5rem"
              height="1.5rem"
              viewBox="0 0 512 512"
              class="flex-shrink-0"
            >
              <path
                fill="currentColor"
                d="M421.415 309.528c-7.209 0-14.186.938-20.909 2.54l-.636-1.005l-83.542-131.894c18.528-16.698 30.257-40.888 30.257-67.894c0-50.366-40.556-91.197-90.585-91.197s-90.585 40.83-90.585 91.197c0 27.006 11.728 51.196 30.257 67.894L112.13 311.063l-.636 1.005c-6.723-1.602-13.7-2.54-20.91-2.54C40.557 309.528 0 350.358 0 400.725s40.556 91.197 90.585 91.197s90.584-40.83 90.584-91.197c0-34.507-19.045-64.525-47.122-80.016l81.138-128.098c12.276 6.257 26.114 9.86 40.815 9.86s28.54-3.603 40.816-9.86l81.137 128.098c-28.077 15.49-47.122 45.509-47.122 80.016c0 50.366 40.556 91.197 90.584 91.197S512 451.092 512 400.725s-40.556-91.197-90.585-91.197M90.353 443.791c-23.319 0-42.223-18.903-42.223-42.222s18.904-42.223 42.223-42.223s42.222 18.904 42.222 42.223s-18.903 42.222-42.222 42.222"
              />
            </svg>
            <span
              class="ms-3 flex-1 whitespace-nowrap text-left rtl:text-right"
              :class="!store.isSidebarOpen ? 'hidden delay-150' : 'delay-150'"
            >
              API
            </span>
            <svg
              class="h-3 w-3 flex-shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
              :class="!store.isSidebarOpen && 'hidden'"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <ul
            id="dropdown-example"
            class="space-y-2 py-2"
            :class="isOpen && 'block', !isOpen && 'hidden'"
          >
            <li
              :class="!store.isSidebarOpen && 'hidden'"
            >
              <NuxtLink
                to="/api"
                class="group flex w-full items-center rounded-lg p-2 pl-11 text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                :class="routePath === '/api' && 'bg-gray-100 dark:bg-gray-700'"
              >
                TOP
              </NuxtLink>
            </li>
            <li
              :class="!store.isSidebarOpen && 'hidden'"
            >
              <NuxtLink
                to="/api-market"
                class="group flex w-full items-center rounded-lg p-2 pl-11 text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                :class="routePath === '/api-market' && 'bg-gray-100 dark:bg-gray-700'"
              >
                API MARKET
              </NuxtLink>
            </li>
          </ul>
        </li>
        <li>
          <NuxtLink
            to="/sitemap"
            class="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="routePath === '/sitemap' && 'bg-gray-100 dark:bg-gray-700'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em" height="1.5em"
              viewBox="0 0 24 24"
              class="flex-shrink-0"
            >
              <path fill="currentColor" d="M9 2v6h2v3H5c-1.11 0-2 .89-2 2v3H1v6h6v-6H5v-3h6v3H9v6h6v-6h-2v-3h6v3h-2v6h6v-6h-2v-3c0-1.11-.89-2-2-2h-6V8h2V2z"/>
            </svg>
            <span
              class="ms-3"
              :class="!store.isSidebarOpen ? 'hidden delay-150' : 'delay-150'"
            >
              Sitemap
            </span>
          </NuxtLink>
        </li>
      </ul>
      <ul
        class="w-full space-y-2 border-t border-gray-200 pt-4 font-medium dark:border-gray-700"
      >
        <li>
          <NuxtLink
            to="/setting"
            class="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="routePath === '/setting' && 'bg-gray-100 dark:bg-gray-700'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5rem"
              height="1.5rem"
              viewBox="0 0 24 24"
              class="flex-shrink-0"
            >
              <path
                fill="currentColor"
                d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9l-1.28 2.22l-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24l-1.3-2.21l.8-.9a3 3 0 0 0 0-4l-.8-.9l1.28-2.2l1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24l1.28 2.22l-.8.9a3 3 0 0 0 0 3.98m-6.77-6a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2"
              />
            </svg>
            <span
              class="ms-3 flex-1 whitespace-nowrap"
              :class="!store.isSidebarOpen ? 'hidden delay-150' : 'delay-150'"
            >
              Setting
            </span>
          </NuxtLink>
        </li>
        <li>
          <a
            @click="signOutWithGoogle"
            class="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5rem"
              height="1.5rem"
              viewBox="0 0 24 24"
              class="flex-shrink-0"
            >
              <path
                fill="currentColor"
                d="M4 12a1 1 0 0 0 1 1h7.59l-2.3 2.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76a1 1 0 0 0-.21-.33l-4-4a1 1 0 1 0-1.42 1.42l2.3 2.29H5a1 1 0 0 0-1 1M17 2H7a3 3 0 0 0-3 3v3a1 1 0 0 0 2 0V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-2 0v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3"
              />
            </svg>
            <span
              class="ms-3 flex-1 whitespace-nowrap"
              :class="!store.isSidebarOpen ? 'hidden delay-150' : 'delay-150'"
            >
            Sign Out
          </span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>
