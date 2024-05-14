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
        <input class="text-black" style="width: 200px" v-model="ssid" />
      </div>

      <div style="display: flex">
        <div style="width: 100px">password:</div>
        <input class="text-black" style="width: 200px" v-model="psk" />
      </div>
    </div>
    <div style="display: flex; align-items: center; width: 100%">
      <button @click="pair" class="rounded-button">Save</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { pairWithPi } from './api'

const emits = defineEmits(['getWifi'])

/* ssid="iPhoneJohannes"
        psk="12121212" */
const ssid = ref('Soul7')
const psk = ref('52868737320352956218')

const instructions = ref([
  'Enter your WiFi credentials below',
  'Press Save',
  'If saved successfully, connect back to your WiFi and reboot the Pi'
])

const pair = async () => {
  const userInfo = await window.electronAPI.getUserInfo()

  const wifi = await pairWithPi(ssid.value, psk.value, userInfo.userName, userInfo.id)
  console.log(wifi)
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
  background-color: white;
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
