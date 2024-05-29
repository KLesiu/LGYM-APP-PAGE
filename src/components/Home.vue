<template>
  <main>
    <h1>HOME</h1>
    <img src="./../assets/logo300.png" alt="LGYM logo"/>
    <button @click="goToContact" class="btn">DELETE ACC</button>
  </main>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter()

const goToContact=()=>{
router.push('/contact')
}
</script>