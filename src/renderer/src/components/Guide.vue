<template>
  <div style="display: flex; flex-direction: column; gap: 10px; margin: 10px">
    <span><- Back</span>
    <h3>Guide</h3>
    <span>Initial paring with the controller</span>
    <span
      >If you have never connected to the DC do the following: 1. Plug DC to power supply 2. wait
      for 3 minutes until the pi is booted 3. Connect your computer to the wifi "DeskController".
      Enter the password "1234567890" 4. Enter you wifi credentails below 5. Press Save
    </span>
    <div style="display: flex; align-items: center; width: 100%">
      <button @click="updatePiWifiAccessPoint" class="rounded-button">Save</button>
    </div>

    <div style="display: flex; align-items: center; width: 100%">
      <label for="ssid">SSID:</label>
      <input v-model="ssid" id="ssid" />

      <label for="password">Password:</label>
      <input v-model="password" id="password" />
    </div>
    <span v-if="success">Successfully saved wifi credentils</span>
  </div>
</template>

<script setup>
import { svgs } from './svg'
import { ref, computed } from 'vue'
import axios from 'axios'

const emits = defineEmits(['buttonClicked'])
const props = defineProps({
  height: String
})

/* ssid="iPhoneJohannes"
        psk="12121212" */
const ssid = ref('Soul7')
const password = ref('52868737320352956218')

const success = ref(false)

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
    connectPiWifiAccessPoint()
  } catch (error) {
    console.error('Error getting data:', error)
  }
}

const connectPiWifiAccessPoint = async () => {
  try {
    const response = await axios.post('http://10.0.0.5/connect_wifi')
    console.log(response.data)
    success.value = true
  } catch (error) {
    console.error('Error getting data:', error)
  }
}
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
