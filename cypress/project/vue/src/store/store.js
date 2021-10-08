export default {
  state: {
    id: 1,
    todos: [{ id: 1, text: 'default todo', done: false }],
  },

  mutations: {
    done(state, id) {
      this.state.todos = this.state.todos.filter((item) => item.id !== id);
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
    doneTodos: (state) => {
      if (state.todos && state.todos.length > 0) {
        return state.todos.filter((todo) => todo.done);
      }
    },
  },
};
