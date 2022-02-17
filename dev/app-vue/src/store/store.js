export default {
  state: {
    id: 1,
    todos: [{ id: 1, text: 'write a vue mudole demo', done: false }],
  },

  mutations: {
    done(state, id) {
      // state.todos.forEach((item) => item.id === id && (item.done = true));
      this.state.todo = this.state.todo.filter((item) => item.id !== id);
    },
    add(state, item) {
      state.id += 1;
      item.id = state.id;
      state.todos.push(item);
    },
  },

  actions: {
    done(context, id) {
      context.commit('done', id);
    },
    add(context, item) {
      context.commit('add', item);
    },
  },

  getters: {
    doneTodos: (state) => state.todos.filter((todo) => todo.done),
  },
};
