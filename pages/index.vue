<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { Check, Circle, Dot } from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast/use-toast';

definePageMeta({
	title: 'HOME',
});

useHead({
	title: 'HOME',
});

/************************************************
 * Determine if the user is logged in
 *************************************************/
definePageMeta({
	middleware: 'auth',
});

/************************************************
 * Crawl submit function
 *************************************************/
const VITE_CRAWL_API = import.meta.env.VITE_CRAWL_API;
const dimensionValues = ref<string[]>([]);
const analytics = ref<any>([]);
const getAnalytics = async () => {
	try {
		const response = await fetch(`${VITE_CRAWL_API}/analytics`, {
			method: 'GET',
			credentials: 'include',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		analytics.value = data[0];

		console.log(data[0].rows);

		data[0].rows.forEach((row: any) => {
			dimensionValues.value.push(row.metricValues[0]);
		});
	}
	catch (error) {
		console.error('Crawling failed:', error);
	}
};

const { toast } = useToast();
const formSchema = [
	z.object({
		fullName: z.string(),
		email: z.string().email(),
	}),
	z.object({
		password: z.string().min(2).max(50),
		confirmPassword: z.string(),
	}).refine(
		(values) => {
			return values.password === values.confirmPassword;
		},
		{
			message: 'Passwords must match!',
			path: ['confirmPassword'],
		},
	),
	z.object({
		favoriteDrink: z.union([z.literal('coffee'), z.literal('tea'), z.literal('soda')]),
	}),
];

const stepIndex = ref(1);
const steps = [
	{
		step: 1,
		title: 'Your details',
		description: 'Provide your name and email',
	},
	{
		step: 2,
		title: 'Your password',
		description: 'Choose a password',
	},
	{
		step: 3,
		title: 'Your Favorite Drink',
		description: 'Choose a drink',
	},
];

function onSubmit(values: any) {
	toast({
		title: 'You submitted the following values:',
		description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
	});
}
</script>

<template>
	<div class="container relative z-10 h-full max-w-none gap-5 p-0">
		<!-- header -->
		<PageHeader
			title="HOME"
			href="https://zenn.dev/tatausuru/"
			target="_blank"
			label="Zenn"
		/>

		<!-- main -->
		<div class="mt-4 min-h-[calc(100vh-12.5rem)] w-full rounded-md border border-gray-200 bg-white p-6 dark:border-[#4c4c4c] dark:bg-[#1f1f1f]">
			<!-- <Button
				@click="getAnalytics"
			>
				アナリティクス取得
			</Button>

			<div class="mt-6">
				{{ dimensionValues }}
				<pre>{{ analytics }}</pre>
			</div> -->

			<!-- <Form
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
								onSubmit(values)
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
									name="fullName"
								>
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input
												type="text"
												v-bind="componentField"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>

								<FormField
									v-slot="{ componentField }"
									name="email"
								>
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email "
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
									name="password"
								>
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												v-bind="componentField"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>

								<FormField
									v-slot="{ componentField }"
									name="confirmPassword"
								>
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												v-bind="componentField"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>
							</template>

							<template v-if="stepIndex === 3">
								<FormField
									v-slot="{ componentField }"
									name="favoriteDrink"
								>
									<FormItem>
										<FormLabel>Drink</FormLabel>

										<Select v-bind="componentField">
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a drink" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="coffee">
														Coffe
													</SelectItem>
													<SelectItem value="tea">
														Tea
													</SelectItem>
													<SelectItem value="soda">
														Soda
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								</FormField>
							</template>
						</div>

						<div class="mt-4 flex items-center justify-between">
							<Button
								:disabled="isPrevDisabled"
								variant="outline"
								size="sm"
								@click="prevStep()"
							>
								Back
							</Button>
							<div class="flex items-center gap-3">
								<Button
									v-if="stepIndex !== 3"
									:type="meta.valid ? 'button' : 'submit'"
									:disabled="isNextDisabled"
									size="sm"
									@click="meta.valid && nextStep()"
								>
									Next
								</Button>
								<Button
									v-if="stepIndex === 3"
									size="sm"
									type="submit"
								>
									Submit
								</Button>
							</div>
						</div>
					</form>
				</Stepper>
			</Form> -->
		</div>
	</div>
</template>
