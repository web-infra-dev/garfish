<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <ul>
      <li><a><router-link to="/index">Index</router-link></a></li>
      |
      <li><a><router-link to="/about">About</router-link></a></li>
    </ul>
    <router-view />
  </div>
</template>

<script>
export default {
  data () {
    return {
      garfishProps: (window.Garfish && window.Garfish.props) || {}
    }
  },
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
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
</style>
