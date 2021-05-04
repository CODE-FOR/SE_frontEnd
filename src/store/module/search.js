export default {
    state: {
        page: 1
    },
    mutations: {
        setSearchPage(state, pindx) {
            state.page = pindx
        }
    }
}