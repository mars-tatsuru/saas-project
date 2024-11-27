<script setup lang="ts">
import type { DateRange } from 'radix-vue';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import {
	CalendarDate,
	DateFormatter,
	getLocalTimeZone,
} from '@internationalized/date';

definePageMeta({
	title: 'sitemap-setting',
	middleware: 'auth',
});

useHead({
	title: 'Sitemap Setting',
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const { params } = useRoute();
const router = useRouter();

const jsonKey = ref<string>('');
const propertyId = ref<string>('');
const analyticsData = ref<any>(null);

/****************************************************
 * get specific ga4 data from supabase
 ***************************************************/
const getSpecificGa4DataFromSupabase = async () => {
	const { data, error } = await client
		.from('ga4_data')
		.select('*')
		.eq('id', params.id);

	return data;
};

/****************************************************
 * analytics graph
 ***************************************************/
interface AnalyticsGraphData {
	date: string;
	domainName: string;
	pageView: number;
}
const analyticsGraphData = ref<AnalyticsGraphData[]>([]);

/****************************************************
 * tab menu
 ***************************************************/
const tabMenu = ref([
	{
		name: 'analytics',
		label: 'アナリティクス設定',
	},
	{
		name: 'analyticsGraph',
		label: 'アナリティクスグラフ',
	},
]);

/****************************************************
 * calendar
 ***************************************************/
const df = new DateFormatter('ja-JP', {
	dateStyle: 'medium',
});

const startYear = ref<number | null>(null);
const startMonth = ref<number | null>(null);
const startDay = ref<number | null>(null);
const endYear = ref<number | null>(null);
const endMonth = ref<number | null>(null);
const endDay = ref<number | null>(null);

const calendarValue = ref({
	start: new CalendarDate(Number(startYear.value), Number(startMonth.value), Number(startDay.value)),
	end: new CalendarDate(Number(endYear.value), Number(endMonth.value), Number(endDay.value)),
}) as Ref<DateRange>;

/****************************************************
 * mounted
 ***************************************************/
onMounted(async () => {
	const ga4Data = await getSpecificGa4DataFromSupabase();

	if (ga4Data && ga4Data?.length > 0) {
		// set json key, property id, and analytics data
		jsonKey.value = JSON.stringify(ga4Data[0].json_key);
		propertyId.value = ga4Data[0].property_id;
		analyticsData.value = ga4Data[0].analytics_data;

		const combinedRows = analyticsData.value.reduce((acc: any[], item: any) => {
			const existingRow = acc.find(row =>
				row.date === item.date,
				// row.date === item.date && row.domainName === item.domainName,
			);

			if (existingRow) {
				existingRow.pageView = Number(existingRow.pageView) + Number(item.pageView);
			}
			else {
				acc.push({
					date: item.date,
					domainName: item.domainName,
					pageView: item.pageView,
				});
			}

			return acc;
		}, []);

		analyticsGraphData.value = combinedRows.map((item: { date: string; domainName: string; pageView: string }) => ({
			date: item.date,
			// domainName: item.domainName,
			pageView: item.pageView,
		}));

		// set calendar value
		startYear.value = ga4Data[0].analytics_data[0].date.slice(0, 4);
		startMonth.value = ga4Data[0].analytics_data[0].date.slice(5, 7);
		startDay.value = ga4Data[0].analytics_data[0].date.slice(8, 10);
		endYear.value = ga4Data[0].analytics_data[ga4Data[0].analytics_data.length - 1].date.slice(0, 4);
		endMonth.value = ga4Data[0].analytics_data[ga4Data[0].analytics_data.length - 1].date.slice(5, 7);
		endDay.value = ga4Data[0].analytics_data[ga4Data[0].analytics_data.length - 1].date.slice(8, 10);

		calendarValue.value = {
			start: new CalendarDate(
				Number(startYear.value),
				Number(startMonth.value),
				Number(startDay.value),
			),
			end: new CalendarDate(
				Number(endYear.value),
				Number(endMonth.value),
				Number(endDay.value),
			),
		};
	}
	else {
		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth() + 1;
		const day = currentDate.getDate();
		// set calendar value
		calendarValue.value = {
			start: new CalendarDate(year, month, day),
			end: new CalendarDate(year, month, day),
		};
	}
});
</script>

<template>
	<div class="container relative z-10 h-full max-w-none gap-5 p-0">
		<!-- header -->
		<PageHeader
			title="Sitemap Setting"
			href="/sitemap"
			label="サイトマップ一覧に戻る"
		/>

		<!-- main -->
		<Tabs
			default-value="analytics"
			class="mt-4 flex min-h-[calc(100vh-12.5rem)] w-full gap-8 rounded-md border border-gray-200 bg-white p-6 dark:border-[#4c4c4c] dark:bg-[#1f1f1f]"
		>
			<!-- side menu -->
			<div class="w-3/12">
				<TabsList
					class="sticky top-48 flex flex-col items-start justify-start gap-4 p-4"
				>
					<TabsTrigger
						v-for="item in tabMenu"
						:key="item.name"
						:value="item.name"
						class="w-full items-center justify-start"
					>
						{{ item.label }}
					</TabsTrigger>
				</TabsList>
			</div>

			<!-- Divider -->
			<div class="w-[2px] self-stretch bg-gray-100" />

			<div
				class="size-full"
			>
				<TabsContent
					value="analytics"
					class="m-0"
				>
					<div
						class="flex size-full flex-col justify-start gap-10"
					>
						<div class="grid gap-2">
							<h3 class=" text-xl font-semibold">
								Google Cloud JsonKey
							</h3>
							<Textarea
								v-model="jsonKey"
								disabled
								class="h-80 w-full"
								:placeholder="jsonKey ? '' : 'JsonKeyが登録されていません。'"
							/>
						</div>
						<div class="grid gap-2">
							<h3 class=" text-xl font-semibold">
								GA4 Property ID
							</h3>
							<Input
								v-model="propertyId"
								disabled
								class="w-full"
								:placeholder="propertyId ? '' : 'propertyIdが登録されていません。'"
							/>
						</div>
						<div>
							<Button
								@click="() => router.push(`/sitemap/setting/${params.id}/analytics/`)"
							>
								アナリティクス設定へ
							</Button>
						</div>
					</div>
				</TabsContent>
				<TabsContent
					value="analyticsGraph"
					class="m-0"
				>
					<div
						class="grid size-full grid-rows-[auto,auto,1fr] gap-10"
					>
						<div class="flex flex-col items-start gap-4">
							<h3 class="text-xl font-bold">
								ページビュー数
							</h3>
							<Popover>
								<PopoverTrigger as-child>
									<Button
										variant="outline"
										:class="!calendarValue && 'text-muted-foreground'"
										class="w-[280px] justify-start text-left font-normal"
										:disabled="!analyticsGraphData.length"
									>
										<CalendarIcon class="mr-2 size-4" />
										<template v-if="calendarValue.start">
											<template v-if="calendarValue.end">
												{{ df.format(calendarValue.start.toDate(getLocalTimeZone())) }} - {{ df.format(calendarValue.end.toDate(getLocalTimeZone())) }}
											</template>

											<template v-else>
												{{ df.format(calendarValue.start.toDate(getLocalTimeZone())) }}
											</template>
										</template>
										<template v-else>
											Pick a date
										</template>
									</Button>
								</PopoverTrigger>
								<PopoverContent class="w-auto p-0">
									<RangeCalendar
										v-model="calendarValue"
										initial-focus
										:number-of-months="2"
										@update:start-value="(startDate) => calendarValue.start = startDate"
									/>
								</PopoverContent>
							</Popover>
						</div>
						<BarChart
							v-if="analyticsGraphData.length > 0"
							index="date"
							:data="analyticsGraphData"
							:categories="['pageView']"
							:type="'stacked'"
							class="size-full shrink-0 pb-6"
							:colors="['#10B981']"
						/>
						<p
							v-else
							class="text-sm text-muted-foreground"
						>
							アナリティクスデータがありません。<br>
							アナリティクス設定からデータを取得してください。
						</p>
					</div>
				</TabsContent>
			</div>
		</Tabs>
	</div>
</template>
