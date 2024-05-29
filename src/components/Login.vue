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
  </main>
</template>

<script lang="ts" setup>
import {ref,Ref} from 'vue'
const apiURL = import.meta.env.VITE_API_URL
const username:Ref<string> = ref('')
const password:Ref<string> = ref('')  

const login = async():Promise<void>=>{
    const result = await fetch(`${apiURL}/api/login`,{
        method:'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username.value,
          password: password.value,
        }),
    })
    console.log(result)
}

</script>