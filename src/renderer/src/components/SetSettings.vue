<template>
  <div class="flex flex-col justify-center items-start w-full text-white p-4">
    <h1 class="text-[40px] mb-4">Settings</h1>
    <div class="flex" v-if="props.settings != null">
      <div class="mb-4 flex flex-col m-2">
        <span class="m-2 min-h-6" v-for="s in settingsList">{{ s.description }}</span>
      </div>
      <div class="mb-4 flex flex-col m-2">
        <span class="flex" v-for="s in settingsList"
          ><div
            v-if="s.type === 'toggle'"
            @click="emits('save', { [s.key]: !settings[s.key] })"
            class="w-10 h-10 text-white cursor-pointer"
            v-html="props.settings[s.key] ? svgs.toggleOn : svgs.toggleOff"
          ></div>
          <input
            v-if="s.type === 'number'"
            class="text-black w-[50px] m-2"
            :modelValue="settings[s.key]"
            @input="handleNumberInput($event, s.key)"
          />
          <span v-if="s.type === 'number'">min</span>
          <span v-if="s.key === 'downAfterMinutes' && settings[s.key]">
            <input
              class="text-black w-[50px] m-2"
              :modelValue="settings.standingMinutesUntilDown"
              @input="handleNumberInput($event, 'standingMinutesUntilDown')"
            />
            <span>min</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { svgs } from './svg'

const props = defineProps({
  settings: Object
})

const settingsList = ref([
  {
    description: 'Disable automatic desk movement',
    key: 'disable',
    type: 'toggle'
  },
  {
    description: 'Duration of absence until the desk moves up:',
    key: 'durationAbsence',
    type: 'number'
  },
  {
    description: 'Duration of sitting before a standing period is allowed to start:',
    key: 'durationSitting',
    type: 'number'
  },
  {
    description: 'Daily standing goal:',
    key: 'dailyGoal',
    type: 'number'
  },
  {
    description: 'Move desk up (in absence) even though the standing goals were reached',
    key: 'upEvenThoughGoalReached',
    type: 'toggle'
  },
  {
    description: 'Move the desk down (in absence) after the standing goal was reached',
    key: 'downWhenGoalReached',
    type: 'toggle'
  },
  {
    description: 'Move the desk down (in absence) after a specific number of standing minutes',
    key: 'downAfterMinutes',
    type: 'toggle'
  },
  {
    description: 'Define custom move events:'
  }
])

const emits = defineEmits(['save'])

const handleNumberInput = (event, key) => {
  const value = event?.target?.value
  if (value === null || value.length <= 0) return
  const number = Number(value)
  if (isNaN(number)) return
  emits('save', { [key]: number })
}
</script>

<style>
.text-red-500 {
  color: #f56565;
}
</style>
