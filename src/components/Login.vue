<template>
  <main>
    <h1>LOGIN</h1>
    <img src="./../assets/logo300.png" alt="LGYM logo"/>
    <form @submit.prevent="login">
        <div class="input-container">
        <label>Username</label>
        <input v-model="username"  type="text" placeholder="Username" />
      </div>
      <div class="input-container">
        <label>Password</label>
        <input v-model="password"  type="password" placeholder="Password" />
      </div>
      <button type="submit">LOGIN</button>
    </form>
    <section v-if="error">
        <span class="error">{{ error }}</span>
    </section>
  </main>
</template>

<script lang="ts" setup>
import {ref,Ref} from 'vue'
import { useRouter } from 'vue-router';
const apiURL = import.meta.env.VITE_API_URL
const username:Ref<string> = ref('')
const password:Ref<string> = ref('')
const error:Ref<string> = ref('')
const router = useRouter()

const login = async():Promise<void>=>{
    try {
    const response = await fetch(`${apiURL}/api/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username.value,
        password: password.value,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }    const result = await response.json();

    if ("token" in result) {
      localStorage.setItem('token', result.token);
      router.push('/');
    } else {
      error.value = result;
    }
  } catch (err:any) {
    error.value = err.message;
  }
}

</script>