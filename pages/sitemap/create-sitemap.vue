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

/************************************************
 * Form schema
 *************************************************/
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

/************************************************
 * Crawl submit function
 *************************************************/
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

/************************************************
 * Get crawl data from Supabase function
 *************************************************/
type CrawlData = {
	id: string;
	created_at: string;
	site_url: string;
	user_id: string;
	json_data: any;
	thumbnail_path: string;
	number_of_crawled_page: string;
	number_of_crawl_page: string;
};

const crawlDataList = ref<CrawlData[]>([]);
const getDataFromSupabase = async () => {
	const { data, error } = await client
		.from('crawl_data')
		.select('*')
		.eq('user_id', user.value?.id).order('id', { ascending: false });

	crawlDataList.value = data || [];

	if (error) {
		console.error('Failed to fetch user data:', error);
		return;
	}
};

const fetchRealtimeData = () => {
	try {
		client
			.channel('SaaS-kit') // 任意のチャンネル名
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'crawl_data',
				},
				(payload) => {
					// insert
					if (payload.eventType === 'INSERT') {
						const { id, created_at, site_url, user_id, json_data, thumbnail_path, number_of_crawl_page, number_of_crawled_page } = payload.new;

						if (user.value?.id !== user_id) {
							return;
						}

						crawlDataList.value = [
							...crawlDataList.value,
							{
								id,
								created_at,
								site_url,
								user_id,
								json_data,
								thumbnail_path,
								number_of_crawl_page,
								number_of_crawled_page,
							},
						];
					}

					// update
					if (payload.eventType === 'UPDATE') {
						const { id, created_at, site_url, user_id, json_data, thumbnail_path, number_of_crawl_page, number_of_crawled_page } = payload.new;
						crawlDataList.value = crawlDataList.value.map((item) => {
							if (item.id === id) {
								return {
									id,
									created_at,
									site_url,
									user_id,
									json_data,
									thumbnail_path,
									number_of_crawl_page,
									number_of_crawled_page,
								};
							}
							return item;
						});
					}

					// delete
					if (payload.eventType === 'DELETE') {
						const { id } = payload.old;
						crawlDataList.value = crawlDataList.value.filter(item => item.id !== id);
					}
				},
			)
			.subscribe();

		// リスナーの解除
		return () => client.channel('SaaS-kit').unsubscribe();
	}
	catch (error) {
		// console.error(error);
	}
};

onMounted(async () => {
	await getDataFromSupabase();
});

watchEffect(async () => {
	if (user.value) {
		fetchRealtimeData();
	}
});
</script>

<template>
	<div class="container relative z-10 h-full max-w-none gap-5 p-0">
		<!-- header -->
		<PageHeader
			title="サイトマップ作成"
			href="/sitemap"
			label="サイトマップ一覧に戻る"
		/>

		<!-- form and crawl data -->
		<div class="mt-4 flex min-h-[calc(100vh-12rem)] w-full gap-6 rounded-md border border-gray-200 bg-white p-6 dark:border-[#4c4c4c] dark:bg-[#1f1f1f]">
			<!-- Form Section -->
			<div class="flex h-[calc(100vh-14rem)] w-3/5">
				<Form
					class="flex w-full flex-col gap-8"
					:validation-schema="formSchema"
					@submit="onCrawlSubmit"
				>
					<!-- URL Input Field -->
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
							<FormDescription class="dark:text-white">
								サイトマップを作成するためのURLを入力してください。
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormField>

					<!-- Number of Pages Input Field -->
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
							<FormDescription class="dark:text-white">
								クロールするページ数を入力してください。
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormField>

					<!-- Submit Button -->
					<Button
						type="submit"
						class="w-44 bg-gradient-to-r from-[#4B81F5] to-[#2C4B8F] dark:from-white dark:to-white"
					>
						{{ isLoading ? 'リクエスト中...' : 'サイトマップ作成' }}
					</Button>
				</Form>
			</div>

			<!-- Divider -->
			<div class="w-1 self-stretch bg-gray-100" />

			<!-- Results Table Section -->
			<div class="flex h-[calc(100vh-14rem)] w-2/5 flex-col">
				<h3 class="mb-4 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					クロール済URL
				</h3>
				<div class="grow overflow-auto">
					<Table v-if="crawlDataList.length > 0">
						<TableHeader>
							<TableRow>
								<TableHead>id</TableHead>
								<TableHead>site url</TableHead>
								<TableHead>page</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow
								v-for="crawlData in crawlDataList"
								:key="crawlData.id"
							>
								<TableCell class="font-medium">
									{{ crawlData.id }}
								</TableCell>
								<TableCell>{{ crawlData.site_url }}</TableCell>
								<TableCell>{{ crawlData.number_of_crawl_page }}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<div v-else>
						<p>クロール済みのデータはありません。</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
</style>
