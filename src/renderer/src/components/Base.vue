<template>
  <EnterName v-if="state === State.ENTER_NAME" />
</template>

<script setup>
import EnterName from './EnterName.vue'
import Loading from './Loading.vue'
import { ref, onMounted, computed } from 'vue'
import socketIo from './socket.io.js'

const State = { ENTER_NAME: 0, CONNECT_TO_AP: 1 }

const instructions = ref([
  'I looks like you are not connected to the mqtt broker.',
  'Are you connected to the internet?'
])

const state = ref(State.LOADING)

const id = ref(null)

onMounted(async () => {
  fetchId()
  console.log(socketIo)
})

const fetchId = async () => {
  id.value = await window.electronAPI.getId()
  if (id.value) {
    state.value = State.CONNECT_TO_AP
  }
}
</script>

<style></style>
