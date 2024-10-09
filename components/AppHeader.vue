<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { useStore } from '@/stores/index';

const route = useRoute();
const store = useStore();
const client = useSupabaseClient();
const user = useSupabaseUser();

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
		class="fixed right-0 top-0 z-50 w-full border-b border-gray-200 bg-white duration-300 md:w-[calc(100%-16rem)] dark:border-gray-700 dark:bg-gray-800"
	>
		<div class="px-3 py-3 lg:px-5 lg:pl-3">
			<div class="relative flex items-center justify-between">
				<div class="flex items-center justify-start rtl:justify-end">
					<!-- <AppBreadCrumb /> -->
				</div>
				<div class="flex items-center">
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
									class="h-8 w-8 rounded-full"
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
