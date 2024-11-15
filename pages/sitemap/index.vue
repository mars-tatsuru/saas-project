<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useToast } from '@/components/ui/toast/use-toast';

const client = useSupabaseClient();
const user = useSupabaseUser();
const { toast } = useToast();

definePageMeta({
	title: 'sitemap',
});

useHead({
	title: 'sitemap',
});

/************************************************
 * Determine if the user is logged in
 *************************************************/
definePageMeta({
	middleware: 'auth',
});

/************************************************
 * Get crawl data from Supabase
 *************************************************/
onMounted(() => {
	if (!user.value) {
		return;
	}
	getDataFromSupabase();
});

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

/***********************************************
 * Format the date and time to Japanese format
 ***********************************************/
const getImageFromSupabaseStorage = (thumbnailPath: string) => {
	const { data } = client.storage.from('thumbnail').getPublicUrl(thumbnailPath);

	// TODO: when the image is not found
	if (!data) {
		return '';
	}

	return data.publicUrl;
};

/***********************************************
 * Delete crawl data from Supabase
 ***********************************************/
const isAlertOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const deleteData = ref<CrawlData | null>(null);
const openModal = (crawlData: CrawlData) => {
	deleteData.value = crawlData;
	isAlertOpen.value = true;
};

const closeModal = () => {
	isAlertOpen.value = false;
	deleteData.value = null;
};

const deleteCrawlData = async () => {
	// Start loading
	isLoading.value = true;

	if (!deleteData.value) {
		return;
	}

	// Get the hostname from the URL
	const urlHost = new URL(deleteData.value.site_url).hostname;

	try {
		// https://github.com/orgs/supabase/discussions/4218
		// Delete crawl data from storage
		const bucketName = 'thumbnail';
		const folderPath = `private/${deleteData.value.user_id}/${urlHost}`;

		// 1. empty the bucket
		// TODO: supabase function (DataBase → Functions)
		const { data: list, error: listError } = await client.storage.from(bucketName).list(folderPath);
		if (listError) {
			console.error('Error listing files:', listError);
			throw listError;
		}

		if (!list || list.length === 0) {
			return;
		}

		// 2. remove the files
		const filesToRemove = list.map(x => `${folderPath}/${x.name}`);

		const { data, error: removeError } = await client.storage.from(bucketName).remove(filesToRemove);

		if (removeError) {
			console.error('Error removing files:', removeError);
			throw removeError;
		}

		// 3. Verify deletion (optional, but helpful for debugging)
		const { data: verifyList, error: verifyError } = await client.storage.from(bucketName).list(folderPath);
		if (verifyError) {
			console.error('Error verifying deletion:', verifyError);
		}

		// 4. Delete crawl data from database
		const { error: dbError } = await client
			.from('crawl_data')
			.delete()
			.eq('id', deleteData.value.id);

		if (dbError) throw dbError;

		await getDataFromSupabase();

		// Refresh data
		isLoading.value = false;
		isAlertOpen.value = false;

		setTimeout(() => {
			toast({
				title: 'サイトマップ削除',
				description: 'サイトマップを削除しました。',
				variant: 'success',
			});
		}, 500);
	}
	catch (error) {
		console.error('Failed to delete crawl data:', error);
		isLoading.value = false;
		isAlertOpen.value = false;

		setTimeout(() => {
			toast({
				title: 'サイトマップ削除',
				description: 'サイトマップの削除に失敗しました。',
				variant: 'destructive',
			});
		}, 500);

		throw error;
	}
};

/***********************************************
 * Realtime data fetching
 ***********************************************/
const crawlProgress = ref<number>(0);
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

						crawlProgress.value = 0;
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

						crawlProgress.value = Number(number_of_crawled_page) / Number(number_of_crawl_page) * 100;
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

/***********************************************
 * Watch for user changes
 ***********************************************/
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
			title="Sitemap"
			href="/sitemap/create-sitemap"
			label="サイトマップを作成"
		/>

		<!-- card list  -->
		<div class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
			<Card
				v-for="crawlData in crawlDataList"
				:key="crawlData.user_id"
				class="grid grid-rows-[auto_1fr] dark:border-[#4c4c4c] dark:bg-[#1f1f1f]"
			>
				<CardContent
					class="relative p-0"
				>
					<AlertDialog
						:open="isAlertOpen"
					>
						<AlertDialogTrigger as-child>
							<Button
								v-if="crawlData.json_data"
								variant="outline"
								class="absolute right-3 top-3 z-30 h-fit p-0"
								@click.prevent="openModal(crawlData)"
							>
								<Icon
									icon="radix-icons:trash"
									class="size-6 rounded-md dark:bg-[#1f1f1f]"
								/>
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
								<AlertDialogDescription>
									一度削除すると元に戻すことはできません。
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel
									@click="closeModal"
								>
									戻る
								</AlertDialogCancel>
								<AlertDialogAction
									@click="deleteCrawlData"
								>
									{{ isLoading ? '削除中...' : '削除する' }}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<div class="relative h-52 w-full overflow-hidden">
						<NuxtImg
							v-if="crawlData.thumbnail_path"
							:src="getImageFromSupabaseStorage(crawlData.thumbnail_path)"
							alt="サムネイル"
							class="absolute inset-0 size-full rounded-t-lg object-cover"
						/>
						<div
							v-else
							class="relative h-52 w-full"
						>
							<Skeleton
								class="size-full rounded-none rounded-t-lg bg-gray-300 dark:bg-[#333333]"
							/>
							<div class="absolute left-1/2 top-1/2 flex w-4/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4">
								<p class="text-sm font-normal text-gray-700 dark:text-gray-200">
									now crawling...
								</p>
								<Progress
									v-model="crawlProgress"
									class="w-full"
								/>
							</div>
						</div>
					</div>
					<div class="flex flex-col justify-between p-3">
						<div class="flex flex-col gap-2 break-all">
							<a
								:href="crawlData.site_url"
								target="_blank"
							>
								<h5
									class="line-clamp-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
								>
									{{ crawlData.site_url }}
								</h5>
							</a>
							<p class="font-normal text-gray-700 dark:text-gray-400">
								クロール日: {{ new Date(crawlData.created_at).toLocaleString('ja-JP', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
								}) }}
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter class="items-end justify-center p-3">
					<Button
						as-child
						class="relative"
						variant="link"
					>
						<NuxtLink
							v-if="crawlData.json_data"
							:to="`/sitemap/${crawlData.id}`"
							class="flex items-center justify-center gap-3 font-bold underline"
						>
							サイトマップを見る
						</NuxtLink>
						<span
							v-else
							class="flex cursor-progress items-center justify-center gap-3 font-bold text-gray-500"
						>
							クロール中...
						</span>
					</Button>
				</CardFooter>
			</Card>
		</div>
	</div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import "@vue-flow/core/dist/style.css";

/* import the default theme, this is optional but generally recommended */
@import "@vue-flow/core/dist/theme-default.css";
</style>
