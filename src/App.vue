<template>
  <section>
    <div  class="imgHolder"></div>
    <main>
      <h1>Contact Page</h1>
      <img src="./assets/logo300.png" alt="LGYM logo"/>
      <section>
        <h2>Delete account</h2>
        <p>
          To delete your account, please enter your email address and submit the form.

          All data associated with your account will be deleted, including training sessions, plans, measurements, and any other data entered by you. This operation is irreversible.</p>
      </section>
      <form>
        <div class="input-container">
          <label>Email</label>/
          <input v-model="mail"  type="email" placeholder="Email" />
        </div>
        <button type="submit">DELETE ACCOUNT</button>/
      </form>
    </main>
    <div class="imgHolder"></div>
    <footer>Jakub Leśkiewicz</footer>
  </section>

</template>


<script setup lang="ts">

import {Ref,ref} from "vue";

const mail:Ref<string> = ref('')

</script>

<style lang="scss">
section{
  width: 100%;
  height: 100%;
  display: flex;

  .imgHolder{
    width: calc(100% - 1200px);
    height: 100%;
    background: url("./assets/logoLGYMShadow.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
  main{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 2rem;
    align-items: center;
    width: 600px;
    padding: 1rem;
    height: calc(100vh - 400px);
    border-radius: 5px;
    h1{
      color:#4CD964;
      font-size: 48px;

    }
    section{
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
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
      label{
        color:grey;
        margin-bottom: 5px;
      }
      input{
        width: 100%;
        height: 67px;
        border-radius: 1rem;
        background-color: #1E1E1E;
        border: none;
        padding: 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;

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
  footer{
    height: 50px;
    position: fixed;
    bottom: 0;
    background-color: #4CD964;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: end;
  padding: 1rem

  }
}


</style>


