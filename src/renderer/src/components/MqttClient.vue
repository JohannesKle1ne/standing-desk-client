<template>
  <div style="display: flex; align-items: center; width: 100%">
    <h3 style="margin: 10px">MQTT</h3>
    <span style="flex-grow: 1"></span>
    <button @click="handleClick" class="rounded-button">
      {{ connectStatus === 2 ? 'disconnect' : 'connect' }}
    </button>
    <div
      style="
        margin: 10px;
        margin-left: 7px;
        width: 21.5px;
        height: 21.5px;
        overflow: hidden;
        border-radius: 50%;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #2f3241;
      "
      :style="{
        backgroundColor: connectStatus === 0 ? 'white' : connectStatus === 1 ? 'white' : 'green'
      }"
    >
      <!-- <svg v-if="connectStatus === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M9,7L11,12L9,17H11L12,14.5L13,17H15L13,12L15,7H13L12,9.5L11,7H9Z" fill="#2f3241" />
      </svg> -->
      <svg
        v-if="connectStatus === 0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="12"
        height="12"
      >
        <path
          d="M16,9V11H8V9H10V8H4V10H2V2H4V4H12A2,2 0 0,1 14,6V9H16M10,15V18A2,2 0 0,0 12,20H20V22H22V14H20V16H14V15H16V13H8V15H10Z"
          fill="#2f3241"
        />
      </svg>
      <img
        v-if="connectStatus === 1"
        src="../assets/Spinner-1s-200px.gif"
        alt="Round Image"
        style="width: 100%; height: 100%; object-fit: cover"
      />
      <svg
        v-if="connectStatus === 2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
      >
        <path
          d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
          fill="#2f3241"
        />
      </svg>
    </div>
  </div>
  <div style="display: flex; align-items: center; width: 100%">
    <h3 style="margin: 10px">AP pi zero</h3>
    <span style="flex-grow: 1"></span>
    <button @click="connectToPi" class="rounded-button">connect to pi</button>
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
  <!--   <h3>{{ url }}</h3>
 -->
  <!--  <button @click="connect" style="color: black">Connect</button>
  <h3>{{ connectStatus }}</h3>-->
  <div style="margin: 10px 10px 10px 10px">
    <span style="color: white; white-space: pre-line" @click="connect">{{ text }}</span>
  </div>
</template>

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
  transform: scale(1.1);
}
.rounded-button:focus {
  outline: none; /* Removes the default focus outline */
  /* Add any other styles you want to remove for the focused state */
}
</style>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import mqtt from 'mqtt'
import axios from 'axios'

const options = {
  protocol: 'wss',
  username: 'desk1',
  password: '1q2w3e4r-P'
}

const mosquittoUrl = 'ws://192.168.178.23:9001'

const url = 'wss://c05856853e9043bea25080c1d6fc5a38.s2.eu.hivemq.cloud:8884/mqtt'

export default {
  setup() {
    const client = ref(null)
    const text = ref('')
    const payload = ref({})
    const connectStatus = ref(0)
    const errorMessage = ref('')

    setInterval(() => {
      const topic = 'your/topic'
      const message = 'Hello, MQTT!'
      if (!client.value || !client.value.connected) return
      client.value.publish(topic, message, (err) => {
        if (err) {
          console.error('Error publishing message:', err)
        } else {
          console.log(`Message "${message}" published to topic "${topic}"`)
        }
      })
    }, 5000)

    const handleClick = () => {
      errorMessage.value = ''
      console.log(connectStatus.value)
      if (connectStatus.value === 2) {
        disconnect()
        return
      }
      connect()
    }

    const disconnect = () => {
      if (!client.value) return
      connectStatus.value = 1
      client.value.end()
    }

    const connect = () => {
      connectStatus.value = 1
      client.value = mqtt.connect(url, options)
      client.value.on('connect', () => {
        console.log('connected')
        connectStatus.value = 2

        // Subscribe to broker
        client.value.subscribe('#', { qos: 0 }, (error) => {
          if (error) {
            console.log('Subscribe to topics error', error)
            return
          }
          console.log('Subscribe successful')
        })
      })
      client.value.on('end', () => {
        connectStatus.value = 0
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

        connectStatus.value = 1
      })

      client.value.on('message', (topic, message) => {
        console.log('mesage')

        const currentTime = getCurrentTime()
        if (!text.value.endsWith(currentTime)) {
          text.value = `${text.value}\n${currentTime} ${topic.toString()} ${message.toString()}`
        }

        const maxLineBreaks = 10
        // Ensure text contains a maximum of 10 line breaks
        const lines = text.value.split('\n')
        if (lines.length > maxLineBreaks) {
          // Remove time substrings at the beginning of the text
          const filteredLines = lines.slice(lines.length - maxLineBreaks)
          text.value = filteredLines.join('\n')
        }
      })
    }

    const getCurrentTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')

      return `${hours}:${minutes}:${seconds}`
    }

    const connectToPi = async () => {
      const fileContent = `
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=DE

network={
   ssid="Soul7"
   psk="52868737320352956218"
   key_mgmt=WPA-PSK
}`

      //10.0.0.5
      //192.168.178.69
      try {
        const response = await axios.post('http://192.168.178.69/update_wifi', {
          wpaSupplicant: fileContent
        })
        console.log(response.data)
      } catch (error) {
        console.error('Error getting data:', error)
      }
    }

    const rebootPi = async () => {
      try {
        const response = await axios.post('http://192.168.178.69/reboot')
        console.log(response.data)
      } catch (error) {
        console.error('Error getting data:', error)
      }
    }

    onMounted(() => {})

    onBeforeUnmount(() => {
      /*   if (client.value) {
        client.value.end()
      } */
    })

    return {
      url,
      handleClick,
      connectStatus,
      text,
      payload,
      errorMessage,
      connectToPi
    }
  }
}
</script>
