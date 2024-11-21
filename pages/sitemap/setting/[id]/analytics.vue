<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { Check, Circle, Dot } from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast/use-toast';

definePageMeta({
	title: 'sitemap-setting-analytics',
	middleware: 'auth',
});

useHead({
	title: 'Sitemap Setting - Analytics',
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const { toast } = useToast();
const { params } = useRoute();
const router = useRouter();
const isLoading = ref<boolean>(false);
const VITE_CRAWL_API = import.meta.env.VITE_CRAWL_API;

/****************************************************
 * resister JsonKey and PropertyId
 ***************************************************/
const resisterJsonKeyAndPropertyId = async (jsonKey: string, propertyId: string) => {
	isLoading.value = true;

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

		await linkToSitemap();

		isLoading.value = false;

		toast({
			title: 'JsonKeyとプロパティIDの登録',
			description: 'JsonKeyとプロパティIDの登録が完了しました。',
			variant: 'success',
		});

		router.push(`/sitemap/setting/${params.id}`);
	}
	catch (error) {
		isLoading.value = false;

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
const linkToSitemap = async () => {
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
	}
	catch (error) {
		console.error('Crawling failed:', error);
	}
};

/****************************************************
 * step progress
 ***************************************************/
const formSchema = [
	z.object({
		jsonKey: z.string({
			required_error: 'JsonKeyを入力してください',
		}),
	}),
	z.object({
		propertyId: z.string({
			required_error: 'プロパティIDを入力してください',
		}).min(9, '9文字以上のプロパティIDを入力してください').max(9, '9文字以下のプロパティIDを入力してください'),
	}),
	z.object({}),
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
			title="Sitemap Setting - Analytics"
			:href="`/sitemap/setting/${params.id}`"
			label="サイトマップ設定に戻る"
		/>

		<!-- main -->
		<div
			default-value="analytics"
			class="mt-4 grid min-h-[calc(100vh-12.5rem)] w-full gap-8 rounded-md border border-gray-200 bg-white p-14 dark:border-[#4c4c4c] dark:bg-[#1f1f1f]"
		>
			<Form
				v-slot="{ meta, values, validate }"
				keep-values
				:validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
				class="m-auto size-full max-w-screen-lg"
			>
				<Stepper
					v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
					v-model="stepIndex"
				>
					<form
						class="size-full"
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

						<div class="mt-4 flex flex-col justify-start gap-4">
							<template v-if="stepIndex === 1">
								<FormField
									v-slot="{ componentField }"
									name="jsonKey"
									class="size-full"
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
												class="h-[calc(100vh-35rem)] border-gray-300 bg-gray-50 placeholder:text-[#575757] dark:border-[#6c6c6c] dark:bg-[#171717] dark:text-white dark:placeholder:text-[#575757]"
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
									class="size-full"
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
								<div class="grid size-full gap-4">
									<Card
										v-if="values?.jsonKey"
										class="w-full"
									>
										<CardHeader>
											<CardTitle class="text-lg">
												JsonKey
											</CardTitle>
										</CardHeader>
										<CardContent class="max-h-64 overflow-scroll">
											<pre class="whitespace-pre-line break-all text-sm">
                            {{ values?.jsonKey.trim() }}
													</pre>
										</CardContent>
									</Card>
									<Card
										v-if="values?.propertyId"
									>
										<CardHeader>
											<CardTitle class="text-lg">
												プロパティID
											</CardTitle>
										</CardHeader>
										<CardContent>
											<p class="w-full text-base">
												{{ values?.propertyId }}
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
									:disabled="!values.jsonKey || !values.propertyId"
									size="sm"
									type="submit"
									class="bg-gradient-to-r from-[#10B981] to-[#1C7C54] dark:from-white dark:to-white"
								>
									{{ isLoading ? 'リクエスト中...' : '保存し連携する' }}
								</Button>
							</div>
						</div>
					</form>
				</Stepper>
			</Form>
		</div>
	</div>
</template>
