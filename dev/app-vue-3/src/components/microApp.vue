<template>
  <div id="micro-app">
    <h3 data-test="title">Vue App micro App</h3>
    <button plain @click="loadApp">
      加载子应用
    </button>
    <button plain @click="loadAppReact">
      加载 React 子应用
    </button>
    <div ref="vueApp" id="micro-app-container"></div>
  </div>
</template>

<script>
// 嵌套场景
import GarfishInstance from 'garfish';
import portInfo from '../../../config.json';

let hasInit = false;
export default {
  name: 'App',
  props: ['basename'],

  methods: {
    async loadApp () {
      // let app = await GarfishInstance.loadApp('vueApp',{
      //   entry: 'http://localhost:2555',
      //   basename: this.basename,
      //   domGetter: ()=> this.$refs.vueApp,
      //   props: {
      //     fuckYou: 111,
      //   },
      // });
      // await app.mount();
      // console.log(app);
      window.Garfish.router.push({ path: '/garfish_master/vue/micro-app/vueApp', basename: '/' })
      // console.log(this.basename, GarfishInstance);
    },
    async loadAppReact () {
      // let app = await GarfishInstance.loadApp('reactApp',{
      //   entry: 'http://localhost:2444',
      //   basename: '/garfish_master/vue/micro-app',
      //   domGetter: ()=> this.$refs.vueApp,
      // });
      // await app.mount();
      // console.log(app);
      window.Garfish.router.push({ path: '/garfish_master/vue/micro-app/reactApp', basename: '/' })
      // console.log(this.basename, GarfishInstance);
    }
  },

  mounted () {
    if (hasInit) return;
    hasInit = true;

    GarfishInstance.registerApp([
      {
        name: 'vueApp',
        entry: `http://localhost:${portInfo['dev/vue-sub'].port}`,
        basename: '/garfish_master/vue/micro-app',
        activeWhen: '/vueApp',
        domGetter: '#micro-app-container',
        cache: false,
        props: {
          helloWorld: false
        }
      },
      {
        name: 'reactApp',
        entry: `http://localhost:${portInfo['dev/react'].port}`,
        basename: '/garfish_master/vue/micro-app',
        domGetter: '#micro-app-container',
        activeWhen: '/reactApp',
        cache: false
      }
    ]);
  }
}
</script>
