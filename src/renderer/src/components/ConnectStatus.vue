<template>
  <div
    style="
      margin: 10px;
      margin-left: 7px;
      width: 24px;
      height: 24px;
      overflow: hidden;
      border-radius: 50%;
      background-color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #2f3241;
      position: absolute;
      top: 0;
      right: 30px;
      cursor: pointer;
    "
    :style="{
      backgroundColor: status === 0 ? 'white' : status === 1 ? 'white' : 'green'
    }"
    @click="showMenu = true"
    @mouseover="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <!-- <svg v-if="connectStatus === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M9,7L11,12L9,17H11L12,14.5L13,17H15L13,12L15,7H13L12,9.5L11,7H9Z" fill="#2f3241" />
      </svg> -->

    <svg
      v-if="status === 0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <path
        d="M12 18.5C12 19 12.07 19.5 12.18 20H6.5C5 20 3.69 19.5 2.61 18.43C1.54 17.38 1 16.09 1 14.58C1 13.28 1.39 12.12 2.17 11.1S4 9.43 5.25 9.15C5.67 7.62 6.5 6.38 7.75 5.43S10.42 4 12 4C13.95 4 15.6 4.68 16.96 6.04C18.32 7.4 19 9.05 19 11C20.15 11.13 21.1 11.63 21.86 12.5C22.1 12.76 22.29 13.05 22.46 13.36C21.36 12.5 20 12 18.5 12C18 12 17.5 12.07 17 12.18V11C17 9.62 16.5 8.44 15.54 7.46C14.56 6.5 13.38 6 12 6S9.44 6.5 8.46 7.46C7.5 8.44 7 9.62 7 11H6.5C5.53 11 4.71 11.34 4.03 12.03C3.34 12.71 3 13.53 3 14.5S3.34 16.29 4.03 17C4.71 17.66 5.53 18 6.5 18H12.03C12 18.17 12 18.33 12 18.5M23 18.5C23 21 21 23 18.5 23S14 21 14 18.5 16 14 18.5 14 23 16 23 18.5M20 21.08L15.92 17C15.65 17.42 15.5 17.94 15.5 18.5C15.5 20.16 16.84 21.5 18.5 21.5C19.06 21.5 19.58 21.35 20 21.08M21.5 18.5C21.5 16.84 20.16 15.5 18.5 15.5C17.94 15.5 17.42 15.65 17 15.92L21.08 20C21.35 19.58 21.5 19.06 21.5 18.5Z"
      />
    </svg>
    <img
      v-if="status === 1"
      src="../assets/Spinner-1s-200px.gif"
      alt="Round Image"
      style="width: 100%; height: 100%; object-fit: cover"
    />

    <svg
      v-if="status === 2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <path
        d="M13 19C13 19.34 13.04 19.67 13.09 20H6.5C5 20 3.69 19.5 2.61 18.43C1.54 17.38 1 16.09 1 14.58C1 13.28 1.39 12.12 2.17 11.1S4 9.43 5.25 9.15C5.67 7.62 6.5 6.38 7.75 5.43S10.42 4 12 4C13.95 4 15.6 4.68 16.96 6.04C18.32 7.4 19 9.05 19 11C20.15 11.13 21.1 11.63 21.86 12.5C22.37 13.07 22.7 13.71 22.86 14.42C21.82 13.54 20.5 13 19 13C18.89 13 18.79 13 18.68 13C18.62 13 18.56 13 18.5 13H17V11C17 9.62 16.5 8.44 15.54 7.46C14.56 6.5 13.38 6 12 6S9.44 6.5 8.46 7.46C7.5 8.44 7 9.62 7 11H6.5C5.53 11 4.71 11.34 4.03 12.03C3.34 12.71 3 13.53 3 14.5S3.34 16.29 4.03 17C4.71 17.66 5.53 18 6.5 18H13.09C13.04 18.33 13 18.66 13 19M17.75 19.43L16.16 17.84L15 19L17.75 22L22.5 17.25L21.34 15.84L17.75 19.43Z"
      />
    </svg>
  </div>
  <div
    v-if="showMenu"
    @click="showMenu = false"
    style="position: absolute; right: 40px; top: 0; left: 0; bottom: 0"
  >
    <div
      style="
        position: absolute;
        right: 0px;
        top: 20px;
        background-color: white;
        padding: 5px;
        display: flex;
        flex-direction: column;
        border-radius: 10px;
      "
    >
      <button
        v-if="status === 2"
        @click="emits('disconnect')"
        class="rounded-button"
        style="background-color: red; margin: 1px"
      >
        Disconnect
      </button>
      <button
        v-else
        @click="emits('connect')"
        class="rounded-button"
        style="background-color: green; margin: 1px"
      >
        Connect
      </button>
    </div>
  </div>
  <div
    v-if="showTooltip"
    style="
      position: absolute;
      right: 70px;
      top: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
    "
  >
    <span v-if="status === 2" style="font-size: 12px; color: #2f3241"
      >Connected to mqtt broker</span
    >
    <span v-if="status === 1" style="font-size: 12px; color: #2f3241"
      >Try connecting to desk controller</span
    >
    <span v-if="status === 0" style="font-size: 12px; color: #2f3241"
      >Disconnected from mqtt broker</span
    >
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showMenu = ref(false)
const showTooltip = ref(false)
const emits = defineEmits(['disconnect', 'connect'])
const props = defineProps({
  status: Number
})
</script>
