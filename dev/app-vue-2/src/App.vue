<template>
  <div id="app">
    <div>
      <router-link to="/home">home </router-link><br />
      <router-link to="/toDoList">toDoList</router-link><br />
      <router-link to="/tasks">tasks</router-link><br />
      <router-link to="/micro-app" v-if="GARFISH">Micro app</router-link><br />
      <router-link to="/remote-component">Remote component</router-link><br />
    </div>
    <div class="view-content">
      <router-view :basename="basename" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'App',
    props: ['basename'],
    data() {
      return {
        GARFISH: window.__GARFISH__
      }
    },
  }
</script>

<style lang="less" scope="app-vue2">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      display: inline-block;
      margin: 0 10px;
    }
    a {
      color: #42b983;
      cursor: pointer;
    }
    a.router-link-active {
      color: #ff4500
    }
  }
</style>
