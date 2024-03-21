<template>
  <div style="display: flex; flex-direction: column; gap: 10px; margin: 10px">
    <h3>Instructions</h3>
    <div style="color: white; display: flex; flex-direction: column; gap: 4px; font-size: 14px">
      <span v-for="(i, index) in instructions">{{
        (index > 1 ? `${index - 1}.` : '') + ' ' + i
      }}</span>
    </div>

    <div style="width: 100%; color: white">
      <div style="display: flex">
        <div style="width: 100px">ssid:</div>
        <input style="width: 200px" v-model="ssid" />
      </div>

      <div style="display: flex">
        <div style="width: 100px">password:</div>
        <input style="width: 200px" v-model="psk" />
      </div>
    </div>
    <div style="display: flex; align-items: center; width: 100%">
      <button @click="updatePiWifiAccessPoint" class="rounded-button">Save</button>
    </div>
    <span style="margin-top: 20px">Credentials saved on controller:</span>
    <div v-if="props.ssidPi && props.pskPi">
      {{ props.piCredentials }}
      <div style="display: flex">
        <div style="width: 100px">ssid:</div>
        <div style="width: 200px">{{ props.ssidPi }}</div>
      </div>

      <div style="display: flex">
        <div style="width: 100px">password:</div>
        <div style="width: 200px">{{ props.pskPi }}</div>
      </div>
    </div>
    <span v-else>no credentails found</span>
  </div>
</template>

<script setup>
import { svgs } from './svg'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const emits = defineEmits(['getWifi'])
const props = defineProps({
  pskPi: String,
  ssidPi: String,
  url: String
})

/* ssid="iPhoneJohannes"
        psk="12121212" */
const ssid = ref('')
const psk = ref('')

const instructions = ref([
  'Enter your wifi credentails below (the network your pc normally is connected to)',
  'Press Save',
  'If saved sucesfully, connect back to your wifi and reboot the pi'
])

const updatePiWifiAccessPoint = async () => {
  try {
    const response = await axios.post(props.url + '/update_wifi', {
      ssid: ssid.value,
      psk: psk.value
    })
    console.log(response.data)
    emits('getWifi')
  } catch (error) {
    console.error('Error getting data:', error)
  }
}

/* const connectPiWifiAccessPoint = async () => {
  try {
    const response = await axios.post(url.value + '/connect_wifi')
    console.log(response.data)
    success.value = true
  } catch (error) {
    console.error('Error getting data:', error)
  }
} */
</script>

<style>
.control-button {
  display: inline-block;
  border: none;
  border-radius: 2px; /* Adjust the border-radius for rounded corners */
  /* Set your desired text color */
  color: #2f3241;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
  background-color: white;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-button svg {
  width: 30px;
  height: 30px;
}
</style>
