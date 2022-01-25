<template>
  <div class="todo-list">
    <h3 data-test="title">Vue App todo list</h3>
    <div class="todo-add">
      <input v-model="item.text" placeholder="任务描述" data-test="new-todo" />
      <button
        class="add-btn"
        type="primary"
        plain
        @click="add"
        data-test="add-btn"
      >
        添加
      </button>
    </div>
    <div>
      <ul class="todo-list">
        <li v-for="todo in data.state.todos" :key="todo.id">
          {{ todo.text }}
          <button
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
import { useState } from '../store';

export default {
  data() {
    return {
      item: {
        text: '',
        done: false,
      },
    };
  },

  setup() {
    return {
      data: useState(),
    };
  },
  methods: {
    add() {
      this.data.add(this.item);
    },
    done(id) {
      this.data.done(id);
    },
  },
};
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
