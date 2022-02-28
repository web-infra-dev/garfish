<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue'
import ImgLogo from './assets/logo.png';
</script>

<template>
  <div>
    <img alt="Vue logo" :src="ImgLogo" />
    <HelloWorld msg="Hello Vue 3 + Vite" />
  </div>
</template>

<style lang="less" scope="vite">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 20px;
  border-radius: 4px;
}
</style>
