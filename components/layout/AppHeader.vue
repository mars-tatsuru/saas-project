<script setup lang="ts">
import { onClickOutside, useColorMode } from '@vueuse/core';
import { Icon } from '@iconify/vue';
import { useStore } from '@/stores/index';

const store = useStore();
const client = useSupabaseClient();
const user = useSupabaseUser();

/************************
 * add userData into store
 *************************/
const mode = useColorMode();
const toggleColorMode = () => {
	const modeType = mode.value === 'light' ? 'dark' : 'light';
	mode.value = modeType;
	localStorage.setItem('color-mode', modeType);
};

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
const closeProfile = () => {
	isProfileCardOpen.value = false;
};

// close profile card when clicked outside
const target = ref(null);
onClickOutside(target, event => (isProfileCardOpen.value = false));

/************************
 * change profile name
 *************************/
const profileName = ref<string>('');
const loading = ref<boolean>(false);
const updateUserName = async (name: string) => {
	try {
		loading.value = true;
		const userId = user.value?.id;

		const updates = {
			id: userId,
			name,
			updated_at: new Date(),
		};

		// update the user's profile
		const { data: profile, error } = await client
			.from('profiles')
			.upsert(updates)
			.single();

		if (error) {
			throw error;
		}
	}
	catch (error) {
		alert(error);
	}
	finally {
		loading.value = false;
	}
};

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

	profileName.value = store.userData.name;
});
</script>

<template>
	<nav
		ref="header"
		:class="[
			'fixed right-0 top-0 z-50 border-b border-gray-200 bg-white  duration-300 dark:border-[#4c4c4c] dark:bg-[#171717]',
			{ 'md:w-[calc(100%-4rem)]': !store.isSidebarOpen, 'md:w-[calc(100%-16rem)]': store.isSidebarOpen },
		]"
	>
		<div class="p-3 lg:px-5 lg:pl-3">
			<div class="relative flex items-center justify-between">
				<div class="flex items-center justify-start rtl:justify-end">
					<!-- <AppBreadCrumb /> -->
				</div>
				<div class="flex items-center gap-2">
					<Button
						class="flex items-center justify-center rounded-full p-2"
						@click="toggleColorMode()"
					>
						<Icon
							icon="radix-icons:moon"
							class="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
						/>
						<Icon
							icon="radix-icons:sun"
							class="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
						/>
					</Button>
					<Button
						class="cursor-pointer rounded-full p-0"
						@click="openProfile"
					>
						<Avatar>
							<AvatarImage
								:src="store.userData.picture"
								alt="@radix-vue"
							/>
							<AvatarFallback>None</AvatarFallback>
						</Avatar>
					</Button>
				</div>
			</div>
		</div>
		<Card
			v-if="isProfileCardOpen"
			ref="target"
			class="absolute right-4 top-16 w-[350px] dark:bg-[#1f1f1f]"
		>
			<CardHeader class="relative">
				<CardTitle>Profile</CardTitle>
				<CardDescription>現在ログイン中のユーザー情報</CardDescription>
				<Button
					class="absolute right-6 top-6 h-fit border-none p-2 dark:bg-[#1f1f1f]"
					variant="outline"
					@click="closeProfile"
				>
					<Icon
						icon="radix-icons:cross-2"
						class="size-4"
					/>
				</Button>
			</CardHeader>
			<CardContent>
				<div class="flex flex-col items-center justify-center gap-3">
					<Avatar
						class="size-20 cursor-pointer"
					>
						<AvatarImage
							:src="store.userData.picture"
							alt="@radix-vue"
						/>
						<AvatarFallback>None</AvatarFallback>
					</Avatar>
					<div class="flex flex-col items-center gap-2">
						<p class="text-xl font-bold">
							{{ store.userData.name }}
						</p>
						<p>{{ store.userData.email }}</p>
					</div>
				</div>
			</CardContent>
			<CardFooter class="flex justify-center gap-2 px-6 pb-6">
				<Button
					as-child
					class="w-full"
					@click="closeProfile"
				>
					<NuxtLink to="/setting">
						設定へ
					</NuxtLink>
				</Button>
			</CardFooter>
		</Card>
	</nav>
</template>
