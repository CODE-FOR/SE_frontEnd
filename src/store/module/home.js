export default {
    state: {
        page: 1
    },
    mutations: {
        setHomePage(state, pindx) {
            state.page = pindx
        }
    }
}