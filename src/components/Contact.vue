<template>
  <main>
    <h1>Contact Page</h1>
    <img src="./../assets/logo300.png" alt="LGYM logo"/>
    <section>
      <h2>Delete account</h2>
      <p>
        To delete your account, please enter your email address and submit the form.

        All data associated with your account will be deleted, including training sessions, plans, measurements, and any other data entered by you. This operation is irreversible.</p>
    </section>
    <form>
      <div class="input-container">
        <label>Email</label>
        <input v-model="mail"  type="email" placeholder="Email" />
      </div>
      <button type="submit">DELETE ACCOUNT</button>
    </form>
  </main>
</template>

<script setup lang="ts">


import {ref, Ref} from "vue";

const mail:Ref<string> = ref('')

</script>
