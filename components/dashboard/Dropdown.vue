<script setup lang="ts">
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// emit event to parent for updating content
const emit = defineEmits(['updateContent']);
const updateContent = (content: string) => {
	emit('updateContent', content);
};

// select items
const selectItems = ref([
	{ id: 1, name: 'News' },
	{ id: 2, name: 'API Usage' },
	{ id: 3, name: 'Profile' },
]);
</script>

<template>
	<!-- Dropdown menu -->
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button
				variant="outline"
				class="h-fit p-2 dark:border-[#2e2e2e] dark:bg-[#1e1e1e] dark:hover:bg-[#2e2e2e]"
			>
				<Icon
					name="mingcute:down-fill"
					class="size-4"
				/>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent class="w-56 dark:border-[#2e2e2e] dark:bg-[#171717]">
			<DropdownMenuLabel>コンテンツ</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuCheckboxItem
				v-for="items in selectItems"
				:key="items.id"
				@click="updateContent(`${items.name}`)"
			>
				{{ items.name }}
			</DropdownMenuCheckboxItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
