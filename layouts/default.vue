<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue';
import AppSidebar from '~/components/layout/AppSidebar.vue';
import { useStore } from '@/stores/index';

const route = useRoute();
const store = useStore();

/************************
 * header toggle
 *************************/
const main = ref<HTMLElement | null>(null);
watch(
	() => store.isSidebarOpen,
	() => {
		main.value?.classList.toggle('md:!w-[calc(100%-4rem)]');
	},
);

/************************************************
 * color mode from cookie for loading
 *************************************************/
const colorMode = useCookie('color-mode');
colorMode.value = colorMode.value === 'light' ? 'light' : 'dark';
</script>

<template>
	<div class="bg-white dark:bg-black">
		<!-- Sidebar -->
		<AppSidebar class="hidden md:grid" />

		<!-- Header -->
		<AppHeader class="hidden md:block" />

		<!-- Only client render -->
		<ClientOnly
			fallback-tag="span"
		>
			<!-- Main -->
			<div
				ref="main"
				:class="['ml-auto min-h-screen bg-slate-100 px-4 py-0 transition-all duration-300 dark:bg-[#171717] md:w-[calc(100%-16rem)] md:p-4 md:pt-20',
					!store.isSidebarOpen ? 'md:w-[calc(100%-4rem)]' : 'md:w-[calc(100%-16rem)]',
				]"
			>
				<div
					class="hidden min-h-[calc(100vh-5.5rem)] w-full dark:border-gray-700 md:block"
				>
					<slot />
				</div>

				<div class="flex min-h-screen items-center justify-center md:hidden">
					<p class="text-slate-800 dark:text-white">
						You can only use this app with PC.<br>
						Please use a PC to access this app.
					</p>
				</div>
			</div>

			<template #fallback>
				<span
					:class="[
						'absolute left-1/2 top-1/2 z-50 flex h-screen w-screen -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-2xl font-bold',
						colorMode === 'dark' ? 'bg-[#171717] text-white' : 'bg-white text-[#171717]',
					]"
				>
					Loading...
				</span>
			</template>
		</ClientOnly>
	</div>
</template>
