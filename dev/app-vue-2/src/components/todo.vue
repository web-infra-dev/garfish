<template>
    <div class="todo-list">
      <h3 data-test="title">Vue App todo list</h3>
      <div class="todo-add">
        <el-input size="mini" v-model="item.text" placeholder="任务描述" data-test="new-todo"></el-input>
        <el-button size="mini" class="add-btn" type="primary" plain @click="add" data-test="add-btn">
          添加
        </el-button>
      </div>
      <div>
        <ul class="todo-list">
           <li v-for="todo in todos" :key="todo.id">
            {{ todo.text }}
            <el-button
              circle
              size="mini"
              type="danger"
              class="delete-btn"
              icon="el-icon-delete"
              v-if="!todo.done"
              @click="done(todo.id)"
            />
          </li>
        </ul>
      </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'TodoListComponent',
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
    width: 100%;
    padding-top: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .delete-btn {
      margin-left: 8px;
    }
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
