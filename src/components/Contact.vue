<template>
  <main>
    <img src="./../assets/logo300.png" alt="LGYM logo"/>
    <section>
      <h2>Delete account</h2>
      <p>
        To delete your account, please enter your email address and submit the form.

        All data associated with your account will be deleted, including training sessions, plans, measurements, and any other data entered by you. This operation is irreversible.</p>
    </section>
    <form @submit.prevent="deleteAcc">
      <div class="input-container">
        <label>Email</label>
        <input v-model="mail"  type="email" placeholder="Email" />
      </div>
      <button type="submit">DELETE ACCOUNT</button>
    </form>
    <section v-if="error">
      <span class="error">{{ error }}</span>
    </section>
  </main>
</template>

<script setup lang="ts">
const apiURL = import.meta.env.VITE_API_URL


import {ref, Ref} from "vue";
import router from "../router";

const mail:Ref<string> = ref('')
const error:Ref<string> = ref('')

const deleteAcc = async()=>{
  const token = localStorage.getItem('token')
  if(!token) return 
  const response = await fetch(`${apiURL}/api/deleteAccount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token} `,
        },
        body:JSON.stringify({
          email:mail.value
        })
      }).then((res) => res.json());
  if(response.msg ==='Wrong email!') error.value = 'Wrong email!'
  else if(response.msg === 'Deleted!'){
    alert(response.msg)
    localStorage.clear()
    router.push('/login')
  }
}

</script>
