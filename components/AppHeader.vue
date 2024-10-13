<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { useStore } from '@/stores/index';

const route = useRoute();
const store = useStore();
const client = useSupabaseClient();
const user = useSupabaseUser();
const colorMode = useColorMode();

console.log(colorMode.preference);

/************************
 * header toggle
 *************************/
const header = ref<HTMLElement | null>(null);
watch(
	() => store.isSidebarOpen,
	() => {
		header.value?.classList.toggle('md:!w-[calc(100%-4rem)]');
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
onClickOutside(target, event => (isProfileCardOpen.value = false));

/************************
 * add userData into store
 *************************/
onMounted(async () => {
	const userId = user.value?.id;
	const { data, error } = await client
		.from('profiles')
		.select('name')
		.eq('id', userId);

	store.userData = {
		name: (data && data[0]?.name) || user.value?.user_metadata.name,
		email: user.value?.user_metadata.email,
		picture: user.value?.user_metadata.picture,
	};
});
</script>

<template>
	<nav
		ref="header"
		class="fixed right-0 top-0 z-50 w-full border-b border-gray-200 bg-white duration-300 dark:border-gray-700 dark:bg-gray-800 md:w-[calc(100%-16rem)]"
	>
		<div class="p-3 lg:px-5 lg:pl-3">
			<div class="relative flex items-center justify-between">
				<div class="flex items-center justify-start rtl:justify-end">
					<!-- <AppBreadCrumb /> -->
				</div>
				<div class="flex items-center">
					<DropdownMenu>
						<DropdownMenuTrigger as-child>
							<Button variant="outline">
								<Icon
									icon="radix-icons:moon"
									class="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
								/>
								<Icon
									icon="radix-icons:sun"
									class="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
								/>
								<span class="sr-only">Toggle theme</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem @click="colorMode.preference='light'">
								Light
							</DropdownMenuItem>
							<DropdownMenuItem @click="colorMode.preference = 'dark'">
								Dark
							</DropdownMenuItem>
							<DropdownMenuItem @click="colorMode.preference = 'system'">
								System
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<div class="ms-3 flex items-center">
						<div v-if="store.userData.picture">
							<button
								type="button"
								class="flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
								aria-expanded="false"
								data-dropdown-toggle="dropdown-user"
								@click="openProfile"
							>
								<img
									class="size-8 rounded-full"
									:src="store.userData.picture"
									alt="user photo"
								>
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
			:name="store.userData.name"
			:email="store.userData.email"
			:picture="store.userData.picture"
		/>
	</nav>
</template>
