<script setup lang="ts">
// use supabase client
const client = useSupabaseClient();
const user = useSupabaseUser();

// use router
const router = useRouter();

definePageMeta({
	layout: 'custom',
});

watchEffect(() => {
	if (user.value) {
		router.push('/');
	}
});

const login = async (providerName: 'google' | 'github') => {
	try {
		const res = await client.auth.signInWithOAuth({
			provider: providerName,
		});
	}
	catch (error) {
		console.error(error);
	}
};
</script>

<template>
	<div
		class="relative z-10 flex h-full max-w-none flex-col items-center justify-center gap-5"
	>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
			Login
		</h1>
		<div class="">
			<button
				class="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				type="button"
				@click="login('google')"
			>
				Login with Google
			</button>
		</div>
	</div>
</template>
