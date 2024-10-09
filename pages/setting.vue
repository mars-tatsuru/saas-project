<script setup lang="ts">
definePageMeta({
	title: 'Setting',
});

useHead({
	title: 'Setting',
});

const store = useStore();
const client = useSupabaseClient();
const user = useSupabaseUser();

/************************************************
 * Determine if the user is logged in
 *************************************************/
definePageMeta({
	middleware: 'auth',
});

/************************************************
 * Get the user's profile
 *************************************************/
const inputName = ref<string>('');
const loading = ref<boolean>(false);

onMounted(async () => {
	const userId = user.value?.id;
	const { data, error } = await client
		.from('profiles')
		.select('name')
		.eq('id', userId);

	inputName.value
    = (data && data[0]?.name) || user.value?.user_metadata.name || '';
});

/************************************************
 * Update the user's profile
 *************************************************/
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
		else {
			alert('プロフィールを更新しました！');
			store.userData.name = name || user.value?.user_metadata.name;
		}
	}
	catch (error) {
		alert(error);
	}
	finally {
		loading.value = false;
	}
};
</script>

<template>
	<div class="container relative z-10 h-full min-h-full max-w-none gap-5">
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
			setting
		</h1>
		<div class="mt-6 w-full">
			<div class="flex items-center gap-2">
				<span class="text-white">Name:</span>
				<input
					v-model="inputName"
					type="text"
					class="w-64 rounded-md border border-gray-300 p-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:text-gray-100"
				>
				<button
					class="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
					@click="updateUserName(inputName)"
				>
					{{ loading ? "変更中..." : "変更する" }}
				</button>
			</div>
		</div>
	</div>
</template>
