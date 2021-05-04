import Vue from 'vue'
import Vuex from 'vuex'

import user from './module/user'
import app from './module/app'
import home from './module/home'
import paperInfo from './module/paper-info'
import search from './module/search'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    paperIdWhileWritingInterpretation: 0
  },
  mutations: {
    getPaperId(state, paperId) {
      state.paperIdWhileWritingInterpretation = paperId;
    }
  },
  actions: {
    //
  },
  modules: {
    user,
    app,
    home,
    paperInfo,
    search
  }
})
