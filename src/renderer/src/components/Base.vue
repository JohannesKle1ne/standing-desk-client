<template>
  <EnterName @created="socketIo.connect()" v-if="showEnterName" />
  <div>{{ deskConnected }}</div>
  <div>{{ socketConnected }}</div>
  <div>{{ apConnected }}</div>
</template>

<script setup>
import EnterName from './EnterName.vue'
import Loading from './Loading.vue'
import socketIo from './Socket.io'
import { piTest } from './api.js'
import { ref, onMounted, computed } from 'vue'

const deskConnected = ref(false)
const socketConnected = ref(false)
const apConnected = ref(false)

const lastDeskUpdate = ref(0)
const lastApUpdate = ref(0)

const showEnterName = computed(() => {
  return !socketConnected.value && !apConnected.value
})

const lookForPi = async () => {
  const piSuccess = await piTest()
  if (piSuccess) {
    lastApUpdate.value = new Date().getTime()
    apConnected.value = true
  }
}

const checkStatus = async () => {
  const now = new Date().getTime()
  if (now - lastDeskUpdate.value > 6000) {
    deskConnected.value = false
  }
  if (now - lastApUpdate.value > 6000) {
    apConnected.value = false
  }
  if (!deskConnected.value) {
    //lookForPi()
  }
}

onMounted(async () => {
  await socketIo.connect()
  socketIo.onConnected(() => {
    socketConnected.value = true
  })
  socketIo.onDisconnected(() => {
    socketConnected.value = false
  })
  socketIo.onStateMessage((state) => {
    console.log(state)
    lastDeskUpdate.value = new Date().getTime()
    deskConnected.value = true
  })
  setInterval(checkStatus, 3000)
})
</script>

<style></style>
