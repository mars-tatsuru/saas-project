<script setup lang="ts">
import { useToast } from '@/components/ui/toast/use-toast';

definePageMeta({
	title: 'Setting',
});

useHead({
	title: 'Setting',
});

const store = useStore();
const client = useSupabaseClient();
const user = useSupabaseUser();
const { toast } = useToast();

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
			alert('Failed to update the user profile');
			throw error;
		}

		store.userData.name = name || user.value?.user_metadata.name;
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
	<div class="container relative z-10 h-full min-h-full max-w-none gap-5 p-0">
		<!-- header -->
		<PageHeader
			title="Setting"
			href=""
			label=""
		/>

		<!-- content -->
		<div class="mt-4 min-h-[calc(100vh-12rem)] w-full rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
			<div class="">
				<h2 class="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-100">
					Profile
				</h2>
				<div class="flex flex-col gap-2">
					<Label class="text-base">名前</Label>
					<div class="flex items-center gap-2">
						<input
							v-model="inputName"
							type="text"
							class="w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
						<Button

							@click="async() => {
								await updateUserName(inputName);
								toast({
									title: 'プロフィール更新',
									description: 'プロフィールが正常に更新されました',
								});
							}"
						>
							{{ loading ? "変更中..." : "変更する" }}
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- toast -->
		<Toaster />
	</div>
</template>
