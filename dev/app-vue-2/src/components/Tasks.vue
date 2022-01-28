<template>
    <div>
        <h3>Tasks</h3>
        <div>
            <el-input size="small" v-model="item.text" style="width: 300px; marginRight: 10px" placeholder="task desc">
            </el-input>
            <el-button type="primary" size="mini" @click="add" >
                添加任务 ---- 来自调试的模块
            </el-button>
        </div>
        <div v-for="todo in todos" :key="todo.id" style="marginTop: 20px" >
            {{ todo.text }} {{ todo.done ? 'done' : 'undergoing'}}
            <el-button type="success" size="mini" v-if="!todo.done" @click="done(todo.id)">
                完成
            </el-button>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
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
