<template>
  <div class="flex flex-col justify-center items-start w-full text-[#2f3241] p-4">
    <div v-if="props.settings" class="mb-4 w-full h-[90vh] overflow-auto custom-scrollbar">
      <span class="flex items-center h-10" v-for="s in settingsList">
        <span class="w-3/4">{{ s.description }}</span>
        <div class="grow"></div>

        <div
          v-if="s.type === 'toggle'"
          @click="emits('save', { [s.key]: !props.settings[s.key] })"
          class="w-10 text-[#2f3241] cursor-pointer"
          :style="{ opacity: props.settings[s.key] ? 1 : 0.5 }"
          v-html="props.settings[s.key] ? svgs.toggleOn : svgs.toggleOff"
        ></div>
        <input
          v-if="s.type === 'number'"
          class="text-[#2f3241] w-[50px] border-2 focus:outline-none focus:border-[#2f3241]"
          :value="props.settings[s.key]"
          @input="handleNumberInput($event, s.key)"
        />
        <span v-if="s.type === 'number'" class="ml-2">{{ s.timeUnit }}</span>
        <span v-if="s.key === 'downAfterMinutes' && props.settings[s.key]">
          <input
            class="text-[#2f3241] w-[50px] ml-2"
            :value="props.settings.standingMinutesUntilDown"
            @input="handleNumberInput($event, 'standingMinutesUntilDown')"
          />
          <span class="ml-2">min</span>
        </span>
        <span v-if="s.key === 'moveEvents'" class="text-[#2f3241]">
          <select v-model="selectedTime">
            <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
          </select>
          <select v-model="selectedDirection" class="ml-2">
            <option v-for="direction in directionOptions" :key="direction" :value="direction">
              {{ direction }}
            </option>
          </select>
          <button class="rounded-button ml-2" @click="add">Add</button>
        </span>
      </span>
      <!-- <button
        v-for="(m, index) in props.settings.moveEvents"
        class="rounded-button w-32 relative mr-2"
        style="cursor: default"
      >
        {{ `${m.time} ${m.direction}` }}
        <div
          @click="remove(index)"
          class="w-4 cursor-pointer absolute right-1 top-1"
          v-html="svgs.removeTab"
        ></div>
      </button> -->
    </div>
  </div>
</template>

<script setup>
import { svgs } from './svg'
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  settings: Object
})
const emits = defineEmits(['save'])

const settingsList = ref([
  {
    description: 'Disable automatic desk movement',
    key: 'disable',
    type: 'toggle'
  },
  {
    description: 'Preset number for moving down',
    key: 'presetDown',
    type: 'number'
  },
  {
    description: 'Preset number for moving up',
    key: 'presetUp',
    type: 'number'
  },
  {
    description: 'Duration of absence until the desk moves',
    key: 'durationAbsence',
    type: 'number',
    timeUnit: 'min'
  },
  {
    description: 'Duration of sitting before a standing period is allowed to start',
    key: 'durationSitting',
    type: 'number',
    timeUnit: 'min'
  },
  {
    description: 'Daily standing goal',
    key: 'dailyGoal',
    type: 'number',
    timeUnit: 'min'
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
  }
  /*  {
    description: 'Define custom move events:',
    key: 'moveEvents'
  } */
])

const selectedTime = ref('')
const selectedDirection = ref('')
const timeOptions = ref([])
const directionOptions = ref(['up', 'down'])

const generateTimeOptions = () => {
  const times = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 1) {
      const hour = i.toString().padStart(2, '0')
      const minute = j.toString().padStart(2, '0')
      times.push(`${hour}:${minute}`)
    }
  }
  timeOptions.value = times
}

onMounted(() => {
  generateTimeOptions()
})

const handleNumberInput = (event, key) => {
  const value = event?.target?.value
  if (value === '' || value == null) {
    emits('save', { [key]: null })
    return
  }
  const number = Number(value)
  if (!isNaN(number)) {
    emits('save', { [key]: number })
  }
}
const add = () => {
  if (selectedTime.value === '' || timeOptions.value === '') return

  const newMoveEvents = [
    ...(props.settings.moveEvents || []),
    {
      time: selectedTime.value,
      timeInMilliseconds: timeToMilliseconds(selectedTime.value),
      direction: selectedDirection.value
    }
  ]
  emits('save', { moveEvents: newMoveEvents })
}

const remove = (index) => {
  // Create a copy of the moveEvents array
  const newMoveEvents = [...props.settings.moveEvents]

  // Remove the element at the specified index
  newMoveEvents.splice(index, 1)

  // Emit the updated moveEvents array
  emits('save', { moveEvents: newMoveEvents })
}

const timeToMilliseconds = (time) => {
  console.log(time)
  // Split the input time into hours and minutes
  const [hours, minutes] = time.split(':').map(Number)

  // Calculate the milliseconds from hours and minutes
  const milliseconds = hours * 60 * 60 * 1000 + minutes * 60 * 1000

  return milliseconds
}
</script>

<style></style>
