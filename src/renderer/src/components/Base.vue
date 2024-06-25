<template>
  <div
    @click="hideWindow"
    class="w-7 h-7 absolute right-1 top-1 text-white cursor-pointer"
    v-html="svgs.close"
  ></div>

  <!--   <ReadNoInternet v-if="showNoInternet" />
  <Login @login="socketIo.connect()" @setRegisterFlag="registerFlag = true" v-if="showLogin" />
  <Register
    @registered="socketIo.connect()"
    @unsetRegisterFlag="registerFlag = false"
    v-if="showRegister"
  />
  <ReadInstructions v-if="showReadIntructions" />
  <EnterWifiCredentails v-if="showEnterWifiCredentails" /> -->
  <ViewDesk
    @buttonClicked="sendCommand"
    @showStatistics="viewStatistics = true"
    :height="height"
  ></ViewDesk>
  <div
    @click="quitApp"
    class="w-7 h-7 absolute right-0 bottom-1 text-white cursor-pointer"
    v-html="svgs.quit"
    @mouseover="setQuitToolTip"
    @mouseleave="hideQuitToolTip"
  ></div>
  <div
    @click="logOut"
    class="w-7 h-7 absolute right-8 bottom-1 text-white cursor-pointer"
    v-html="svgs.logOut"
    @mouseover="setLogOutToolTip"
    @mouseleave="hideQuitToolTip"
  ></div>
  <div
    v-if="tooltip != null"
    :style="{ right: tooltip.x + 'px', bottom: tooltip.y + 'px' }"
    class="absolute bg-white text-sm text-[#2f3241]"
  >
    {{ tooltip.text }}
  </div>
  <!--   <ViewDesk></ViewDesk> -->
</template>
v-if="viewDesk"
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
import { svgs } from './svg'

const socketConnected = ref(false)

const deskConnected = ref(false)
const apConnected = ref(false)
const serverConnected = ref(false)

const dateNow = new Date().getTime()

const lastDeskUpdate = ref(dateNow)
const lastApUpdate = ref(dateNow)
const lastServerUpdate = ref(dateNow)

const height = ref(null)

const tooltip = ref(null)

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

const setQuitToolTip = () => {
  tooltip.value = { text: 'Quit app', x: 5, y: 35 }
}

const setLogOutToolTip = () => {
  tooltip.value = { text: 'Log out', x: 25, y: 35 }
}

const hideQuitToolTip = () => {
  tooltip.value = null
}
</script>

<style></style>
