<template>
  <div id="alert-error">
    <button @click="alertError"> alert error </button>
  </div>
</template>

<script>
  export default {
    name: 'alertError',
    methods: {
      alertError() {
        // throw Error('subApp normal error');
        window.a.a.a = true;
      }
    },
  }
</script>
