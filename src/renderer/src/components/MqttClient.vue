<template>
  <div>
    <h1>MQTT Broker Monitor</h1>
    <h3>{{ url }}</h3>
    <button @click="connect" style="color: black">Connect</button>
    <h3>{{ connectStatus }}</h3>
    <!-- <Receiver :payload="payload" /> -->
    <span style="color: white; white-space: pre-line" @click="connect">{{ text }}</span>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import mqtt from 'mqtt'

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
    const connectStatus = ref('Not connected')

    const connect = () => {
      if (!client.value) {
        connectStatus.value = 'Connecting...'
        client.value = mqtt.connect(mosquittoUrl)
        client.value.on('connect', () => {
          console.log('connected')
          connectStatus.value = 'Connected'

          // Subscribe to broker
          client.value.subscribe('#', { qos: 0 }, (error) => {
            if (error) {
              console.log('Subscribe to topics error', error)
              return
            }
            console.log('Subscribe successful')
          })
        })
        client.value.on('error', (err) => {
          console.log('error')

          console.error('Connection error: ', err)
          client.value.end()
        })

        client.value.on('reconnect', () => {
          console.log('reconnect')

          connectStatus.value = 'Reconnecting'
        })

        client.value.on('message', (topic, message) => {
          console.log('mesage')

          const newPayload = { topic, message: message.toString() }
          const currentTime = getCurrentTime()
          if (!text.value.endsWith(currentTime)) {
            text.value = text.value + '\n' + currentTime
          }

          payload.value = newPayload
        })
      }
    }

    const getCurrentTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')

      return `${hours}:${minutes}`
    }

    onMounted(() => {})

    onBeforeUnmount(() => {
      /*   if (client.value) {
        client.value.end()
      } */
    })

    return {
      url,
      connect,
      connectStatus,
      text,
      payload
    }
  }
}
</script>
