<template>
  <ReadNoInternet v-if="showNoInternet" />
  <EnterName @created="socketIo.connect()" v-if="showEnterName" />
  <ReadInstructions v-if="showReadIntructions" />
  <EnterWifiCredentails v-if="showEnterWifiCredentails" />
  <ViewDesk v-if="viewDesk"></ViewDesk>
</template>

<script setup>
import EnterName from './EnterName.vue'
import ReadInstructions from './ReadInstructions.vue'
import ReadNoInternet from './ReadNoInternet.vue'
import EnterWifiCredentails from './EnterWifiCredentails.vue'
import ViewDesk from './ViewDesk.vue'
import socketIo from './Socket.io'
import { piTest, checkServer } from './api.js'
import { ref, onMounted, computed } from 'vue'

const socketConnected = ref(false)

const deskConnected = ref(false)
const apConnected = ref(false)
const serverConnected = ref(false)

const dateNow = new Date().getTime()

const lastDeskUpdate = ref(dateNow)
const lastApUpdate = ref(dateNow)
const lastServerUpdate = ref(dateNow)

const viewDesk = computed(() => {
  return deskConnected.value
})

const showNoInternet = computed(() => {
  return !apConnected.value && !serverConnected.value && !deskConnected.value
})

const showEnterName = computed(() => {
  return (
    !socketConnected.value && !apConnected.value && serverConnected.value && !socketIo.hasUserId()
  )
})

const showReadIntructions = computed(() => {
  return socketConnected.value && !deskConnected.value && !apConnected.value
})

const showEnterWifiCredentails = computed(() => {
  return apConnected.value
})

const lookForPi = async (now) => {
  const piSuccess = await piTest()
  if (piSuccess) {
    lastApUpdate.value = now
    apConnected.value = true
  }
}

const lookForServer = async (now) => {
  const internetSuccess = await checkServer()
  if (internetSuccess) {
    lastServerUpdate.value = now
    serverConnected.value = true
  }
}

const checkStatus = async () => {
  const now = new Date().getTime()
  if (!deskConnected.value) {
    lookForPi(now)
    lookForServer(now)
  }
  if (now - lastDeskUpdate.value > 6000) {
    deskConnected.value = false
  }
  if (now - lastApUpdate.value > 6000) {
    apConnected.value = false
  }
  if (now - lastServerUpdate.value > 6000) {
    serverConnected.value = false
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
