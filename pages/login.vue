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
		<Card class="w-full dark:bg-slate-900 md:max-w-xl">
			<CardHeader>
				<CardTitle>SaaS Kit</CardTitle>
				<CardDescription>ログインしてください</CardDescription>
			</CardHeader>
			<CardContent>
				<Button
					class="w-full"
					type="button"
					@click="login('google')"
				>
					Login with Google
				</Button>
			</CardContent>
		</Card>
	</div>
</template>
