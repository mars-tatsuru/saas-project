<script setup lang="ts">
import { Icon } from '@iconify/vue';

const client = useSupabaseClient();
const user = useSupabaseUser();

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
};

const crawlDataList = ref<CrawlData[]>([]);
const getDataFromSupabase = async () => {
	const { data, error } = await client
		.from('crawl_data')
		.select('*')
		.eq('user_id', user.value?.id);

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

	return data.publicUrl;
};

/***********************************************
 * Delete crawl data from Supabase
 ***********************************************/
const deleteCrawlData = async (id: string, url: string, userId: string) => {
	const urlHost = new URL(url).hostname;

	console.log('deleteCrawlData', id, urlHost);

	try {
		// https://github.com/orgs/supabase/discussions/4218
		// Delete crawl data from storage
		const bucketName = 'thumbnail';
		const folderPath = `private/${userId}/${urlHost}`;
		console.log('folderPath:' + folderPath);

		// 1. empty the bucket
		const { data: list, error: listError } = await client.storage.from(bucketName).list(folderPath);
		if (listError) {
			console.error('Error listing files:', listError);
			throw listError;
		}
		console.log('list', list);
		if (!list || list.length === 0) {
			console.log('No files to remove');
			return;
		}

		// 2. remove the files
		const filesToRemove = list.map(x => `${folderPath}/${x.name}`);
		console.log('Files to remove:', filesToRemove);

		const { data, error: removeError } = await client.storage.from(bucketName).remove(filesToRemove);

		if (removeError) {
			console.error('Error removing files:', removeError);
			throw removeError;
		}

		console.log('Removal operation completed:', data);

		// 3. Verify deletion (optional, but helpful for debugging)
		const { data: verifyList, error: verifyError } = await client.storage.from(bucketName).list(folderPath);

		if (verifyError) {
			console.error('Error verifying deletion:', verifyError);
		}
		else {
			console.log('Files remaining after deletion:', verifyList);
		}

		// 4. Delete crawl data from database
		const { error: dbError } = await client
			.from('crawl_data')
			.delete()
			.eq('id', id);

		if (dbError) throw dbError;

		console.log('Successfully deleted crawl data and bucket');

		// Refresh data
		await getDataFromSupabase();
	}
	catch (error) {
		console.error('Failed to delete crawl data:', error);
		throw error;
	}
};
</script>

<template>
	<div class="container relative z-10 h-full max-w-none gap-5 p-0">
		<!-- header -->
		<PageHeader
			title="site map"
			href="/sitemap/create-sitemap"
			label="サイトマップを作成"
		/>

		<!-- card list  -->
		<div class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
			<Card
				v-for="crawlData in crawlDataList"
				:key="crawlData.id"
				class="grid grid-rows-[auto_1fr] dark:bg-slate-900"
			>
				<CardContent
					class="relative p-0"
				>
					<AlertDialog>
						<AlertDialogTrigger as-child>
							<Button
								variant="outline"
								class="absolute right-3 top-3 z-30 h-fit p-0"
							>
								<Icon
									icon="radix-icons:trash"
									class="size-6"
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
								<AlertDialogCancel>戻る</AlertDialogCancel>
								<AlertDialogAction
									@click="deleteCrawlData(crawlData.id, crawlData.site_url, crawlData.user_id)"
								>
									削除する
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<div class="relative h-52 w-full overflow-hidden">
						<NuxtImg
							:src="getImageFromSupabaseStorage(crawlData.thumbnail_path)"
							alt="サムネイル"
							class="absolute inset-0 size-full rounded-t-lg object-cover"
						/>
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
								{{ crawlData.created_at }}
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter
					class="items-end justify-center p-3"
				>
					<Button
						as-child
						class="relative"
						variant="link"
					>
						<NuxtLink
							:to="`/sitemap/${crawlData.id}`"
							class="flex items-center justify-center gap-3 font-bold underline"
						>
							サイトマップを見る
						</NuxtLink>
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
