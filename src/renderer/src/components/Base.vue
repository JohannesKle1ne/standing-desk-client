<template>
  <button @click="hideWindow">Hide</button>
  <button @click="quitApp">Quit</button>
  <button @click="logOut">Log out</button>

  <ReadNoInternet v-if="showNoInternet" />
  <Login @login="socketIo.connect()" @setRegisterFlag="registerFlag = true" v-if="showLogin" />
  <Register
    @registered="socketIo.connect()"
    @unsetRegisterFlag="registerFlag = false"
    v-if="showRegister"
  />
  <ReadInstructions v-if="showReadIntructions" />
  <EnterWifiCredentails v-if="showEnterWifiCredentails" />
  <ViewDesk
    @buttonClicked="sendCommand"
    @showStatistics="viewStatistics = true"
    :height="height"
    v-if="viewDesk"
  ></ViewDesk>
  <!--   <ViewDesk></ViewDesk> -->
</template>

<script setup>
import Login from './Login.vue'
import Register from './Register.vue'
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

const height = ref(null)

const registerFlag = ref(false)

const viewDesk = computed(() => {
  return deskConnected.value
})

const showNoInternet = computed(() => {
  return !apConnected.value && !serverConnected.value && !deskConnected.value
})

const showLogin = computed(() => {
  return (
    !socketConnected.value &&
    !apConnected.value &&
    serverConnected.value &&
    !socketIo.hasUserId() &&
    !registerFlag.value
  )
})

const showRegister = computed(() => {
  return (
    !socketConnected.value &&
    !apConnected.value &&
    serverConnected.value &&
    !socketIo.hasUserId() &&
    registerFlag.value
  )
})

const showReadIntructions = computed(() => {
  return socketConnected.value && !deskConnected.value && !apConnected.value
})

const showEnterWifiCredentails = computed(() => {
  return apConnected.value
})

const sendCommand = (command) => {
  socketIo.sendCommand(command)
}

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

    await lookForServer(now)
  }
  if (now - lastDeskUpdate.value > 20000) {
    socketIo.requestAlive()
  }
  if (now - lastDeskUpdate.value > 30000) {
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
  //hideWindow()
  await socketIo.connect()
  socketIo.onConnected(() => {
    socketConnected.value = true
    socketIo.requestAlive()
  })
  socketIo.onDisconnected(() => {
    socketConnected.value = false
  })
  socketIo.onAliveMessage(() => {
    console.log('pi alive')
    lastDeskUpdate.value = new Date().getTime()
    deskConnected.value = true
  })
  socketIo.onHeightMessage((newHeight) => {
    console.log(newHeight)
    height.value = JSON.parse(newHeight).height
  })

  checkStatus()
  setInterval(checkStatus, 3000)
})

const logOut = async () => {
  await window.electronAPI.logOut()
}

const hideWindow = async () => {
  await window.electronAPI.hideWindow()
}

const quitApp = async () => {
  await window.electronAPI.quitApp()
}
</script>

<style></style>
