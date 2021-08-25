<template>
  <div id="remote-component">
    <h3 data-test="title">Vue App remote component</h3>
    <cm-one :text="text"/>
    <cm-two :text="text"/>
    <el-button data-test="change-data" plain @click="changeData">
      切换数据
    </el-button>
  </div>
</template>

<script>
import {
  loadModule,
  setModuleConfig,
} from '@garfish/remote-module';

setModuleConfig({
  alias: {
    Component: 'http://localhost:2666/remoteModule.js',
  },
})

export default {
  name: 'remoteComponent',
  props: ['basename'],
  data: () => ({
    text: 'old text',
  }),
  methods: {
    changeData() {
      this.text = this.text === 'old text' ? 'new text' : 'old text'
    }
  },
  components: {
    cmOne: () => loadModule('@Component.cmOne'),
    cmTwo: () => loadModule('@Component.cmTwo'),
  }
}
</script>
