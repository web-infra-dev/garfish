<template>
  <div id="app">
    <div ref="vueApp" id="vueApp"></div>
  </div>
</template>

<script>

import GarfishInstance from '@garfish/core';
let isInit = false;
export default {
  name: 'App',
  props: ['basename'],
  mounted () {
    if (isInit) return;
    isInit = true;
    // Can only be run once
    GarfishInstance.run({
      basename: this.basename || '/',
      domGetter: ()=> this.$refs.vueApp,
      sandbox: {
        open: true,
        snapshot: true,
      },
      apps: [
        {
          name: 'vueApp',
          activeWhen: '/vueApp',
          cache: true,
          entry: 'http://localhost:8000',
        },
      ],
      plugins: [],
      async beforeLoad(appInfo) {
        console.log('开始加载了', appInfo);
        // return Promise.resolve();
      },
    });
  },
  components: {
  }
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
