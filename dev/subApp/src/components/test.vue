<template>
    <div>
      <span >test</span>
      <div>
        <input v-model="item.text" placeholder="task desc"/><button @click="add" >添加任务----来自调试的模块</button>
      </div>
      <div>
        <ul>
           <li v-for="todo in todos" :key="todo.id">
              {{ todo.text }}
              {{ todo.done ? 'done' : 'undergoing' }}
              <button v-if="!todo.done" @click="done(todo.id)">完成</button>
            </li>
        </ul>
      </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return  {
      item: {
        text: '',
        done: false
      }
    }
  },
  computed: mapState([
    // 映射 this.count 为 store.state.count
    'todos'
  ]),
  methods: {
    add() {
      this.$store.dispatch('add', this.item)
      this.item = { text: '', done: false }
    },
    done(id) {
      this.$store.dispatch('done', id)
    }
  }
}
</script>

<style>
li {
  list-style-type: none;
}

</style>
