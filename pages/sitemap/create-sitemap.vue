<script setup lang="ts">
import { ref } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/toast/use-toast';

const formSchema = toTypedSchema(z.object({
	crawlurl: z.string({
		required_error: 'URLを入力してください',
	}).url({
		message: '有効なURLを入力してください',
	}),
}));

definePageMeta({
	title: 'create-sitemap',
	middleware: 'auth',
});

useHead({
	title: 'create-sitemap',
});

const client = useSupabaseClient();
const { toast } = useToast();
const router = useRouter();
const user = useSupabaseUser();
const siteUrl = ref<string>('');
const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const VITE_CRAWL_API = import.meta.env.VITE_CRAWL_API;

const onCrawlSubmit = async () => {
	console.log('Crawling started...');

	if (!user.value?.id) {
		errorMessage.value = 'User not authenticated';
		return;
	}

	isLoading.value = true;
	errorMessage.value = null;

	try {
		const response = await fetch(
			`${VITE_CRAWL_API}/crawl?siteUrl=${siteUrl.value}&userId=${user.value.id}`,
			{ method: 'GET' },
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		toast({
			title: 'サイトマップ作成リクエスト',
			description: 'サイトマップ作成リクエストを受け付けました。',
			variant: 'success',
		});

		isLoading.value = false;
		siteUrl.value = '';
	}
	catch (error) {
		console.error('Crawling failed:', error);
		errorMessage.value
      = error instanceof Error ? error.message : 'An unknown error occurred';

		toast({
			title: 'サイトマップ作成リクエスト',
			description: 'サイトマップ作成リクエストに失敗しました。再度お試しください。',
			variant: 'destructive',
		});
	}
};
</script>

<template>
	<div class="container relative z-10 h-full max-w-none gap-5 p-0">
		<!-- header -->
		<PageHeader
			title="サイトマップ作成"
			href="/sitemap"
			label="サイトマップ一覧に戻る"
		/>

		<!-- form -->
		<div
			class="mt-4  min-h-[calc(100vh-12rem)] rounded-md border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-slate-800"
		>
			<Form
				class="space-y-6"
				:validation-schema="formSchema"
				@submit="onCrawlSubmit"
			>
				<FormField
					v-slot="{ componentField }"
					name="crawlurl"
				>
					<FormItem>
						<FormLabel>クロール対象URL</FormLabel>
						<FormControl>
							<Input
								v-bind="componentField"
								v-model="siteUrl"
								type="text"
								placeholder="https://example.com"
							/>
						</FormControl>
						<FormDescription>
							サイトマップを作成するためのURLを入力してください。
						</FormDescription>
						<FormMessage />
					</FormItem>
				</FormField>
				<Button
					type="submit"
					class="bg-gradient-to-r from-[#4B81F5] to-[#2C4B8F] dark:from-white dark:to-white"
				>
					{{ isLoading ? 'リクエスト中...' : 'サイトマップ作成' }}
				</Button>
			</Form>
		</div>

		<!-- toast -->
		<Toaster />
	</div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>
