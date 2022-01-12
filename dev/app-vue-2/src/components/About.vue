<template>
    <div>
      This is About Page.
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            item: {
                text: '',
                done: false,
            },
        }
    },
    computed: mapState([
        // 映射 this.count 为 store.state.count
        'todos',
    ]),
    methods: {
        add() {
            this.$store.dispatch('add', this.item)
            this.item = { text: '', done: false }
        },
        done(id) {
            this.$store.dispatch('done', id)
        },
    },
}
</script>
