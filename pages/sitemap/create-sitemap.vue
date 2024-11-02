<script setup lang="ts">
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

/************************************************
 * Form schema
 *************************************************/
const hasSameUrl = (url: string) => {
	const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
	const origin = urlRegex.test(url) ? new URL(url).origin : '';
	const isFlag = crawlDataList.value.some(data =>
		data.site_url === url || (origin !== '' && data.site_url.includes(origin)),
	);

	if (isFlag) {
		const targetRow = document.querySelector('#targetRow');
		if (targetRow) {
			setTimeout(() => {
				targetRow.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'center',
				});
			}, 200);
		}
	}

	return isFlag;
};

const formSchema = toTypedSchema(z.object({
	crawlUrl: z.string({
		required_error: 'URLを入力してください',
	}).url({
		message: '有効なURLを入力してください',
	}).refine(value => !hasSameUrl(value), {
		message: '同じURLが既にクロールされています',
	}),

	numberOfCrawlPage: z.number({
		required_error: 'クロール数を入力してください',
		invalid_type_error: '数値を入力してください',
	}).min(1, '0以上の数値を入力してください'),
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
				siteUrl: new URL(siteUrl.value).origin + '/',
				userId: user.value.id,
				numberOfCrawlPage: String(numberOfCrawlPage.value),
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		setTimeout(async () => {
			// Reset form
			isLoading.value = false;
			siteUrl.value = '';
			await getDataFromSupabase();

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

onMounted(async () => {
	await getDataFromSupabase();
});
</script>

<template>
	<div class="container relative z-10 h-full max-w-none gap-5 p-0">
		<!-- header -->
		<PageHeader
			title="Create Sitemap"
			href="/sitemap"
			label="サイトマップ一覧に戻る"
		/>

		<!-- form and crawl data -->
		<div class="mt-4 flex min-h-[calc(100vh-12.5rem)] w-full gap-6 rounded-md border border-gray-200 bg-white p-6 dark:border-[#4c4c4c] dark:bg-[#1f1f1f]">
			<!-- Form Section -->
			<div class="flex max-h-[calc(100vh-16rem)] w-3/5">
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
								サイトマップを作成するためのURLを入力してください。<br>
								<span class="text-[0.8rem]">※クロール対象URLは同じURLが既にクロールされていないか確認してください。</span><br>
								<span class="text-[0.8rem]">※クロールは入力していただいたURLのトップページから開始いたします。</span>
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
			<div class="w-[2px] self-stretch bg-gray-100" />

			<!-- Results Table Section -->
			<div class="flex max-h-[calc(100vh-16rem)] w-2/5 flex-col">
				<h3 class="mb-4 pt-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
								:id="crawlData.site_url === siteUrl ? 'targetRow' : undefined"
								:key="crawlData.id"
								:class="siteUrl === crawlData.site_url || siteUrl.includes(crawlData.site_url) ? 'hover:bg-red-100 bg-red-100 dark:hover:bg-red-900 dark:bg-red-900' : ''"
							>
								<TableCell class="font-medium">
									{{ crawlData.id }}
								</TableCell>
								<TableCell>
									{{ crawlData.site_url }}
								</TableCell>
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
