export default {
  state: {
    id: 1,
    todos: [{ id: 1, text: 'default todo', done: false }],
    basename: '',
    mainAppProps: {},
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
    setProps(state, item) {
      state.mainAppProps = item;
    },
    setBasename(state, basename) {
      state.basename = basename;
    },
  },

  actions: {
    done(context, id) {
      context.commit('done', id);
    },
    add(context, item) {
      context.commit('add', item);
    },
    setProps(context, item) {
      context.commit('setProps', item);
    },
    setBasename(context, basename) {
      context.commit('setBasename', basename);
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
