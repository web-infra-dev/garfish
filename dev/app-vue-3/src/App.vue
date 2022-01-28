<template>
    <div id="app">
        <div>
            <ul>
                <li>
                    <router-link to="/home">Home </router-link><br />
                </li>
                <li>
                    <router-link to="/toDoList">toDoList</router-link>
                </li>
            </ul>
        </div>
        <div class="view-content">
            <div>counter: {{ data.state.counter }}</div>
            <button type="button" @click="data.increment()"> increment </button>
            <router-view :basename="basename" />
        </div>
    </div>
</template>

<script>
import { useState } from './store';

export default {
    name: 'App',
    props: ['basename'],
    setup() {
        return {
            data: useState()
        }
    }
}
</script>

<style lang="less" scope="app-vue3">
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
