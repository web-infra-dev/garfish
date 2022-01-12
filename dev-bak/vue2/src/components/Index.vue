<template>
  <div class="hello">
    <h3 data-test="title">Thank you for the vue2 applications use garfish</h3>
    <img alt="Vue logo" src="../assets/logo.png">
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<style>
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
}
</style>
