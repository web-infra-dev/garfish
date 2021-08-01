<template>
    <div class="todo-list">
      <h3 data-test="title">Vue App todo list</h3>
      <div class="todo-add">
        <el-input v-model="item.text" placeholder="任务描述" data-test="new-todo"></el-input>
        <el-button class="add-btn" type="primary" plain @click="add" data-test="add-btn">
          添加
        </el-button>
      </div>
      <div>
        <ul class="todo-list">
           <li v-for="todo in todos" :key="todo.id">{{todo.text}}<el-button type="danger" icon="el-icon-delete" size="mini" circle @click="done(todo.id)" v-if="!todo.done"></el-button></li>
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

<style lang="less" scoped>
.todo-list {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  h3 {
    margin-bottom: 20px;
  }
  li {
    padding-top: 20px;
  }
}
.todo-add {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  width: 400px;
  margin-top: 10px;
  .add-btn {
    margin-left: 10px;
  }
}

</style>
