<template>
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
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
    "
    :style="{
      backgroundColor: status === 0 ? 'white' : connectStatus === 1 ? 'white' : 'green'
    }"
    @click="showTooltip = true"
  >
    <!-- <svg v-if="connectStatus === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M9,7L11,12L9,17H11L12,14.5L13,17H15L13,12L15,7H13L12,9.5L11,7H9Z" fill="#2f3241" />
      </svg> -->
    <svg
      v-if="status === 0"
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
        d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
        fill="#2f3241"
      />
    </svg>
  </div>
  <div
    v-if="showTooltip"
    @click="showTooltip = false"
    style="position: absolute; right: 0; top: 0; left: 0; bottom: 0"
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
</template>

<script setup>
import { ref } from 'vue'
const showTooltip = ref(false)
const emits = defineEmits(['disconnect', 'reconnect'])
const props = defineProps({
  status: Number
})
</script>
