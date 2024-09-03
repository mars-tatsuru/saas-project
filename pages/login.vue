<script setup lang="ts">
//use supabase client
const client = useSupabaseClient();
const user = useSupabaseUser();

// use router
const router = useRouter();

watchEffect(() => {
  if (user.value) {
    router.push("/");
  }
});

const login = async (providerName: "google" | "github") => {
  try {
    const res = await client.auth.signInWithOAuth({
      provider: providerName,
    });
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="login">
    <button @click="login('google')" type="button">Google login</button>
  </div>
</template>
