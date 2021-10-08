<template>
  <div id="app">
    <div class="vue-app">
      <ul>
        <li><a><router-link to="/">Home</router-link></a></li>
        |
        <li><a><router-link to="/about">About</router-link></a></li>
      </ul>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.vue-app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
a {
  color: #4834d4;
}
</style>
