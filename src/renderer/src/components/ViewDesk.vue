<template>
  <ReadNoInternet v-if="!props.socketConnected" />
  <ReadInstructions v-else-if="!props.deskConnected" />
  <div v-else class="rounded-lg shadow-lg p-4 bg-[#2f3241] mt-4 ml-4 w-[350px]">
    <div style="display: flex; flex-direction: column; gap: 10px; margin: 10px">
      <h3>Desk Controls</h3>
      <div style="display: flex; gap: 10px; align-items: center; width: 100%">
        <span v-for="b in buttons">
          <span v-if="b.svg" @click="b.onClick" class="control-button" v-html="b.svg"></span>
          <span v-else @click="b.onClick" class="control-button" style="font-size: 18px">{{
            b.title
          }}</span></span
        >
      </div>
      <h3>Height</h3>
      <div style="color: white; font-size: 50px; line-height: 1">{{ formattedHeight }}</div>
      <!-- <div style="width: 800px; height: 600px"><canvas id="lineChart"></canvas></div> -->
    </div>
  </div>
</template>

<script setup>
import { svgs } from './svg'
import { ref, computed, watch } from 'vue'
import ReadInstructions from './ReadInstructions.vue'
import ReadNoInternet from './ReadNoInternet.vue'
import { addLog } from './api.js'

const emits = defineEmits(['buttonClicked'])
const props = defineProps({
  height: String,
  deskUpdates: Array,
  deskConnected: Boolean,
  socketConnected: Boolean,
  userId: String
})

const formattedHeight = computed(() => {
  if (!props.height) return ''
  let formattedHeight = props.height / 10
  if (formattedHeight === Math.floor(formattedHeight)) {
    formattedHeight = formattedHeight.toString() + '.0'
  }
  return formattedHeight
})

const buttons = ref([
  {
    svg: svgs.chevronUp,
    onClick: () => {
      emits('buttonClicked', 'up')
      addLog(props.userId, 'up')
    }
  },
  {
    svg: svgs.chevronDown,
    onClick: () => {
      emits('buttonClicked', 'down')
      addLog(props.userId, 'down')
    }
  },
  {
    title: '1',
    onClick: () => {
      emits('buttonClicked', 'preset1')
      addLog(props.userId, 'preset1')
    }
  },
  {
    title: '2',
    onClick: () => {
      emits('buttonClicked', 'preset2')
      addLog(props.userId, 'preset2')
    }
  },
  {
    title: '3',
    onClick: () => {
      emits('buttonClicked', 'preset3')
      addLog(props.userId, 'preset3')
    }
  },
  {
    title: '4',
    onClick: () => {
      emits('buttonClicked', 'preset4')
      addLog(props.userId, 'preset4')
    }
  }
])
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
