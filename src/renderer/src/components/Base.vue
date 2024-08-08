<template>
  <div class="title-bar w-full flex items-end bg-[#2f3241]">
    <Navbar
      @showDesk="showDesk"
      @showStatistics="showStatistics"
      @showSettings="showSettings"
      @showUser="showUser"
      :currentPage="currentPage"
      v-if="!isBaseline"
    />
    <div class="text-white" v-if="isBaseline">
      {{ `Welcome ${userName}! You are currently in baseline mode` }}
    </div>
    <div class="grow"></div>
    <div
      @click="hideWindow"
      class="w-7 h-7 text-white cursor-pointer self-center"
      v-html="svgs.close"
    ></div>
  </div>

  <div v-if="apConnected || rebootTimeString" class="overlay">
    <EnterWifiCredentails @saved="startRebootTimer" :rebootTimeString="rebootTimeString" />
  </div>
  <div v-else-if="!userId && registerFlag" class="overlay">
    <Register @registered="handleNewUserId" @unsetRegisterFlag="registerFlag = false" />
  </div>
  <div v-else-if="!userId" class="overlay">
    <Login @login="handleNewUserId" @setRegisterFlag="registerFlag = true" />
  </div>
  <div v-else-if="missingPresetDefinitions" class="overlay">
    <SetPresets @savePresets="saveSettings" :settings="settings" />
  </div>
  <ViewDesk
    v-if="isDesk && !isBaseline"
    @buttonClicked="sendCommand"
    :height="height"
    :deskConnected="deskConnected"
    :socketConnected="socketConnected"
  />
  <ViewStatistics v-if="isStatistics && !isBaseline" />
  <SetSettings v-if="isSettings && !isBaseline" @save="saveSettings" :settings="settings" />
  <User v-if="isUser && !isBaseline" :userId="userId" :userName="userName" />

  <div
    @click="quitApp"
    class="w-7 h-7 absolute right-0 bottom-1 text-[#2f3241] cursor-pointer"
    v-html="svgs.quit"
    @mouseover="setQuitToolTip"
    @mouseleave="hideToolTip"
  ></div>
  <div
    @click="logOut"
    class="w-7 h-7 absolute right-8 bottom-1 text-[#2f3241] cursor-pointer"
    v-html="svgs.logOut"
    @mouseover="setLogOutToolTip"
    @mouseleave="hideToolTip"
  ></div>
  <div
    v-if="tooltip != null"
    :style="{ right: tooltip.x + 'px', bottom: tooltip.y + 'px' }"
    class="absolute bg-white text-sm text-[#2f3241]"
  >
    {{ tooltip.text }}
  </div>
  <!--   <input type="text" v-model="forceHeight" />
  <button @click="forceWriteHeight">set height</button> -->
</template>
<script setup>
import Login from './Login.vue'
import Register from './Register.vue'
import User from './User.vue'
import EnterWifiCredentails from './EnterWifiCredentails.vue'
import ViewDesk from './ViewDesk.vue'
import SetPresets from './SetPresets.vue'
import socketIo from './socket.io'
import { piTest, checkServer, getSettings, setSettings, getBaseline } from './api.js'
import { ref, onMounted, computed } from 'vue'
import { svgs } from './svg'
import SetSettings from './SetSettings.vue'
import ViewStatistics from './ViewStatistics.vue'
import Navbar from './Navbar.vue'
import { PAGE } from './definitions.js'

const isBaseline = ref(false)

const currentPage = ref(null)
const userId = ref(null)
const userName = ref(null)

const forceHeight = ref(null)

const forceWriteHeight = () => {
  console.log(forceHeight.value)
  socketIo.sendForceHeight(forceHeight.value)
}

const rebootSecondsPassed = ref(0)

let interval = null

const startRebootTimer = () => {
  clearInterval(interval)
  interval = setInterval(() => {
    rebootSecondsPassed.value += 1
    console.log(rebootSecondsPassed.value)
    if (rebootSecondsPassed.value >= 120) {
      restartApp()
    }
  }, 1000)
}

const rebootTimeString = computed(() => {
  if (rebootSecondsPassed.value === 0) return
  const secondsLeft = 120 - rebootSecondsPassed.value
  // Calculate the minutes and seconds
  const minutes = Math.floor(secondsLeft / 60)
  const remainingSeconds = secondsLeft % 60

  // Pad the minutes and seconds with leading zeros if necessary
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(remainingSeconds).padStart(2, '0')

  // Return the formatted string
  return `${paddedMinutes}:${paddedSeconds}`
})

const socketConnected = ref(false)

const deskConnected = ref(false)
const apConnected = ref(false)

const dateNow = new Date().getTime()

const lastDeskUpdate = ref(dateNow)
const lastApUpdate = ref(dateNow)
const lastServerUpdate = ref(dateNow)

const height = ref(null)

const tooltip = ref(null)

const registerFlag = ref(false)

const settings = ref(null)

const isDesk = computed(() => {
  return currentPage.value === PAGE.DESK_CONTROLS
})

const isStatistics = computed(() => {
  return currentPage.value === PAGE.STATISTICS
})

const isSettings = computed(() => {
  return currentPage.value === PAGE.SETTINGS
})

const isUser = computed(() => {
  return currentPage.value === PAGE.USER
})

const missingPresetDefinitions = computed(() => {
  const settingsObj = settings.value
  if (settingsObj == null) return false
  const { presetDown, presetUp } = settingsObj
  return presetDown === 'DEFAULT' || presetUp === 'DEFAULT'
})

const handleNewUserId = async () => {
  const info = await window.electronAPI.getUserInfo()
  userName.value = info?.userName
  userId.value = info?.id
  if (userId.value) {
    isBaseline.value = await getBaseline(userId.value)
    console.log(isBaseline.value)
  }
  socketIo.connect(userId.value)
  fetchSettings(userId.value)
}

const setPage = async (newPage) => {
  /*   const enterPage = (page) => {
    currentPage.value !== page && newPage === page
  } */

  /*   if (enterPage(PAGE.DESK_CONTROLS)) {
    await window.electronAPI.setWindowBounds({ width: 500, height: 200 })
  }
  if (enterPage(PAGE.SETTINGS)) {
    await window.electronAPI.setWindowBounds({ width: 500, height: 500 })
  } */
  currentPage.value = newPage
}

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

const checkStatus = async () => {
  const now = new Date().getTime()
  if (!deskConnected.value) {
    lookForPi(now)
  }
  if (now - lastApUpdate.value > 6000) {
    apConnected.value = false
  }
}

onMounted(async () => {
  const info = await window.electronAPI.getUserInfo()
  userName.value = info?.userName
  userId.value = info?.id
  if (userId.value) {
    isBaseline.value = await getBaseline(userId.value)
    console.log(isBaseline.value)
  }

  if (isBaseline.value) return

  showDesk()
  fetchSettings(userId.value)
  await socketIo.connect(userId.value)
  socketIo.onConnected(() => {
    socketConnected.value = true
    socketIo.requestState()
  })
  socketIo.onDisconnected(() => {
    socketConnected.value = false
    deskConnected.value = false
  })
  socketIo.onHeightMessage((newHeight) => {
    console.log(newHeight)
    height.value = newHeight
  })
  socketIo.onPiConnect(() => {
    console.log('pi has disconnected')
    deskConnected.value = true
  })
  socketIo.onPiDisconnect(() => {
    console.log('pi has connected')
    deskConnected.value = false
  })

  checkStatus()
  setInterval(checkStatus, 3000)
})

const logOut = async () => {
  await window.electronAPI.logOut()
}

const restartApp = async () => {
  await window.electronAPI.restart()
}

const hideWindow = async () => {
  await window.electronAPI.hideWindow()
}

const quitApp = async () => {
  await window.electronAPI.quitApp()
}

const showDesk = async () => {
  setPage(PAGE.DESK_CONTROLS)
}
const showStatistics = async () => {
  setPage(PAGE.STATISTICS)
}
const showSettings = async () => {
  setPage(PAGE.SETTINGS)
}
const showUser = async () => {
  setPage(PAGE.USER)
}

const setQuitToolTip = () => {
  tooltip.value = { text: 'Quit app', x: 5, y: 35 }
}
const setSettingsToolTip = () => {
  tooltip.value = { text: 'Settings', x: 45, y: 35 }
}

const setLogOutToolTip = () => {
  tooltip.value = { text: 'Log out', x: 25, y: 35 }
}

const hideToolTip = () => {
  tooltip.value = null
}

const fetchSettings = async (userId) => {
  if (userId == null) return
  const settingsObj = await getSettings(userId)
  settings.value = settingsObj || {}
}

const saveSettings = async (newSettings) => {
  console.log(newSettings)
  /*   settings.value = { ...settings.value, ...newSettings } */
  console.log(settings.value)
  if (newSettings == null || settings.value == null) return
  const newDBSettings = await setSettings(userId.value, { ...settings.value, ...newSettings })
  if (newDBSettings) {
    settings.value = newDBSettings
    console.log('new', settings.value)
  }
}
</script>

<style>
.title-bar {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.title-bar > * {
  -webkit-user-select: text;
  -webkit-app-region: no-drag;
}

.overlay {
  @apply w-full h-full bg-[#2f3241] absolute right-0 top-0 left-0 bottom-0 z-10;
}
</style>
