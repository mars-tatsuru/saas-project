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
					class="p-0"
				>
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
