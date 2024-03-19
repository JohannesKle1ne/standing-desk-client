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
      right: 0;
      cursor: pointer;
    "
    :style="{
      backgroundColor: status === 0 ? 'white' : status === 1 ? 'white' : 'green'
    }"
    @click="buttonClick"
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
        d="M3 6H21C21.55 6 22 6.45 22 7C22 7.55 21.55 8 21 8V19H19V17H15V19H13V8H5V19H3V8C2.45 8 2 7.55 2 7C2 6.45 2.45 6 3 6M16 10.5V11H18V10.5C18 10.22 17.78 10 17.5 10H16.5C16.22 10 16 10.22 16 10.5M16 14.5V15H18V14.5C18 14.22 17.78 14 17.5 14H16.5C16.22 14 16 14.22 16 14.5Z"
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
        d="M3 6H21C21.55 6 22 6.45 22 7C22 7.55 21.55 8 21 8V19H19V17H15V19H13V8H5V19H3V8C2.45 8 2 7.55 2 7C2 6.45 2.45 6 3 6M16 10.5V11H18V10.5C18 10.22 17.78 10 17.5 10H16.5C16.22 10 16 10.22 16 10.5M16 14.5V15H18V14.5C18 14.22 17.78 14 17.5 14H16.5C16.22 14 16 14.22 16 14.5Z"
      />
    </svg>
  </div>
  <div
    v-if="showMenu"
    @click="showMenu = false"
    style="position: absolute; right: 10px; top: 0; left: 0; bottom: 0"
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
        @click="emits('lookForDesk')"
        class="rounded-button"
        style="background-color: green; margin: 1px"
      >
        Look for desk
      </button>
    </div>
  </div>
  <div
    v-if="showTooltip"
    style="
      position: absolute;
      right: 40px;
      top: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
    "
  >
    <span v-if="status === 2" style="font-size: 12px; color: #2f3241"
      >Connected to desk controller</span
    >
    <span v-if="status === 1" style="font-size: 12px; color: #2f3241"
      >Try connecting to desk controller</span
    >
    <span v-if="status === 0" style="font-size: 12px; color: #2f3241"
      >Disconnected from desk controller</span
    >
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emits = defineEmits(['lookForDesk'])
const showMenu = ref(false)
const showTooltip = ref(false)
const props = defineProps({
  status: Number
})

const buttonClick = () => {
  if (props.status === 0) {
    showMenu.value = true
  }
}
</script>
