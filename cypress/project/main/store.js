import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userInfo: {
      name: '',
      age: '',
      type: 1,
    },
  },
  mutations: {
    increment(state, info) {
      state.userInfo.name = info.name;
      state.userInfo.age = info.age;
      state.userInfo.type = info.type;
    },
  },
  getters: {
    userInfo: (state) => {
      return state.userInfo;
    },
  },
  actions: {
    increment(context, info) {
      context.commit('increment', info);
    },
  },
});

export default store;
