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
</script>

<template>
	<div class="bg-white dark:bg-black">
		<!-- Sidebar -->
		<AppSidebar class="hidden md:grid" />

		<!-- Header -->
		<AppHeader class="hidden md:block" />

		<!-- Main -->
		<div
			ref="main"
			class="ml-auto min-h-screen bg-slate-100 px-4 py-0 transition-all duration-300 dark:bg-[#171717] md:w-[calc(100%-16rem)] md:p-4 md:pt-20"
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
	</div>
</template>
