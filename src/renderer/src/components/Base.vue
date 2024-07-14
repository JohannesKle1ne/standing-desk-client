<template>
  <div
    @click="hideWindow"
    class="w-7 h-7 absolute right-1 top-1 text-white cursor-pointer"
    v-html="svgs.close"
  ></div>

  <ReadNoInternet v-if="showNoInternet" />

  <Login @login="socketIo.connect()" @setRegisterFlag="registerFlag = true" v-if="showLogin" />
  <Register
    @registered="socketIo.connect()"
    @unsetRegisterFlag="registerFlag = false"
    v-if="showRegister"
  />
  <SetPresets @savePresets="savePresets" :settings="settings" v-if="showSetPresets" />
  <ReadInstructions v-if="showReadIntructions" />
  <EnterWifiCredentails v-if="showEnterWifiCredentails" />
  <ViewDesk
    @buttonClicked="sendCommand"
    @showStatistics="viewStatistics = true"
    :height="height"
    v-if="viewDesk"
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
<script setup>
import Login from './Login.vue'
import Register from './Register.vue'
import ReadInstructions from './ReadInstructions.vue'
import ReadNoInternet from './ReadNoInternet.vue'
import EnterWifiCredentails from './EnterWifiCredentails.vue'
import ViewDesk from './ViewDesk.vue'
import SetPresets from './SetPresets.vue'
import socketIo from './Socket.io'
import { piTest, checkServer, getSettings, setSettings } from './api.js'
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

const settings = ref(null)

const showSetPresets = computed(() => {
  return true
  const settingsObj = settings.value
  if (settingsObj == null) return false
  const { presetDown, presetUp } = settingsObj
  return presetDown == null || presetUp == null
})

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
  return (
    socketConnected.value && !deskConnected.value && !apConnected.value && !showSetPresets.value
  )
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
  fetchSettings()
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

const fetchSettings = async () => {
  const userInfo = await window.electronAPI.getUserInfo()
  const settingsObj = await getSettings(userInfo.id)
  console.log(settingsObj)
  settings.value = settingsObj || {}
}

const savePresets = async ({ presetDown, presetUp }) => {
  console.log({ presetDown, presetUp })
  const isValid = (value) => value && value <= 4 && value >= 1
  if (!isValid(presetDown) || !isValid(presetUp)) return
  saveSettings({ presetDown, presetUp })
}

const saveSettings = async (newSettings) => {
  if (newSettings == null || settings.value == null) return
  const userInfo = await window.electronAPI.getUserInfo()
  console.log({ ...settings.value, ...newSettings })
  const newDBSettings = await setSettings(userInfo.id, { ...settings.value, ...newSettings })
  console.log(newDBSettings)
  if (newDBSettings) {
    settings.value = newDBSettings
    console.log('new', settings.value)
  }
}
</script>

<style></style>
