<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { Check, Circle, Dot } from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast/use-toast';

definePageMeta({
	title: 'create-sitemap',
	middleware: 'auth',
});

useHead({
	title: 'create-sitemap',
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const { toast } = useToast();
const { params } = useRoute();
const router = useRouter();
const VITE_CRAWL_API = import.meta.env.VITE_CRAWL_API;

const jsonKey = ref<string>('');
const propertyId = ref<string>('');

/****************************************************
 * resister JsonKey and PropertyId
 ***************************************************/
const resisterJsonKeyAndPropertyId = async (jsonKey: string, propertyId: string) => {
	try {
		const userId = user.value?.id;

		const updates = {
			id: params.id,
			user_id: userId,
			json_key: JSON.parse(jsonKey),
			property_id: propertyId,
		};

		// update the user's profile
		const { data: ga4Data, error } = await client
			.from('ga4_data')
			.upsert(updates)
			.single();

		if (error) {
			throw error;
		}

		toast({
			title: 'JsonKeyとプロパティIDの登録',
			description: 'JsonKeyとプロパティIDの登録が完了しました。',
			variant: 'success',
		});
	}
	catch (error) {
		toast({
			title: 'JsonKeyとプロパティIDの登録',
			description: 'JsonKeyとプロパティIDの登録に失敗しました。',
			variant: 'destructive',
		});
	}
};

/****************************************************
 * link sitemap
 ***************************************************/
const analytics = ref<any>({});
const onclickLinkSitemap = async () => {
	if (!user.value?.id) {
		// errorMessage.value = 'User not authenticated';
		return;
	}

	try {
		const response = await fetch(`${VITE_CRAWL_API}/analytics`, {
			method: 'POST',
			credentials: 'include',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				paramsId: params.id,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		analytics.value = data[0];

		// Show success toast
		toast({
			title: 'サイトマップ作成リクエスト',
			description: 'サイトマップ作成リクエストを受け付けました。',
			variant: 'success',
		});
	}
	catch (error) {
		console.error('Crawling failed:', error);

		toast({
			title: 'サイトマップ作成リクエスト',
			description: 'サイトマップ作成リクエストに失敗しました。再度お試しください。',
			variant: 'destructive',
		});
	}
};

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

onMounted(async () => {
	const ga4Data = await getSpecificGa4DataFromSupabase();

	if (ga4Data && ga4Data?.length > 0) {
		jsonKey.value = JSON.stringify(ga4Data[0].json_key);
		propertyId.value = ga4Data[0].property_id;
	}
});

/****************************************************
 * step progress
 ***************************************************/
const formSchema = [
	z.object({
		jsonKey: z.string(({
			required_error: 'JsonKeyを入力してください',
		})),
	}),
	z.object({
		propertyId: z.string(
			({
				required_error: 'プロパティIDを入力してください',
			}),
		).min(9, '9文字以上のプロパティIDを入力してください').max(9, '9文字以下のプロパティIDを入力してください'),
	}),
];

const stepIndex = ref(1);
const steps = [
	{
		step: 1,
		title: 'JsonKeyの登録',
		description: 'サービスアカウントのJsonKeyを入力してください。',
	},
	{
		step: 2,
		title: 'プロパティIDの登録',
		description: 'Google AnalyticsのプロパティIDを入力してください。',
	},
	{
		step: 3,
		title: '入力項目の確認と保存',
		description: '入力項目を確認して保存してください。',
	},
];
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
		<div class="mt-4 min-h-[calc(100vh-12.5rem)] w-full rounded-md border border-gray-200 bg-white p-6 dark:border-[#4c4c4c] dark:bg-[#1f1f1f]">
			<Tabs
				default-value="analytics"
				class="mx-auto max-w-screen-lg"
			>
				<TabsList class="mb-8 grid w-full grid-cols-2">
					<TabsTrigger value="analytics">
						GA4連携設定
					</TabsTrigger>
					<TabsTrigger value="password">
						Password
					</TabsTrigger>
				</TabsList>
				<TabsContent
					value="analytics"
				>
					<Form
						v-slot="{ meta, values, validate }"
						as=""
						keep-values
						:validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
					>
						<Stepper
							v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
							v-model="stepIndex"
							class="block w-full"
						>
							<form
								@submit="(e) => {
									e.preventDefault()
									validate()

									if (stepIndex === steps.length && meta.valid) {
										resisterJsonKeyAndPropertyId(values.jsonKey, values.propertyId);
									}
								}"
							>
								<div class="flex w-full gap-2">
									<StepperItem
										v-for="step in steps"
										:key="step.step"
										v-slot="{ state }"
										class="relative flex w-full flex-col items-center justify-center"
										:step="step.step"
									>
										<StepperSeparator
											v-if="step.step !== steps[steps.length - 1].step"
											class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
										/>

										<StepperTrigger as-child>
											<Button
												:variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
												size="icon"
												class="z-10 shrink-0 rounded-full"
												:class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
												:disabled="state !== 'completed' && !meta.valid"
											>
												<Check
													v-if="state === 'completed'"
													class="size-5"
												/>
												<Circle v-if="state === 'active'" />
												<Dot v-if="state === 'inactive'" />
											</Button>
										</StepperTrigger>

										<div class="mt-5 flex flex-col items-center text-center">
											<StepperTitle
												:class="[state === 'active' && 'text-primary']"
												class="text-sm font-semibold transition lg:text-base"
											>
												{{ step.title }}
											</StepperTitle>
											<StepperDescription
												:class="[state === 'active' && 'text-primary']"
												class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
											>
												{{ step.description }}
											</StepperDescription>
										</div>
									</StepperItem>
								</div>

								<div class="mt-4 flex flex-col gap-4">
									<template v-if="stepIndex === 1">
										<FormField
											v-slot="{ componentField }"
											name="jsonKey"
										>
											<FormItem>
												<FormLabel>
													JsonKeyの登録
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger>
																<Icon
																	name="mingcute:question-line"
																	class="size-4 text-black dark:text-white"
																/>
															</TooltipTrigger>
															<TooltipContent class="grid gap-2 p-4">
																<h2 class="text-base">
																	Google CloudのJsonKeyとは？
																</h2>
																<p>
																	Google Cloudのサービスアカウントを作成した際にダウンロードできるJsonファイルです。
																</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</FormLabel>
												<FormControl>
													<Textarea
														type="text"
														class="max-h-96 min-h-96 border-gray-300 bg-gray-50 placeholder:text-[#575757] dark:border-[#6c6c6c] dark:bg-[#171717] dark:text-white dark:placeholder:text-[#575757]"
														v-bind="componentField"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										</FormField>
									</template>

									<template v-if="stepIndex === 2">
										<FormField
											v-slot="{ componentField }"
											name="propertyId"
										>
											<FormItem>
												<FormLabel>
													プロパティIDの登録
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger>
																<Icon
																	name="mingcute:question-line"
																	class="size-4 text-black dark:text-white"
																/>
															</TooltipTrigger>
															<TooltipContent class="grid gap-2 p-4">
																<h2 class="text-base">
																	Google AnalyticsのプロパティIDとは？
																</h2>
																<p>
																	Google Analyticsの管理画面から取得できるプロパティIDです。
																</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</FormLabel>
												<FormControl>
													<Input
														type="text"
														v-bind="componentField"
														class="border-gray-300 bg-gray-50 placeholder:text-[#575757] dark:border-[#6c6c6c] dark:bg-[#171717] dark:text-white dark:placeholder:text-[#575757]"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										</FormField>
									</template>

									<template v-if="stepIndex === 3">
										<div class="grid gap-4">
											<Card class=" w-full">
												<CardHeader>
													<CardTitle class="text-lg">
														JsonKey
													</CardTitle>
												</CardHeader>
												<CardContent class="max-h-64 overflow-scroll">
													<pre class="whitespace-pre-line break-all text-sm">
														{{ values.jsonKey.trim() }}
													</pre>
												</CardContent>
											</Card>

											<Card>
												<CardHeader>
													<CardTitle class="text-lg">
														プロパティID
													</CardTitle>
												</CardHeader>
												<CardContent>
													<p class="w-full text-base">
														{{ values.propertyId }}
													</p>
												</CardContent>
											</Card>
										</div>
									</template>
								</div>

								<div class="mt-4 flex items-center justify-between">
									<Button
										:disabled="isPrevDisabled"
										variant="outline"
										size="sm"
										@click="prevStep()"
									>
										戻る
									</Button>
									<div class="flex items-center gap-3">
										<Button
											v-if="stepIndex !== 3"
											:type="meta.valid ? 'button' : 'submit'"
											:disabled="isNextDisabled"
											size="sm"
											@click="meta.valid && nextStep()"
										>
											次へ
										</Button>
										<Button
											v-if="stepIndex === 3"
											size="sm"
											type="submit"
											class="bg-gradient-to-r from-[#10B981] to-[#1C7C54] dark:from-white dark:to-white"
										>
											保存する
										</Button>
									</div>
								</div>
							</form>
						</Stepper>
					</Form>
				</TabsContent>
				<TabsContent value="password">
					Change your password here.
				</TabsContent>
			</Tabs>
		</div>
	</div>
</template>
