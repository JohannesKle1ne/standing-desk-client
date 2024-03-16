<template>
  <div v-if="true" style="position: relative; width: 100%; height: 100vh">
    <ConnectStatus @disconnect="disconnect" @connect="connect" :status="mqttStatus" />
    <DeskStatus @lookForDesk="lookForDesk" :status="deskStatus" />
    <TableControls @buttonClicked="publish" />
  </div>

  <div v-else>
    <div v-if="piLocalIp && false" style="display: flex; align-items: center; width: 100%">
      <h3 style="margin: 10px">Local network</h3>
      <span style="flex-grow: 1"></span>
      <button @click="updatePiWifi" class="rounded-button">update pi wifi</button>
    </div>

    <div style="display: flex; align-items: center; width: 100%">
      <h3 style="margin: 10px">Access point network</h3>
      <span style="flex-grow: 1"></span>
      <button @click="updatePiWifiAccessPoint" class="rounded-button">update pi wifi</button>
    </div>
    <div style="display: flex; align-items: center; width: 100%">
      <h3 style="margin: 10px">Access point network</h3>
      <span style="flex-grow: 1"></span>
      <button @click="connectPiWifiAccessPoint" class="rounded-button">
        connect pi to given wifi
      </button>
    </div>
    <div style="display: flex; align-items: center; width: 100%">
      <label for="ssid">SSID:</label>
      <input v-model="ssid" id="ssid" />

      <label for="password">Password:</label>
      <input v-model="password" id="password" />
    </div>
    <div
      style="
        margin-left: 10px;
        display: flex;
        align-items: center;
        justify-content: start;
        width: 100%;
        color: white;
        font-size: 12px;
      "
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import TableControls from './TableControls.vue'
import ConnectStatus from './ConnectStatus.vue'
import DeskStatus from './DeskStatus.vue'

import { ref, onMounted, computed } from 'vue'
import mqtt from 'mqtt'
import axios from 'axios'

const options = {
  protocol: 'wss',
  username: 'desk1',
  password: '1q2w3e4r-P'
}

//const mosquittoUrl = 'ws://192.168.178.23:9001'

const url = 'wss://c05856853e9043bea25080c1d6fc5a38.s2.eu.hivemq.cloud:8884/mqtt'

const client = ref(null)
const text = ref('')
const payload = ref({})
const deskAlive = ref(false)
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
const errorMessage = ref('')
const ssid = ref('Soul7')
const password = ref('52868737320352956218')
const piLocalIp = ref(null)

onMounted(() => {
  connect()
})

const disconnect = () => {
  if (!client.value) return
  mqttStatus.value = 1
  client.value.end()
}

const lookForDesk = () => {
  publish('confirm_presence')
  deskSearch.value = true
  console.log('set true')
  setTimeout(() => {
    deskSearch.value = false
    console.log('set false')
  }, 2000)
  //deskAlive.value = true
}

const connect = () => {
  mqttStatus.value = 1
  piLocalIp.value = null
  client.value = mqtt.connect(url, options)
  client.value.on('connect', () => {
    console.log('connected')
    mqttStatus.value = 2

    // Subscribe to broker
    client.value.subscribe('#', { qos: 0 }, (error) => {
      if (error) {
        console.log('Subscribe to topics error', error)
        return
      }
      console.log('Subscribe successful')
    })
    const topic = 'echo'
    const message = 'Echo to me!'
    client.value.publish(topic, message, (err) => {
      if (err) {
        console.error('Error publishing message:', err)
      } else {
        console.log(`Message "${message}" published to topic "${topic}"`)
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
    errorMessage.value = err.message

    client.value.end()
  })

  client.value.on('reconnect', () => {
    console.log('reconnect')

    mqttStatus.value = 1
  })

  client.value.on('message', (topic, message) => {
    if (message === 'present') {
      deskAlive.value = true
    }

    console.log('received: ' + message.toString())

    const extractIPAddress = (message) => {
      const ipv4Match = message.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/)
      const ipv6Match = message.match(/\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/)

      if (ipv4Match) {
        return ipv4Match[0]
      } else if (ipv6Match) {
        return ipv6Match[0]
      }

      return null // Return null if no match is found
    }
    const ipAddress = extractIPAddress(message.toString())
    if (ipAddress !== null) {
      piLocalIp.value = ipAddress
    }
  })
}

const updatePiWifiAccessPoint = async () => {
  const fileContent = `
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=DE

network={
   ssid="${ssid.value}"
   psk="${password.value}"
   key_mgmt=WPA-PSK
}`

  //10.0.0.5
  //192.168.178.69
  try {
    const response = await axios.post('http://10.0.0.5/update_wifi', {
      wpaSupplicant: fileContent
    })
    console.log(response.data)
  } catch (error) {
    console.error('Error getting data:', error)
  }
}

const connectPiWifiAccessPoint = async () => {
  try {
    const response = await axios.post('http://10.0.0.5/connect_wifi')
    console.log(response.data)
  } catch (error) {
    console.error('Error getting data:', error)
  }
}

const publish = async (message) => {
  const topic = 'X'
  if (!client.value || !client.value.connected) return
  client.value.publish(topic, message, (err) => {
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
