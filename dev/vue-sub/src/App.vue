<template>
  <div id="grandson">
    <div>sub app content</div>
    <!-- <router-view /> -->
  </div>
</template>

<script>

export default {
  name: 'App',
  props: ['basename'],
  methods: {
    loadApp () {
      window.Garfish.router.push({ path: '/vueApp', basename: this.basename })
    }
  },
  components: {}
}
</script>

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
