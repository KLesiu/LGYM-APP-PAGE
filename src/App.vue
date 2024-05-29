<template>
  <RouterView />
  <footer>Jakub Leśkiewicz</footer>
</template>


<script setup lang="ts">
</script>

<style lang="scss">
#app {
  background: url('./assets/logoLGYMShadow.png');
  background-size: contain;
  background-position-x: 1290px;
}
footer{
  height: 50px;
  bottom: 0;
  background-color: #4CD964;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: end;
  padding: 1rem
}

</style>


