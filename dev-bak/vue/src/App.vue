<template>
  <div id="app">
    <div>
      <router-link to="/">Home </router-link><br />
      <router-link to="/todo">todo</router-link><br />
      <router-link to="/micro-app">Micro app</router-link><br />
      <router-link to="/remote-component">Remote component</router-link><br />
    </div>
    <div class="view-content">
      <router-view :basename="basename"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  props: ['basename']
}
</script>

<style lang="less">
body {
  background-color: #7ed6df;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.view-content {
  padding: 60px;
}
a {
  color: #4834d4;
}
h3 {
  margin-bottom: 30px;
}
</style>
