<template>
    <div id="micro-app">
        <h3 data-test="title">Vue App micro App</h3>
        <el-button plain size="mini" @click="loadApp">
            加载 Vue 子应用
        </el-button>
        <el-button plain size="mini" @click="loadAppReact">
            加载 React 子应用
        </el-button>
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
        async loadApp() {
            window.Garfish.router.push({ path: '/examples/vue2/micro-app/vueApp', basename: '/' })
        },
        async loadAppReact() {
            window.Garfish.router.push({ path: '/examples/vue2/micro-app/reactApp', basename: '/' })
        }
    },

    mounted() {
        if (hasInit) return;
        hasInit = true;

        GarfishInstance.registerApp([{
                name: 'vueApp',
                entry: process.env.NODE_ENV === 'production' ?  `http:${portInfo['dev/vue-sub'].publicPath}` : `http://localhost:${portInfo['dev/vue-sub'].port}`,
                basename: '/examples/vue2/micro-app',
                activeWhen: '/vueApp',
                domGetter: '#micro-app-container',
                cache: false,
                props: {
                    helloWorld: false
                }
            },
            {
                name: 'reactApp',
                entry: process.env.NODE_ENV === 'production' ? `http:${portInfo['dev/react16'].publicPath}` : `http://localhost:${portInfo['dev/react16'].port}`,
                basename: '/examples/vue2/micro-app',
                domGetter: '#micro-app-container',
                activeWhen: '/reactApp',
                cache: false
            }
        ]);
    }
}
</script>

<style lang="less">
#micro-app-container {
    width: 800px;
    height: 400px;
    margin: 40px auto;
}
</style>
