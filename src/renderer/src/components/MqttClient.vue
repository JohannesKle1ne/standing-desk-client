<template>
  <div v-if="true" style="position: relative; width: 100%; height: 100vh; display: flow-root">
    <ConnectStatus @disconnect="disconnect" @connect="connect" :status="mqttStatus" />
    <DeskStatus :status="deskStatus" />
    <!--  <GuideMqtt
      v-if="!mqttConnected && !apConnected && !deskConnected"
      @buttonClicked="publish"
      :height="height"
    /> -->
    <GuideAP v-if="!apConnected && !deskConnected" @buttonClicked="publish" :height="height" />
    <GuideWifi
      v-if="apConnected && !deskConnected"
      :ssidPi="ssidPi"
      :pskPi="pskPi"
      :url="urlAP"
      @getWifi="getWifi"
    />
    <!--  <TableControls
      v-if="deskConnected"
      @buttonClicked="publish"
      :deskUpdates="deskUpdates"
      :height="height"
    /> -->
    <!--  <div v-if="deskConnected">
      <div>Is present:</div>
      <h1 :style="{ color: isPresent ? 'green' : 'red' }">{{ isPresent ? 'Yes' : 'No' }}</h1>
    </div> -->
  </div>

  <div v-else>
    <div v-if="piLocalIp && false" style="display: flex; align-items: center; width: 100%">
      <h3 style="margin: 10px">Local network</h3>
      <span style="flex-grow: 1"></span>
      <button @click="updatePiWifi" class="rounded-button">update pi wifi</button>
    </div>
  </div>
</template>

<script setup>
import ConnectStatus from './ConnectStatus.vue'
import DeskStatus from './DeskStatus.vue'
import GuideAP from './GuideAP.vue'
import GuideWifi from './GuideWifi.vue'
import axios from 'axios'

import { ref, onMounted, computed } from 'vue'
import mqtt from 'mqtt'

const options = {
  protocol: 'wss',
  username: 'desk1',
  password: '1q2w3e4r-P'
}

//const mosquittoUrl = 'ws://192.168.178.23:9001'
//const urlAP = 'http://192.168.178.69'

const url = 'wss://c05856853e9043bea25080c1d6fc5a38.s2.eu.hivemq.cloud:8884/mqtt'

const deskUpdates = ref([])
const client = ref(null)
const deskAlive = ref(false)
const lastDeskAlive = ref(0)
const isPresent = ref(false)

const apConnected = ref(false)
const lastApAlive = ref(0)
const height = ref(0)

const ssidPi = ref('')
const pskPi = ref('')

const deskSearch = ref(false)
const mqttStatus = ref(0)
const deskStatus = computed(() => {
  if (mqttStatus.value === 2 && deskAlive.value) {
    return 2
  }
  if (mqttStatus.value === 2 && !deskAlive.value && deskSearch.value) {
    return 1
  }
  return 0
})

const deskConnected = computed(() => {
  return deskStatus.value === 2
})
const mqttConnected = computed(() => {
  return mqttStatus.value === 2
})

const piLocalIp = ref(null)
const id = ref(null)

onMounted(async () => {
  const myId = await window.electronAPI.getId()
  console.log('my id: ' + myId)
  id.value = myId

  connect()
})

const getWifi = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: urlAP + '/get_wifi',
      timeout: 3000
    })
    console.log(response.data)
    ssidPi.value = response.data.ssid
    pskPi.value = response.data.psk
    lastApAlive.value = new Date().getTime()
    apConnected.value = true
  } catch (error) {
    console.log('Error reaching pi ap')
  }
}

const disconnect = () => {
  if (!client.value) return
  mqttStatus.value = 1
  client.value.end()
}

/* const lookForDesk = () => {
  publish('confirm_presence')
  deskSearch.value = true
  console.log('set true')
  setTimeout(() => {
    deskSearch.value = false
    console.log('set false')
  }, 2000)
  //deskAlive.value = true
} */

const connect = () => {
  mqttStatus.value = 1
  piLocalIp.value = null
  client.value = mqtt.connect(url, options)
  client.value.on('connect', () => {
    console.log('connected')
    mqttStatus.value = 2

    // Subscribe to broker
    client.value.subscribe(id.value, { qos: 0 }, (error) => {
      if (error) {
        console.log('Subscribe error', error)
      }
    })
    const message = 'Hello from vue'
    client.value.publish(id.value, message, (err) => {
      if (err) {
        console.error('Error publishing message:', err)
      }
    })
  })
  client.value.on('end', () => {
    mqttStatus.value = 0
    console.log('MQTT client is fully disconnected')
  })
  client.value.on('offline', () => {
    console.log('MQTT client is offline')
  })
  client.value.on('error', (err) => {
    console.log('error')
    console.log('Connection error: ', err.message)
    console.log('Connection error: ', err.code)
    console.log('Connection error: ', err.stack)

    client.value.end()
  })

  client.value.on('reconnect', () => {
    console.log('reconnect')

    mqttStatus.value = 1
  })

  let lastPresence = new Date().getTime()
  let breaks = []

  const convertTimeStampToReadable = (timeStamp) => {
    // Create a new Date object with the provided time stamp
    var date = new Date(timeStamp)

    // Extract hours, minutes, and seconds from the date object
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()

    // Add leading zeros if necessary
    hours = (hours < 10 ? '0' : '') + hours
    minutes = (minutes < 10 ? '0' : '') + minutes
    seconds = (seconds < 10 ? '0' : '') + seconds

    // Return the readable representation
    return hours + ':' + minutes + ':' + seconds
  }

  client.value.on('message', (topic, message) => {
    console.log(`received: ${message.toString()}`)

    const newHeight = getHeight(message)
    if (newHeight) {
      height.value = newHeight
    }
    const presence = getPresence(message)
    if (presence != null) {
      isPresent.value = presence
      const now = new Date().getTime()
      if (presence) {
        lastPresence = now
      }
      if (now - lastPresence > 1000 * 60 * 2) {
        breaks = breaks.filter((b) => b.from !== convertTimeStampToReadable(lastPresence))
        breaks.push({
          from: convertTimeStampToReadable(lastPresence),
          to: convertTimeStampToReadable(now)
        })
        console.log(breaks)
      }
    }

    const alive = getAlive(message)
    if (alive != null || presence != null || newHeight != null) {
      deskAlive.value = true
      lastDeskAlive.value = new Date().getTime()
    }

    const status = getStatus(message)
    console.log(status)
    if (status) {
      deskUpdates.value = [...deskUpdates.value, status]
      console.log(deskUpdates.value)
    }
  })
}

const getHeight = (message) => {
  try {
    const messageString = message.toString()
    const messageObj = JSON.parse(messageString)
    return messageObj?.height
  } catch (error) {
    return null
  }
}
const getAlive = (message) => {
  try {
    const messageString = message.toString()
    const messageObj = JSON.parse(messageString)
    return messageObj?.alive
  } catch (error) {
    return null
  }
}

const getStatus = (message) => {
  try {
    const messageString = message.toString()
    const messageObj = JSON.parse(messageString)
    if ('present' in messageObj && 'deskUp' in messageObj && 'timestamp' in messageObj) {
      return messageObj
    }
    return null
  } catch (error) {
    return null
  }
}

const getPresence = (message) => {
  try {
    const messageString = message.toString()
    const messageObj = JSON.parse(messageString)
    return messageObj?.present
  } catch (error) {
    return null
  }
}

const publish = async (message) => {
  if (!client.value || !client.value.connected) return
  client.value.publish(id.value, message, (err) => {
    if (err) {
      console.error('Error publishing message:', err)
    } else {
      console.log(`Sent: "${message}"`)
    }
  })
}
</script>

<style>
.rounded-button {
  display: inline-block;
  padding: 4px 8px; /* Adjust the padding as needed */
  border: none;
  border-radius: 20px; /* Adjust the border-radius for rounded corners */
  /* Set your desired text color */
  color: #2f3241;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
}

/* Add a hover effect */
.rounded-button:hover {
  transform: scale(1.05);
}
.rounded-button:focus {
  outline: none; /* Removes the default focus outline */
  /* Add any other styles you want to remove for the focused state */
}
</style>
./GuideWifi.vue
