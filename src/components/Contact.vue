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


<style lang="scss" scoped>
main{
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
  gap: 2rem;
  align-items: center;
  width: 100%;
  max-width: 600px;
  border-radius: 5px;
  height: 100%;
  @media screen and (min-width: 768px) {
    height: calc(100vh - 50px);
  }
  h1{
    color:#4CD964;
    font-size: 48px;

  }
  img {
    width: 230px;
  }
  section{
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    h2{
      color:white;
      font-size: 24px;
      text-align: center;
    }
    p{
      color: rgba(255, 255, 255, 0.83);
      text-align: center;
      font-family: 'Open Sans', sans-serif;

    }
  }
  form{
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    .input-container{
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      label{
        color:grey;
      }
      input{
        width: 100%;
        height: 67px;
        border-radius: 1rem;
        background-color: #1E1E1E;
        border: none;
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: center;
        align-items: center;

      }
    }

    button{
      width: 100%;
      background-color: #4CD964;
      height: 67px;
      border-radius: 1rem;
      font-weight: bold;
      cursor: pointer;
    }
  }
}



</style>