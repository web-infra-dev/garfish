<template>
  <div id="app">
      <el-button plain @click="loadApp">
        加载子应用
      </el-button>
    <div ref="vueApp" id="vueApp"></div>
  </div>
</template>

<script>
import GarfishInstance from '@garfish/framework';

let hasInit = false;
export default {
  name: 'App',
  props: ['basename'],
  methods: {
    async loadApp () {
      console.log(GarfishInstance);
      // let app = await GarfishInstance.loadApp('vueApp',{
      //   entry: 'http://localhost:8000',
      //   basename: this.basename,
      //   domGetter: ()=> this.$refs.vueApp
      // });
      // await app.mount();
      // console.log(app);
      Garfish.router.push({ path: '/vueApp', basename: this.basename })
      // console.log(this.basename, GarfishInstance);
    }
  },
  mounted () {
    if (hasInit) return;
    hasInit = true;

    GarfishInstance.registerApp([
      {
        name: 'vueApp',
        entry: 'http://localhost:8000',
        basename: '/garfish_master/vue',
        activeWhen: '/vueApp',
        domGetter: ()=> document.querySelector('#vueApp')
      }
    ]);

    if (!GarfishInstance.running) {
      GarfishInstance.run();
    }

    // Can only be run once
    // GarfishInstance.run({
    //   basename: this.basename || '/',
    //   domGetter: ()=> this.$refs.vueApp,
    //   sandbox: {
    //     open: true,
    //     snapshot: true,
    //   },
    //   apps: [
    //     {
    //       name: 'vueApp',
    //       activeWhen: '/vueApp',
    //       cache: true,
    //       entry: 'http://localhost:8000',
    //     },
    //   ],
    //   plugins: [],
    //   async beforeLoad(appInfo) {
    //     console.log('开始加载了', appInfo);
    //     // return Promise.resolve();
    //   },
    // });
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
