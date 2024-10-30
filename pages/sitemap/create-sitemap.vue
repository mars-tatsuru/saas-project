<script setup lang="ts">
import { ref } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/toast/use-toast';

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
const numberOfCrawlPage = ref<number>(10);
const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const VITE_CRAWL_API = import.meta.env.VITE_CRAWL_API;

// for validation
const formSchema = toTypedSchema(z.object({
	crawlUrl: z.string({
		required_error: 'URLを入力してください',
	}).url({
		message: '有効なURLを入力してください',
	}),

	numberOfCrawlPage: z.number({
		required_error: 'クロール数を入力してください',
	}).default(numberOfCrawlPage.value),
}));

// for submit
const onCrawlSubmit = async () => {
	if (!user.value?.id) {
		errorMessage.value = 'User not authenticated';
		return;
	}

	isLoading.value = true;
	errorMessage.value = null;

	try {
		const response = await fetch(`${VITE_CRAWL_API}/crawl`, {
			method: 'POST',
			credentials: 'include',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				siteUrl: siteUrl.value,
				userId: user.value.id,
				numberOfCrawlPage: String(numberOfCrawlPage.value),
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		setTimeout(() => {
			// Reset form
			isLoading.value = false;
			siteUrl.value = '';

			// Show success toast
			toast({
				title: 'サイトマップ作成リクエスト',
				description: 'サイトマップ作成リクエストを受け付けました。',
				variant: 'success',
			});
		}, 2000);

		// setTimeout(() => {
		// 	// Redirect to sitemap page
		// 	router.push('/sitemap');
		// }, 4000);
	}
	catch (error) {
		console.error('Crawling failed:', error);
		errorMessage.value
      = error instanceof Error ? error.message : 'An unknown error occurred';

		// Reset form
		isLoading.value = false;

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
			class="mt-4 min-h-[calc(100vh-12rem)] rounded-md border border-gray-200 bg-white p-6  dark:border-[#4c4c4c] dark:bg-[#1f1f1f]"
		>
			<Form
				class="space-y-6"
				:validation-schema="formSchema"
				@submit="onCrawlSubmit"
			>
				<FormField
					v-slot="{ componentField }"
					name="crawlUrl"
				>
					<FormItem>
						<FormLabel>クロール対象URL</FormLabel>
						<FormControl>
							<Input
								v-bind="componentField"
								v-model="siteUrl"
								type="text"
								class="border-gray-300 bg-gray-100 placeholder:text-[#575757] dark:border-[#6c6c6c] dark:bg-[#171717] dark:text-white dark:placeholder:text-[#575757]"
								placeholder="https://example.com"
							/>
						</FormControl>
						<FormDescription
							class="dark:text-white"
						>
							サイトマップを作成するためのURLを入力してください。
						</FormDescription>
						<FormMessage />
					</FormItem>
				</FormField>

				<FormField
					v-slot="{ componentField }"
					name="numberOfCrawlPage"
				>
					<FormItem>
						<FormLabel>クロール数</FormLabel>
						<FormControl>
							<NumberField
								v-bind="componentField"
								v-model:model-value="numberOfCrawlPage"
								:default-value="numberOfCrawlPage"
								:min="0"
							>
								<NumberFieldContent>
									<NumberFieldDecrement />
									<NumberFieldInput
										class="border-gray-300 bg-gray-100 placeholder:text-[#575757] dark:border-[#6c6c6c] dark:bg-[#171717] dark:text-white dark:placeholder:text-[#575757]"
									/>
									<NumberFieldIncrement />
								</NumberFieldContent>
							</NumberField>
						</FormControl>
						<FormDescription
							class="dark:text-white"
						>
							クロールするページ数を入力してください。
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
	</div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>
