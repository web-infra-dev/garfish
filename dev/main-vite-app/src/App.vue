<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue';
import Garfish from 'garfish';
// console.log(Garfish);
let GarfishInstance = new Garfish();
function mountApp() {
  GarfishInstance.loadApp({
    entry: 'http://localhost:2444',
    fetchOptions: {}
  }).then((appInstance)=>{
    appInstance.mount({
      domGetter: '#container'
    });
  })
}
mountApp();
</script>

<template>
  <div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Hello Vue 3 + Vite" />
    <div id="container"></div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
