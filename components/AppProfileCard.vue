<script setup lang="ts">
const client = useSupabaseClient();
const router = useRouter();
const store = useStore();

const props = defineProps<{
	name: string;
	email: string;
	picture: string;
}>();

// const signOutWithGoogle = async () => {
//   await client.auth.signOut();
//   store.userData = {
//     name: "",
//     email: "",
//     picture: "",
//   };
//   router.push("/login");
// };
</script>

<template>
	<div
		class="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-10 shadow dark:border-gray-700 dark:bg-gray-800"
	>
		<div class="flex flex-col items-center">
			<img
				class="mb-3 size-24 rounded-full shadow-lg"
				:src="props.picture"
				alt="Bonnie image"
			>
			<h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">
				{{ props.name }}
			</h5>
			<span class="text-sm text-gray-500 dark:text-gray-400">
				{{ props.email }}
			</span>
			<div class="mt-4 flex md:mt-6">
				<button
					class="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				>
					Setting
				</button>
				<!-- <button
          @click="signOutWithGoogle"
          class="ms-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
        >
          Logout
        </button> -->
			</div>
		</div>
	</div>
</template>
