<script setup lang="ts">
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
	<div class="container p-0 relative z-10 h-full max-w-none gap-5">
		<!-- header -->
		<div
			class="sticky top-16 z-40 mb-3 flex items-center justify-between rounded-md border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-slate-800"
		>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
				site map
			</h1>
			<NuxtLink
				to="/sitemap/create-sitemap"
				class="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
			>
				created-sitemap page
			</NuxtLink>
		</div>

		<!-- card list  -->
		<div class="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
			<div
				v-for="crawlData in crawlDataList"
				:key="crawlData.id"
				class="grid grid-rows-[auto_1fr] rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="relative h-52 w-full overflow-hidden">
					<NuxtImg
						:src="getImageFromSupabaseStorage(crawlData.thumbnail_path)"
						alt="サムネイル"
						class="absolute inset-0 h-full w-full rounded-t-lg object-cover"
					/>
				</div>
				<div class="flex flex-col justify-between p-5">
					<div class="break-all">
						<a
							:href="crawlData.site_url"
							target="_blank"
						>
							<h5
								class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
							>
								{{ crawlData.site_url }}
							</h5>
						</a>
						<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
							{{ crawlData.created_at }}
						</p>
					</div>
					<NuxtLink
						:to="`/sitemap/${crawlData.id}`"
						class="inline-flex w-fit items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
					>
						sitemapをみる
						<svg
							class="ms-2 h-3.5 w-3.5 rtl:rotate-180"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 14 10"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M1 5h12m0 0L9 1m4 4L9 9"
							/>
						</svg>
					</NuxtLink>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import "@vue-flow/core/dist/style.css";

/* import the default theme, this is optional but generally recommended */
@import "@vue-flow/core/dist/theme-default.css";
</style>
